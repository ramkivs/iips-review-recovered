# IID Stage 5 — D10 / P6-B real browser acceptance: prerequisite reconciliation and operator procedure (PREPARED, NOT EXECUTED)

**Record type:** prerequisite reconciliation (P6-A §10) and operator-executed browser procedure for D10 /
P6-B — the last open Stage 5 item that is not an optional mint or an IPD-owned publication
**Prepared:** 2026-11-22 (UTC)
**Repository:** `ramkivs/iips-review-recovered` (IRR). **Build pair:** IRR ≥ `a6df94ff…` (any later `main`
that does not touch `frontend/src/features/user-portfolios/**` or `frontend/src/api/userPortfolios.ts`;
current `main@a2fa6823…` qualifies) / IPD `main@cbb116d2a221b82a704b4b96cf17efe0560e2498`
**Authority:** `IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md`; P6-A
`IID-P6A-RUNTIME-DEPENDENCY-ASSESSMENT-2026-11-09.md` §10; roadmap Part C §C.8
**Classification:** Local / Single User / Non-Production. Production admission **NOT ADMITTED**.
**Status of this document:** the journey below has **not** been executed. No browser, DOM, console, network or
screenshot observation exists for it. Nothing here is a result.

> **What this document is.** P6-A §10 lists seven prerequisites for P6-B. §2 reconciles each against the
> evidence actually published (no prerequisite is taken as satisfied because the transport-environment
> readiness returned `YES`), finds 1–6 evidenced and 7 open, and §4–§9 give the operator the exact
> journey for 7, derived from the implemented routes, components and HTTP contract — not from the handoff's
> expectations. **What it is not:** a Stage 5 acceptance, a change to any product file, a new automation
> framework, or a repetition of D5/D6/R-1 (which are done and are not to be rerun).

---

## 0. The one-page version

1. Nothing to install, build, restart or configure. The transport that served D5/D6 is still the one to use
   (PID `18424`, `127.0.0.1:8787`); the UI is `npm run dev` on `5173` (Stage 4 procedure §5) if not already up.
2. Open `http://localhost:5173/user-portfolios` with DevTools open. The browser surface for the Stage 5
   portfolio loop is **`/user-portfolios` → `/user-portfolios/DHAN_PORTFOLIO`** (list → detail → status
   summary with revision history). It is **not** `/personal-portfolio`, which is the manual-entry editor and is
   live for writes on this host (evidence record §12.3) — **do not use any control on it**.
3. Compare what the page shows with what the transport already answered on 2026-11-22: two portfolios;
   `DHAN_PORTFOLIO` revision **1**, **64** holdings, digest `17b2b283…`; `PERSONAL-fa8ad7bc-…` revision **2**,
   **1** holding, digest `9e5dc076…` (evidence record §3, §5, §11.2).
4. Expect — and record as **expected** — that the detail's *Import contributions* section reads *"No import
   contributions recorded for this portfolio."* although the wire carries one `contributionLedger` entry: the
   UI renders `contributions` (empty on v2) and does **not** render `contributionLedger` (implementation record
   §8). That is a recorded UI capability gap, not a data defect and not a D6 failure.
5. Exercise the honest-refusal path with one read-only navigation to a non-existent id (§6.4). Do not provoke a
   503 by stopping IPD or changing settings.
6. Screenshots stay on the host (they contain real holdings). Publish only the §9 summary sheet.

---

## 1. Sources inspected for this document (IRR `main@a2fa6823…`; no host access)

| Source | What it supplied |
|---|---|
| `IID-P6A-RUNTIME-DEPENDENCY-ASSESSMENT-2026-11-09.md` §3 (D10 row), §8, §10 | the seven prerequisites, verbatim basis of §2 |
| `IID-STAGE-5-D5-D6-WINDOWS-EXECUTION-EVIDENCE-2026-11-22.md` §2, §3, §5, §11.1–§11.5, §12 | D5/D6 evidence; captured HTTP facts to compare against; R-1 transport-environment capture; the `IIPS_LOCAL_PERSONAL_USE` observation |
| `IID-STAGE-5-D5-D6-WINDOWS-EXECUTION-HANDOFF-2026-11-21.md` §3.3, §4.4, §9 | read-only scope; expected shapes; the P6-B row ("Personal Portfolio page renders the served v2 view; `contributionLedger` passed through unrendered") |
| `IID-STAGE-5-IRR-IPC-V2-R1-IMPLEMENTATION-RECORD-2026-11-21.md` §8 | "The browser UI does not render `contributionLedger`; it passes through `src/api/userPortfolios.ts` untouched" |
| `IID-NP04-FIRST-INFOSYS-PERSISTENCE-COMPLETION-2026-11-15.md` §4, §9.3 | stored Infosys assessment, separate-process read-back, dataset version; D10 row closure wording |
| `IID-STAGE4-WINDOWS-VERIFICATION-PROCEDURE-2026-11-16.md` §2, §5, §7, §11 | evidence-directory conventions, UI start, the Stage 4 browser checks (§7.1–§7.6) — **referenced, not duplicated** |
| `IIPS_v3.0_OWNER_CONTEXT_F3_BROWSER_ACCEPTANCE_RECORD.md` | precedent for how a browser acceptance is recorded (DOM/console/network/screenshots; evidence outside the repo, cited not committed); its puppeteer harness is **not** reused — P6-B requires a real operator browser |
| `frontend/src/app/App.tsx`, `src/app/navigation.ts` | routes `/user-portfolios`, `/user-portfolios/:portfolioId`, `/personal-portfolio`; nav labels *User Portfolios*, *Personal Portfolio* |
| `frontend/src/features/user-portfolios/UserPortfolioList.tsx`, `UserPortfolioDetail.tsx`, `PortfolioStatusSummary.tsx`, `UserPortfolioStates.tsx`, `portfolioPersistenceStatus.ts` | every heading, column, state text and `data-testid` quoted in §6 |
| `frontend/src/api/userPortfolios.ts` | the client calls (`GET /api/user-portfolios`, `/{id}`, `/{id}/revisions`), envelope/record admissibility, `UserPortfolioApiError` status mapping; `UserPortfolioView` carries no `contributionLedger` field |
| `frontend/src/api/investmentDiscovery.ts`, `investmentDisposition.ts`, `server/investment/disposition-transport.ts` | the two per-portfolio side reads the detail page issues (`/identities`, `/dispositions`) and their fail-closed statuses |
| `frontend/src/features/personal-portfolio/PersonalPortfolio.tsx` | confirms `/personal-portfolio` is a write-capable editor filtered to `PERSONAL-` ids — excluded from the journey |
| `frontend/server/investment/runtimeReadiness.ts` | what each readiness `[ok]` means (used in §2 so that `YES` is not over-read) |
| `frontend/package.json`, `vite.config.ts` | no Playwright/Cypress/puppeteer dependency or script exists in IRR; vitest + jsdom only; Vite proxies `/api` → `localhost:8787` |

Existing browser procedures in the repository: Stage 4 §7 covers company discovery, the assessment chain,
identity coverage, investment coverage, JS-free coverage views and change intelligence. **No existing
runbook covers the `/user-portfolios` list → detail → revision-history journey**, the comparison against the
captured v2 evidence, or the `contributionLedger` rendering distinction. That is why this document exists;
§6.6 reuses Stage 4 §7.2 by reference for the company bridge instead of restating it.

---

## 2. P6-A §10 prerequisite reconciliation

Status vocabulary: **EVIDENCED** (owner's required evidence exists in a published record), **OPEN** (not
evidenced; action stated). "Transport-env `[ok]`" refers to evidence record §12.2 and is never used as the
sole basis where P6-A asks for more than a configuration check.

| # | P6-A §10 requirement (verbatim intent) | Authoritative source(s) | Current evidence | Status | Exact remaining action | Evidence to capture |
|---|---|---|---|---|---|---|
| 1 | IPD binding provisioned and the IPC peer live; an actual portfolio read returns real holdings | evidence record §2 (IPD read-only verifier `VERIFIED`, DP-V1..V9), §3 (all in-scope routes `200` over v2), §5/§11.2 (four-source comparison PASS: `DHAN_PORTFOLIO` rev 1 / 64 holdings / digest `17b2b283…`); §11.1 (compiled-module hashes) | D5 **CONFIRMED**, D6 **DEMONSTRATED**; real holdings read through the IRR transport and independently by the W11 second-process capture | **EVIDENCED** | none (do not rerun). IPD's own publication of its confirmation remains IPD-owned and is not a P6-B prerequisite | — |
| 2 | Authoritative identity files installed; `IDENTITY_SOURCES_VALID` against real issuer data | readiness finding `identity-files` `[ok]` in both captures (§11.3, §12.2); Stage 4 procedure §10 / Stage 4 closure records (installed set measured by content digest; `O1` issuers resolve); Stage 4 §7.1 discovery browser checks executed | valid, real issuer data; measured | **EVIDENCED** (Stage 4 closure, preserved) | none | — |
| 3 | Both carriers (Reports owner-context, F-3 owner-context) materialised and accepted on the operator host | §12.2 findings 2 and 4 `[ok]` **in the serving process** (the product emits `[ok]` only when the resolver returns `…_ESTABLISHED`); §3.1 identity coverage `200` (F-3 carrier resolved indirectly); NP-04 record (Reports carrier in use for the Infosys mint) | both resolved by the resolver in the transport's environment | **EVIDENCED** | none | — |
| 4 | NP-04 path configured; ≥ 1 real-issuer assessment version stored **and read back in a separate process**; second version only if change comparison is exercised | NP-04 record §4 (Infosys `6b6e2316-…`, version 1, digest `f80c25de…`), §8 of the Stage 4 procedure / NP-04 record (separate-process chain read-back); §12.2 finding 3 `[ok]` (file present — content unverified by the diagnostic, by its own words) | stored and read back separately; **no second version** | **EVIDENCED for the base journey**; change comparison **OPEN and not exercised** | none for D10. The second comparable version stays open as its own Stage 5 item (genuine input change; not forced) — the journey therefore does **not** include the change timeline | §6.6 records the change-history link's behaviour only if followed (a `404 change-not-found` with one version is correct) |
| 5 | Fundamentals dataset imported and measured for the issuer under test | NP-04 record §4 (dataset version `sha256:bdfb2527…`, adequacy `SUFFICIENT / MATERIAL_CONCERNS` for Infosys); evidence record §3 (R-2: `/api/investment/coverage/investment` `200`, Stage 4 §7.4/§7.5 executed); §12.2 finding 7 `[ok]` (directory present — content unverified by the diagnostic) | measured for Infosys at mint time; coverage served | **EVIDENCED** | none | — |
| 6 | `npm run iid:readiness -- --strict` exits `0` on the operator host | evidence record §12 (`04-readiness-transport-exit.txt` = `0`; `04-readiness-transport-environment.txt` `READ-PATH READY: YES`, environment of PID `18424`) | exit 0 in the transport's own environment | **EVIDENCED** (necessary, not sufficient — NP-04 record §9.3) | none | — |
| 7 | A real browser journey is executed and recorded; until then no browser or end-to-end claim is admissible | this document §4–§9; Stage 4 §7 for the Stage 4 surfaces (already executed and closed — not repeated) | **none** for the portfolio journey | **OPEN — the remaining step** | execute §4–§8 once on the host; publish §9 | `D10-*.txt/.png` per §8; §9 summary |

**Reconciliation result.** Prerequisites 1–6 are evidenced by published records; none of them rests solely on
the transport-environment `YES`. Prerequisite 7 is open and is exactly the procedure below. Two items are
deliberately **outside** the journey: the second assessment version (open, not forced) and any write.

**One observation carried in (evidence record §12.3).** `IIPS_LOCAL_PERSONAL_USE` is set in the serving
transport. For this procedure the only consequence is §3 rule 3: the `/personal-portfolio` editor and the
write routes are live on this host, so the journey must not touch them.

---

## 3. Rules of the journey (read first)

1. **No install, build, pull, restart, or environment change.** If the transport or the UI is not running,
   start them exactly as Stage 4 procedure §4/§5 say and record that you did; do not alter `.env.local`.
2. **Reads only.** Every step below issues `GET`s. Record anything else that appears in the Network tab as a
   finding (§9 row F).
3. **Do not open `/personal-portfolio` for anything but looking**, and preferably not at all. It is a
   manual-entry editor whose *New portfolio*, *Save*, *Delete* and row controls are live on this host. Pressing
   any of them changes IPD state and voids the comparison baseline. It is not the P6-B surface.
4. **Do not fix anything during the journey.** A `503`, `404`, empty state or mismatch is recorded as
   observed (§7), with its screenshot, and the journey continues or stops as §7 says.
5. **Screenshots are evidence, not publications.** The holdings table shows real symbols, quantities and
   values. Every `.png` stays under the evidence root. The repository receives only the §9 summary (counts,
   statuses, digest prefixes, `data-testid` presence).
6. **Browser:** a real desktop browser the operator uses (Edge or Chrome on the Windows host). Not headless,
   not scripted. One fresh tab; DevTools (`F12`) open on the **Console** and **Network** panels **before** the
   first navigation, with *Preserve log* enabled in Network.

---

## 4. Step 0 — record the state (read-only, ~1 minute)

Same conventions as Stage 4 §2. Evidence root: the existing `C:\iips-evidence\IID-STAGE5-20261122\`; all
files of this procedure carry the prefix `D10-`.

```powershell
$Ev   = 'C:\iips-evidence\IID-STAGE5-20261122'
$Utf8 = New-Object System.Text.UTF8Encoding($false)
cd C:\path\to\iips-review-recovered          # the checkout the running transport was started from
[IO.File]::WriteAllText("$Ev\D10-00-checkout.txt", ((Get-Location).Path + "`r`n" + (git rev-parse HEAD) + "`r`n" + (git status --porcelain) + "`r`n" + (node --version)), $Utf8)
# the serving transport: still PID 18424?
Get-Process -Id 18424 -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, StartTime | Out-File "$Ev\D10-00-transport-process.txt" -Encoding utf8
```

If PID `18424` is gone, write what *is* listening on `8787` (`Get-NetTCPConnection -LocalPort 8787`) into the
same file and continue — the comparison in §6 is against stored IPD data, which does not depend on the
process identity. If nothing listens on `8787`, start the transport per Stage 4 §4.1 and record it.

Confirm the UI origin answers (start it per Stage 4 §5 if not):

```powershell
curl.exe -s -o NUL -w "ui: %{http_code}`n" http://localhost:5173/
```

---

## 5. Step 1 — the HTTP baseline this journey is compared against (no new capture)

Do **not** re-capture the `11-0x` bodies. The comparison values are those already of record:

| Fact | `DHAN_PORTFOLIO` | `PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2` | Record |
|---|---|---|---|
| portfolios returned by the list | 2 (both ids) | | evidence record §3 (`11-01`) |
| detail `revision` = latest history revision | **1** | **2** | §5 |
| `provenanceDigest` (detail = history) | `17b2b2833268222310c21f7b685d0ca5e595ebd6a62bda7f118a9c0c6b84781f` | `9e5dc076ebcceeed24b375296b5c27ad723f1a53cbe9489ae8c8d6af84e14de1` | §5, §11.2 |
| `totalHoldingsCount` / `holdings.length` / history `holdingsCount` | 64 / 64 / 64 | 1 / 1 / 1 | §5 |
| `contributions` | `[]` | `[]` | §5 (v2) |
| `contributionLedger` | present, 1 entry | present, 1 entry | §3, §5 |
| holdings identities route | `200` | `200` | §3 (`11-04`) |

If the live page disagrees with any of these, that is a **finding** (§7 row M) — the stored revision may have
moved since 2026-11-22 (e.g. if the editor was used). Record the disagreement; do not re-baseline silently.

---

## 6. Step 2 — the browser journey, in order

Each numbered step has one screenshot (`D10-NN-*.png`) and a line in `D10-journey.txt` of the form
`NN<TAB>route<TAB>what was seen<TAB>network statuses<TAB>console errors (count)`.

### 6.1 Open the application and reach the list from the navigation

1. Navigate to `http://localhost:5173/`. Let the shell render.
2. In the global navigation, locate **User Portfolios** (`src/app/navigation.ts`; path `/user-portfolios`).
   Note that **Personal Portfolio** is a separate entry (`/personal-portfolio`) — do not select it.
3. Click **User Portfolios**. The URL must become `/user-portfolios`.
   Screenshot → `D10-01-nav-to-user-portfolios.png` (navigation visible, list rendered or loading).

### 6.2 The list (`/user-portfolios`) — `UserPortfolioList.tsx`

Expected rendering (one of four, each a distinct result):

| Rendered | Meaning | Action |
|---|---|---|
| `<h2>User Portfolios</h2>`, subtitle *"Durable portfolios served by the G-2 user-portfolio boundary (read-only view)."*, a table with columns **Portfolio / Revision / Total value / Holdings / Weight sum / Updated / Status / Provenance**, **two rows** | the served v2 list rendered | continue |
| a *"Loading"* box (`data-testid="state-loading"`) that never resolves | the request hung | record Network state; stop after 60 s |
| *"No data"* box: *"No durable portfolios yet. Portfolios appear here once they exist on the user-portfolio boundary."* (`state-empty`) | `200 []` — the resolved owner has no portfolio. **Disagrees with §5** | finding M; stop |
| *"User portfolio service unavailable"* box (`state-unavailable`) with a diagnosis paragraph and *Required server settings* (`read-unavailable-diagnosis`), or *"Permission denied"*, or *"Error"* | `503` / `403` / network fault | record status + body from Network; finding R; stop |

Read off and record for **each** row: *Portfolio* (link text = `portfolioName`), *Revision*, *Holdings*,
*Status* (*Committed* / *Not committed*), *Provenance* (first 12 characters + `…`; the full digest is the
link's `title` tooltip — hover to confirm it begins `17b2b283` for `DHAN_PORTFOLIO`).

Expected per §5: the `DHAN_PORTFOLIO` row shows Revision **1**, Holdings **64**; the `PERSONAL-fa8ad7bc-…`
row shows Revision **2**, Holdings **1**. Network: `GET /api/user-portfolios` → **200**.

> *Status* column note. The list renders `isSaved` as *Committed* / *Not committed*. `PortfolioStatusSummary.tsx`
> documents that IPD derives `isSaved` from the current revision's **operation**, so an `INITIAL` revision that
> already carries persisted holdings reports `isSaved=false` → *Not committed*. If `DHAN_PORTFOLIO` (revision 1)
> shows *Not committed* while its detail summary says `PERSISTED`, record it under §9 row U as a **known
> presentation inconsistency**, not as a data defect and not as something to fix here.

Screenshot → `D10-02-list.png`.

### 6.3 Select `DHAN_PORTFOLIO` → detail (`/user-portfolios/DHAN_PORTFOLIO`) — `UserPortfolioDetail.tsx`

1. Click the `DHAN_PORTFOLIO` link (`data-testid="user-portfolio-link-DHAN_PORTFOLIO"`). URL →
   `/user-portfolios/DHAN_PORTFOLIO`.
2. Network: three reads are issued by the page and one by the summary. Record the status of each:

   | Request | Expected | If not |
   |---|---|---|
   | `GET /api/user-portfolios/DHAN_PORTFOLIO` | **200** | `404` → *"Portfolio not found"* box (`state-not-found`): finding M. `503` → unavailable box: finding R |
   | `GET /api/user-portfolios/DHAN_PORTFOLIO/revisions` | **200** | summary shows *"Revision history unavailable: …"* (`summary-history-error`) and *Persistence Status* `UNAVAILABLE` — finding R; the holdings table still renders |
   | `GET /api/investment/portfolio/DHAN_PORTFOLIO/identities` | **200** (it was, §3) | every row's last column degrades to *"not available — holding identity could not be read"* — finding U |
   | `GET /api/investment/portfolio/DHAN_PORTFOLIO/dispositions` | 200 (entries may be empty) **or** a fail-closed `404`/`503` from `disposition-transport.ts` | a non-200 only degrades the *Disposition* column to *"not available — disposition read unavailable"*. Record the status; it is **not** a Stage 5 portfolio-read failure (dispositions are a separate IID-4 store) |

3. Read off the page, top to bottom:
   - `← All user portfolios` link; `<h2>` = the portfolio name from the list.
   - **Portfolio Status Summary** (`data-testid="portfolio-status-summary"`), six cards:
     *Total Portfolio Value* (`summary-total-value`), *Constituents* (expect **64**), *Weight Allocation Sum*
     (`summary-weight-sum`, four decimals — record verbatim, do not expect 100.0000%), *Persistence Status*
     (`summary-persistence-status`: `PERSISTED`, `UPDATED`, `EMPTY` or `UNAVAILABLE`; *Observing…* only while
     the history read is in flight), *Portfolio Revision* (expect **1**), *FIPS 180-4 Canonical Digest*
     (`summary-digest`: first 12 characters; hover for the full value — expect it to equal the §5 digest
     exactly).
   - The three sentences under the cards: valuation basis with `last updated <timestamp>`; constituents detail
     (*"64 persisted constituents · N active · M inactive"* — record N and M); status basis (*revision 1 ·
     operation `<op>` · committed `<timestamp>`* followed by the explanation). Record `<op>` verbatim. The status is
     derived from `<op>` (`portfolioPersistenceStatus.ts`): `INITIAL` with holdings → `PERSISTED`; `MERGE`/`REPLACE`
     → `UPDATED`; `RESET` or `INITIAL` with 0 → `EMPTY`; anything else, or a history/detail disagreement → `UNAVAILABLE`
     with its reason sentence. Record what is shown; do not expect a particular word in advance.
   - *Observed <ISO timestamp>* next to the **Refresh** button (`summary-observed-at`).
   - **No** `malformed-holdings-notice` / `malformed-contributions-notice` / `summary-rejected-revisions`
     / `summary-concurrent-observation` paragraphs. If any appears, record its text verbatim (finding U).
   - **Holdings** table: columns **Symbol / Company / Quantity / Avg buy price / Current price / Market value /
     Weight / Active / Source / Lineage / Disposition / Company, candidate and history**. Count the rows:
     expect **64**. Count how many rows show *Company assessment →* / *Change history →* links versus
     *"not available — <reason>"* in the last column, and record both numbers (the W11 capture recorded
     64/64 identities resolved with 1 security identity present / 63 null — so most rows may legitimately show
     a reason text and only a *Candidate view →* link; that is the server's identity answer, not a page fault).
   - **Import contributions**: expected text **"No import contributions recorded for this portfolio."**
     (`state-empty`). See 6.5.
4. Press **Refresh** (`summary-refresh`) once. Expect the same four requests again, *Observed* timestamp to
   advance, and no change in any figure. Record the second set of statuses.

Screenshots → `D10-03-detail-top.png` (summary cards + sentences), `D10-04-detail-holdings.png` (holdings
table; host-local only), `D10-05-detail-contributions.png` (the contributions section).

### 6.4 The honest-refusal path — one read-only navigation

Type `http://localhost:5173/user-portfolios/D10-NO-SUCH-PORTFOLIO` into the address bar.

Expected: `GET /api/user-portfolios/D10-NO-SUCH-PORTFOLIO` → **404**; page shows `← All user portfolios`,
`<h2>User Portfolio</h2>` and the **"Portfolio not found"** box (`state-not-found`) with the text *"No durable
portfolio is available for this identifier. Missing, foreign, and removed portfolios are indistinguishable by
design."* No holdings table, no summary, no zeros. The `/revisions`, `/identities` and `/dispositions` reads
for that id may also appear with non-200 statuses; record them.

This is the only negative case exercised. A `503` is **not** provoked: stopping IPD or editing settings is a
host change, forbidden by §3 rule 1. Record the 503 path as **not exercised in the browser** (its unit-level
behaviour is tested in `UserPortfolioStates`/`userPortfolios` tests; its transport behaviour was seen on this
host before D5 — evidence record §3.1).

Screenshot → `D10-06-not-found.png`.

### 6.5 The `contributionLedger` distinction — what to record, in these words

The transport's `11-02` body for `DHAN_PORTFOLIO` carries `contributions: []` **and** `contributionLedger` with
one entry (evidence record §3, §5). The page renders `view.contributions` only; `UserPortfolioView` in
`src/api/userPortfolios.ts` has no `contributionLedger` member, so the ledger is passed through the client
untouched and never reaches the renderer (implementation record §8). Therefore:

- *Import contributions* reading **"No import contributions recorded for this portfolio."** is the **expected
  rendering of the current build** — it is **not** a mismatch between UI and wire, and **not** a D6 failure.
- It **is** a **recorded UI capability gap**: the browser does not yet show the v2 ledger. Record it in §9 row L
  as *"ledger not rendered — passed through, unrendered (expected; capability gap)"*. A separate, unrequested
  product change would be needed to render it; this procedure does not request one.
- Confirm the distinction from the Network panel without copying the body: open the `DHAN_PORTFOLIO` response
  → *Preview*, note that `portfolio.contributionLedger` has length 1 and `portfolio.contributions` length 0.
  Write only those two lengths into `D10-journey.txt`.

### 6.6 Optional bridge to the Stage 4 surfaces (reference, not repetition)

If at least one holdings row offers **Company assessment →**, follow **one** of them. The target is
`/investment/company/<issuerId>?portfolioId=DHAN_PORTFOLIO&securityId=<id>` (`companyAssessmentHref`).
What must render there is defined by Stage 4 procedure §7.2 (chain / `503` state / `404` state, with the
NP-04 record §4 values if the issuer is Infosys) — apply that section as written; do not re-derive it here.
Record the status and which of the three §7.2 outcomes occurred (`D10-07-company-bridge.png`). If you also
follow **Change history →**, a `404 change-not-found` with one stored version is the correct refusal (Stage 4
§7.6); do not treat it as an error.

If no row offers the link, record *"no holding resolved to a governed issuer with a company link"* — that is
the server's identity answer for this portfolio and is not a page defect.

### 6.7 Second portfolio — minimum check

Return to the list and open `PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2` (its link
`data-testid` is `user-portfolio-link-PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2`). Record only: status
codes, *Portfolio Revision* (expect **2**), *Constituents* (expect **1**), *Persistence Status* (derived
from revision 2's stored operation as in 6.3 — record what is shown), digest prefix (expect `9e5dc076`), and
the contributions section text. Screenshot → `D10-08-personal-detail.png`. **Do not** open the same id in
`/personal-portfolio`.

### 6.8 Console and network sweep

Before closing the tab: Console panel → filter *Errors* → record the count and, for each, the first line
(sanitised: no URLs with query values beyond those above). Network panel → filter `/api/` → export the list
as `D10-network.har` **only if** the HAR can be kept host-local (it contains full bodies); otherwise transcribe
`method<TAB>path<TAB>status` for every `/api/` request into `D10-network-status.txt`. Any request whose
method is not `GET`/`HEAD` is finding F.

---

## 7. Outcome matrix — read only the row that matches; none is decided in advance

| Observed | Meaning | Record as |
|---|---|---|
| List 2 rows; `DHAN_PORTFOLIO` detail 200/200/200, revision 1, 64 constituents, digest `17b2b283…` full match, status summary resolved to a stored-operation state (not `UNAVAILABLE`), 64 holding rows, contributions *"No import contributions recorded…"*, 404 path honest, 0 console errors, no non-GET request | **D10 / P6-B browser journey executed and recorded on this build pair.** The browser renders the served v2 view; the ledger gap is recorded (L). Prerequisite 7 closed. **Not** Stage 5 acceptance (see §10) | §9 result **PASS-WITH-RECORDED-GAP** |
| As above but with the *Status* column inconsistency (6.2 note), identities/dispositions degraded, or console errors that do not affect the figures | journey executed; presentation findings | **PASS-WITH-FINDINGS** (list each under U) |
| Any §5 figure disagrees (revision, count, digest, portfolio count) | the stored data differs from the 2026-11-22 baseline, or the page mis-renders it. Check the Network *Preview* of the same response: if the **wire** also differs, the data moved (record how — a used editor is the likely cause); if the wire matches §5 and the page does not, it is a **rendering defect** | **FINDING M** — stop; publish the finding; do not re-baseline |
| List or detail `503` / unavailable box | the read path that was green on 2026-11-22 is not green now — environment, IPD service or binding changed | **FINDING R** — stop; do not change settings; record Network status + `error`/`unavailableReason` only |
| `DHAN_PORTFOLIO` detail `404` while the list shows it | list and get disagree (handoff WC-3) | **FINDING R** — stop |
| Any `POST`/`PUT`/`DELETE` observed | a write control was triggered | **FINDING F** — stop; record; the comparison baseline is void |

---

## 8. Evidence inventory (host-local; nothing committed)

| File | Produced by | Publishable? |
|---|---|---|
| `D10-00-checkout.txt`, `D10-00-transport-process.txt` | §4 | yes (commit hash, PID, Node version) |
| `D10-journey.txt` | §6 (one line per step) | yes after reading it — no holding values |
| `D10-01` … `D10-08-*.png` | §6 | **no** — host-local. `D10-04` (holdings) in particular contains personal financial data. A cropped `D10-03` (summary cards) may be pasted into a review record if quantities are redacted |
| `D10-network-status.txt` or `D10-network.har` | §6.8 | status list yes; HAR **no** |
| `D10-console.txt` | §6.8 | yes, sanitised |

---

## 9. Summary sheet — the only part that is published (template; fill after execution)

```text
D10 / P6-B BROWSER JOURNEY — <date UTC>  —  result: <PASS-WITH-RECORDED-GAP | PASS-WITH-FINDINGS | FINDING M/R/F>
IRR checkout: <hash>   transport: PID <n> on 8787   UI: 5173   browser: <name/version>   IPD: cbb116d2 (unchanged)
A  list rows: <n>  (expected 2)                    GET /api/user-portfolios: <status>
B  DHAN_PORTFOLIO: revision <n> (exp 1) | constituents <n> (exp 64) | holding rows <n> (exp 64) | digest prefix <12> (exp 17b2b2833268) full-match: <yes/no>
   statuses: detail <s> revisions <s> identities <s> dispositions <s>   persistence status: <PERSISTED|…>  operation: <op>
   links: <n> rows with Company assessment, <n> rows "not available — <reason>"
C  Refresh: statuses <s/s/s/s>, figures unchanged: <yes/no>
D  404 path: /user-portfolios/D10-NO-SUCH-PORTFOLIO → <status>, "Portfolio not found" shown: <yes/no>; 503 path: NOT EXERCISED (by rule)
E  PERSONAL-fa8ad7bc-…: revision <n> (exp 2) | constituents <n> (exp 1) | digest prefix <8> (exp 9e5dc076) | status <…>
L  contributionLedger: wire length <1> / contributions length <0>; UI "No import contributions recorded…": <yes/no>
   → ledger not rendered — passed through, unrendered (EXPECTED; recorded UI capability gap)
U  presentation findings: <none | list: Status column Committed/Not committed vs summary …; degraded columns …>
F  non-GET requests observed: <none | list>      console errors: <n> (<first lines>)
M/R findings: <none | …>
Writes performed: NONE.   /personal-portfolio controls used: NONE.   Host settings changed: NONE.
Stage 5 status after this journey: NOT ACCEPTED (see procedure §10).   Production: NOT ADMITTED.
```

Publication: append the filled sheet as **§13** of
`IID-STAGE-5-D5-D6-WINDOWS-EXECUTION-EVIDENCE-2026-11-22.md` (append-only), plus a roadmap §C entry and a
tracker entry — through an IRR PR, after reading the sheet for personal data. Nothing on IPD's behalf.

---

## 10. What a PASS here does and does not close

- **Closes:** P6-A §10 prerequisite 7 for the Stage 5 portfolio loop; the D10 row of P6-A §3 moves from
  "Not attempted" to "executed and recorded" for the surfaces in §6. The handoff §9 row "D10 / P6-B" closes.
- **Does not close:** Stage 5 acceptance. Still open after a PASS: Marico / KEC successor v1 mints (optional,
  not forced), the second comparable assessment version and change diff (genuine input change; not forced),
  IPD's own D02 publication (IPD-owned), peer authenticity (standing `NOT_ATTESTED`), the `contributionLedger`
  rendering gap (recorded; a product change only if requested), and the `IIPS_LOCAL_PERSONAL_USE` scope
  observation (operator decision). Stage 4 remains closed with its accepted limitations; nothing here reopens it.
- **Never:** production admission, multi-user or hosted operation, any IPD-side record.

---

## 11. Boundaries of this document

| Boundary | Statement |
|---|---|
| Execution | **not executed.** No browser was opened by Arena; no DOM, console, network or screenshot observation exists |
| Product code | no file under `frontend/` changed; no new script, test, dependency or automation framework |
| Host | no instruction installs, builds, pulls, restarts or changes a setting; the only new network activity is `GET`s from the operator's browser |
| D5 / D6 / R-1 | not rerun; the comparison baseline is their published evidence |
| Sanitisation | this document carries two portfolio ids, two revisions, two digests and two counts already of record; no holdings, no bodies, no environment values, no pipe name, no owner/tenant/binding/membership values |
| Repository ownership | IRR-only; no IPD decision or confirmation is written here |
