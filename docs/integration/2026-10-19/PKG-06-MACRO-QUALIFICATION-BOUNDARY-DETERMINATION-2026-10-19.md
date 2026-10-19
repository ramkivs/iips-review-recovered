# PKG-06 — Macro Qualification Boundary Determination (2026-10-19)

| Field | Value |
|---|---|
| Record ID | `PKG-06-MACRO-QUALIFICATION-BOUNDARY-DETERMINATION-01` |
| Date | `2026-10-19` (UTC) |
| Workstream | PKG-06 — Macro qualification boundary (canonical matrix: §18 row 19) |
| Builds on | `docs/integration/2026-10-18/PKG-06-MACRO-QUALIFICATION-BLOCKERS.md` (evidence inventory; reused, not rewritten) |
| Status | **Evidence + boundary determination. NOT a qualification, admission, licensing, relief, or production act.** |
| Authority basis | Standing authorization for routine investigation, evidence collection, documentation, testing, committing, publishing, CI, safe merge, and post-merge verification. No qualification/admission/licensing/production authority is invoked, and none is claimed. |
| Recording agent | Arena Agent Mode — investigation, validation, and record preparation only. No independent Program Authority, legal conclusion, or external entitlement is rendered. |

## 1. Baseline and lineage (VERIFY BASELINE)

### 1.1 Remote `main` at pass start

| Item | Verified value |
|---|---|
| Remote `main` SHA | `c6240fa43fc65353c355af65792e9be24731d62d` (`git fetch origin main` + `git rev-parse origin/main`) |
| Remote parents (GitHub API) | `00e67133088f8371a39863a3ffd928804e96b155` + `db12feace99de65b3ae0a3f61cd5d10ab1c5b9bd` — full history exists on GitHub |
| Local HEAD | `c6240fa43fc65353c355af65792e9be24731d62d`, working tree clean |
| Local clone shape | **Shallow single-commit snapshot** (`git rev-parse --is-shallow-repository` = `true`; 1 commit). Historical commits are therefore verified through the GitHub API, not local history. |
| Open PRs at pass start | Exactly one: **#114** (browser-only broker preview / NP-18 views) — a separate workstream with separate, ungranted merge authority. No competing PKG-06 PR exists or was created. |

### 1.2 Artifacts and decisions inspected

- PKG-06 inventory: `docs/integration/2026-10-18/PKG-06-MACRO-QUALIFICATION-BLOCKERS.md` (blob `cb600770…`).
- Tracker (secondary navigation reference; consequential claims re-verified against acts/code/remote): `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` — §§16.4 (CV-53 row), 16.10 item 9, 16.12, 16.17, 16.27–16.36, 18 row 19, 19. **The tracker file itself was not modified by this pass.**
- CV-53: `CV-53-D89-MACRO-UI-DISCLOSURE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-2026-10-15.md` + `CV-53-D89-MACRO-PRODUCT-ACCEPTANCE-RECORD-2026-10-15.md`.
- D-series: `NP-08-D8-MACRO-SCOPE-DETERMINATION-ACT.md` (D8), `NP-08-D08-MACRO-PROVIDER-DESIGNATION-ACT.md`, `NP-08-D08-MACRO-ENTITLEMENT-LICENSING-DECISION-ACT.md` (entitlement B), `NP-08-D08-MACRO-UI-DISCLOSURE-DECISION-ACT.md` (D89), `NP-08-D88-ACCOUNT-WIDE-UI12-DATA-MODE-AUTHORITY-ESTABLISHMENT-ACT.md` (D88), `NP-08-D91-RELIEF-COMPETENCE-ESTABLISHMENT-ACT.md`, `NP-08-D91-RELIEF-MECHANISM-ACT.md`, `NP-08-M5-D91-OUT-OF-SCOPE-DISPOSITION-ACT.md` (M-5).
- Option E / V-C5 / V-C6: `NP-08-D08-MACRO-OPTION-E-DISPOSITION-AND-XV16-AUTHORITY-DETERMINATION-2026-10-15.md` (D-1/D-2), `NP-08-D08-MACRO-V-C5-*` (4 records + acceptance), `NP-08-D08-MACRO-VC6-L3-CPI-XV15-CONSOLIDATED-AUTHORITY-AND-ACCEPTANCE-RECORD-2026-10-16.md` (D-A/D-B/D-C/D-D).
- Intelligence-data-supply governance: `evidence/intelligence-data-supply-governance/GATE-Y-M2-INTELLIGENCE-DATA-AUTHORIZATION-ACT.md` (M-3 requirement), `GATE-Y-INTELLIGENCE-DATA-SUPPLY-DESIGNATION-AND-GATE-SELECTION-ACT.md`.
- Live-source evidence: `evidence/integration/mospi-live-e2e-reconciliation-2026-10-15/` (reconciliation + Arena egress transcript + probe scripts), `evidence/integration/mospi-live-e2e-windows-verification-2026-10-15/` (`LIVE-VERIFICATION-RESULTS-2026-10-15.md` CPI/IIP operator evidence + P4 procedure references), `evidence/integration/cv-53-d89-product-acceptance-2026-10-15/` (browser screenshots, refusal state).
- Code at `c6240fa`: `frontend/server/macro/{mospi-source,macro-transport,mospi-tls}.ts`, `frontend/src/api/macro.ts`, `frontend/src/features/research/{MacroContext,MacroResearch,MacroSourceDisclosure,MacroDataModeNotice}.tsx`, `frontend/server/executive-transport.ts` (§16.17.6 mount wiring).

### 1.3 Byte-identity verification (this pass, against `c6240fa` tree)

All values computed locally with `git hash-object` on the clean checkout; D89 additionally read back from remote `main` via the GitHub contents API.

| Artifact | Recorded value (CV-53 acceptance §5 / mechanism §20) | This pass | Result |
|---|---|---|---|
| D89 act | `9652f890ba19d340d2dd896e3b735055d03d35eb` | `9652f890…` local **and** remote contents API (`size 34401`) | **MATCH** |
| D91 relief mechanism act | `f61325ee3d3121467ca29c731440e0e233a44165` | `f61325ee…` | **MATCH** |
| D91 relief competence act | `4bb191a6…` | `4bb191a60dc1e5578bc0947824275704719566bf` | **MATCH** |
| D88 act | `d396e688…` | `d396e6880e0f5af35bd004e06bbf6b2eff03ec0a` | **MATCH** |
| D8 scope act | `7cd63efb…` | `7cd63efb4de4dd574a5ce04fe0c471465210bf0f` | **MATCH** |
| M-5 act | `2006786c…` | `2006786c4fef48ba7fc38ebcf24622077828ceee` | **MATCH** |
| CV-53 implementation-authority act | `3befae7212a56a33858ed783a83fbc1924766074` | `3befae72…` | **MATCH** |
| Fence: `frontend/server/reports-transport.ts` | `98147054…` | `981470541812a64c733309f1debec75455d85bee` | **MATCH** |
| Fence: `frontend/server/user-portfolio-transport.ts` | `51704c12…` | `51704c12a467cd2f718a030b5036bc55c9afa73f` | **MATCH** |
| Fence: `frontend/server/owner-context-unavailable.ts` | `cb8db45d…` | `cb8db45d668d28cee7e0a52721001d579a872733` | **MATCH** |
| L-C branch tip (remote) | `36e433a0` (tracker §16.17) | `36e433a0dfcf22c427f544c2671cb9bbbcdaf871` via `git ls-remote` | **MATCH** |
| L-C `MacroSourceDisclosure.tsx` (branch) | 2,008 B (Option E §6.1) | blob `b071565e…`, `size 2008` via contents API | **MATCH** |
| Main `MacroSourceDisclosure.tsx` | `84d2e78c…` (tracker §16.32) | `84d2e78cefd5b1c7ca542b3a1989ef7fd58b2b49`, 2,214 B | **MATCH — and distinct from L-C** |
| P4 procedure commit (remote) | `cc363f91b49a8ab33f3f1625b6e725fcd52db383` (tracker §16.31.1) | Same SHA via commits API (`evidence(mospi): P4 criteria…`) | **RETRIEVABLE** |

Consequence: no governed act, fence, or acceptance record bearing on PKG-06 has changed since the recorded baselines. Prior evidence resting on those blobs is reused without re-execution. The `main` disclosure component is **not** a byte-identical admission of L-C (different blob/size); it was implemented under the separate CV-53 D89 gate.

### 1.4 Relationship map

- **PKG-06 ↔ §18 row 19.** Row 19 (Macro / D08 governed read and D89 display) is the capability-matrix row whose qualification (`NOT ESTABLISHED`) and production (`NOT AUTHORIZED`) cells PKG-06 investigates. PKG-06 does not edit the row; it determines the boundary behind those cells.
- **CV-53 ↔ D89.** CV-53 is `COMPLETE/ACCEPTED — D89 display-contract scope only` (Product Acceptance record `CV-53-D89-MACRO-PRODUCT-ACCEPTANCE-01`, durably published via PR #104). D89 itself (`B — REQUIREMENTS PARTIALLY ESTABLISHED`) binds only the product-transparency display contract (DT-1–DT-15); DT-11/DT-13 stay NOT DETERMINED/NOT ESTABLISHED and DT-15 bars implementation authority from D89.
- **Macro governance chain.** D8 scope → provider designation (MoSPI/e-Sankhyiki, NAS/CPI/IIP only) → implementation authority (D1–D4 route contract) → entitlement act (B) → D89 (display B) → CV-53 gate (implementation) → CV-53 acceptance (display only) → V-C5 (D91 §1 notice, closed) → D-B (V-C6/L-3, closed) → D-C (CPI payload characteristic, closed) → D-A (XV-15, closed) → **D-D (all remaining boundaries retained)**. Each gate is independent; no later acceptance re-opens or upgrades an earlier gate's reservations.
- **D91/D88 chain.** D88 (account-wide UI12 data-mode authority, established) → D91 competence (D88 competent for the UI12 data-mode dimension only) → D91 mechanism (request/evidence/two-stage procedure) → **Relief Determination: does not exist.** Competence ≠ mechanism ≠ grant; the third act is absent and unauthorized by the first two.

## 2. Qualification dependency matrix (INVESTIGATE EVIDENCE)

### 2.1 External entitlement — `B — PARTIALLY ESTABLISHED` (unchanged)

| Aspect | Determination |
|---|---|
| **Established** | Category-A open-access **access/use** of NAS / CPI / IIP-at-NIC-2-digit, **free of cost, no registration, no credential, no approval, no fee** — GSDD 2019 (OM Y-18020/9/2017-CAP, 15.02.2019) §4.A.1, via the entitlement act §§5–8, 15. IIP granularity boundary (NIC-2-digit = A; item-level = B, outside D08). |
| Source/dataset/use covered | Provider MoSPI, platform e-Sankhyiki REST (`https://api.mospi.gov.in`), datasets NAS/CPI/IIP only; **application display (rendering to the requesting user)** is within the established access right (entitlement act §10). |
| **NOT DETERMINED (still)** | Commercial use · redistribution · caching (all 8 layers) · retention/storage (raw and derived) · Category-A attribution/citation · stated rate limits · §4.B(v) third-source overlay extent · API-specific terms (none located; not claimed non-existent). |
| Currency re-check (this pass) | Fresh external search (2026-10-19) found **no finalized superseding GSDD**: the 02.01.2025 text remains a **draft** (comments closed 2026-02-01 per contemporaneous reporting); no authoritative final notification located. GSDD 2019 remains operative per entitlement act §6. Search snippets are not authoritative evidence and move no state. |
| Blocks | **Qualification: YES** (partial entitlement cannot ground a use-rights qualification for any scope touching commercial use, redistribution, retention, or attribution). **Admission: YES** (same). **Production: YES** (production independently NOT AUTHORIZED in any case). |
| Required evidence to advance | A MoSPI instrument (or PA-authorized terms/applicability gate per D89 §19, with **separate explicit authorization** before any provider contact) establishing the missing rights for the exact intended use. |

Public accessibility, HTTP 200s, and the existing API endpoints are **not** treated as entitlement for any use beyond Category-A display access.

### 2.2 Attribution — `NOT DETERMINED` (unchanged)

| Aspect | Determination |
|---|---|
| Governing records | Entitlement act §11; D89 §9 matrix + DT-11; D-D retention. |
| What the evidence shows | GSDD 2019 imposes citation **only** via the Category-B/C Annex (cl. 5) — correctly **not** read across to Category A. No Category-A API attribution format, wording, or placement was located in any authoritative source. DT-1 is a product-transparency string, explicitly **not** a legal citation. |
| Adjacent instruments (still unresolved) | MoSPI Copyright Policy (website-material acknowledgement language; scope for API JSON **NOT DETERMINED**, D89 §7.1) · e-Sankhyiki portal "Terms of Use" link (**text not resolved**, D89 §7.2 — a fresh 2026-10-19 search returned no MoSPI ToU text) · publication-specific notices (not generalizable, D89 §7.3) · third-source protocols under GSDD §4.B(v) (unidentified). |
| Blocks | **Qualification: YES** for any scope asserting attribution compliance. Display acceptance is unaffected (DT-1 is product, not legal, wording). |
| Required evidence to advance | PA-authorized terms/applicability gate (D89 §19) resolving the Copyright Policy scope, the portal ToU text/applicability, and any Category-A API citation term; then a formal attribution determination. No attribution wording is invented here. |

### 2.3 GODL applicability — `NOT ESTABLISHED` (unchanged)

| Aspect | Determination |
|---|---|
| Governing records | Entitlement act §5.3; D89 §8; D-D retention. |
| What the evidence shows | GODL-India (Gazette 13.02.2017) exists as a general GoI open-data licence. **No MoSPI instrument located states that GODL governs data served through `api.mospi.gov.in` / e-Sankhyiki.** Its preamble ties the licence to datasets "published under NDSAP and through the OGD Platform" (`data.gov.in`) — a platform-scoped framing not shown to extend to the e-Sankhyiki REST API. |
| Fresh check (this pass) | External search (2026-10-19) located **no MoSPI instrument adopting GODL for e-Sankhyiki/API outputs**; located secondary material is consistent with the recorded platform-scoped reading. Applicability remains neither established nor refuted — exactly the recorded state. |
| Blocks | **Qualification: YES** insofar as any qualification would rely on GODL-derived permissions (commercial use, redistribution, derivative products) or GODL-derived duties (attribution, non-endorsement). Neither is imported. |
| Required evidence to advance | A MoSPI/e-Sankhyiki instrument (or PA-authorized applicability gate) establishing — or refuting — GODL coverage of the governed API outputs. |

### 2.4 M-3 provenance — `NOT ESTABLISHED` (unchanged)

| Aspect | Determination |
|---|---|
| Governing records | `GATE-Y-M2-INTELLIGENCE-DATA-AUTHORIZATION-ACT.md` (§§M-3 definition, requirement, non-grant); `GATE-Y-INTELLIGENCE-DATA-SUPPLY-DESIGNATION-AND-GATE-SELECTION-ACT.md`; Phase1C forensic §9 / deferred-completion §4 (by reference); D8 scope act; entitlement act §19; D89 §13; implementation act §18; D-D retention. |
| Requirement | Governed provenance metadata: `sourceClassification`, `asOf`, `evaluatedAt`, `dataVersion`, `lineageDigest` (SHA-256), `quality`, `replayConstraintApplied` per the `ExecutiveProvenance` contract — requiring **actual governed source data + traceable provenance**: source identity, acquisition/provenance information, timestamps/versioning, SHA-256 lineage digest where the contract requires. |
| Current state | Contract shape exists; **payload values are not derivable from any existing artifact** (M2 act). Implementation-level candidate fields (`MACRO_API_CONTRACT_VERSION`, technical `source: 'MoSPI'`, response metadata) are **candidates, not governed M-3 fields** (implementation act §18). The XV-15 `'REAL'`→`'DERIVED'` correction touched IPD-side classification only and established no IRR M-3 payload. No M-3 establishment act for Macro exists on `main` (verified by corpus search — only non-grant/retention statements found). |
| Blocks | **Qualification: YES** (provenance/reproducibility acceptance criterion has no governed evidence). **Admission: YES.** |
| Required evidence to advance | A separate M-3 governance act establishing the Macro provenance payload against actual governed source data, with the `ExecutiveProvenance` fields populated and verifiable — not fixtures, inferred metadata, or undocumented mappings. |

### 2.5 Live-source end-to-end verification — `A — ESTABLISHED` at application-route level (reused, not re-observed; unchanged)

| Aspect | Determination |
|---|---|
| Recorded posture | `A — ESTABLISHED`: NAS + CPI + IIP retrieved live, completely, through the application's own routes on an egress-capable machine — CPI `200`, `259/259` pages, `25,884` retained, `COMPLETE` (§16.29; `LIVE-VERIFICATION-RESULTS-2026-10-15.md`); IIP `200`, `3/3`, `COMPLETE`; NAS P4 `200`, `129/129`, `2/2` pages, `COMPLETE`, 16/16 criteria, response SHA-256 `97b313d4…e490f6` (§16.31; operator-transferred + GitHub-hosted Windows runs `38770524406`/`38771075510`/`38771647181`). Evidence class: **operator-transferred external evidence**, never Arena-observed. |
| Reuse verification (this pass) | P4 procedure commit `cc363f9…` confirmed retrievable via GitHub API; CPI/IIP evidence file and Arena egress transcript present on `main`; governing tracker sections read as recorded. No contradiction found; nothing re-executed externally. |
| Fresh Arena probe (this pass) | **No authorized network-capable test path exists in Arena.** Direct probes of `https://api.mospi.gov.in` fail before the TLS handshake: curl exit `35` / `SSL_ERROR_SYSCALL` / `http=000`; Node `ECONNRESET` ("socket disconnected before secure TLS connection was established"); control host `api.github.com` returns `200`. Sandbox egress is allowlisted to GitHub/npm/PyPI hosts only. Full transcript: `evidence/integration/pkg-06-macro-qualification-2026-10-19/ARENA-EGRESS-PROBE-TRANSCRIPT-2026-10-19.txt`. |
| Current-main route behavior (Arena-local, this pass) | `GET /api/macro/cpi` → `502` `RETRY_BUDGET_EXHAUSTED`, zero observations, fail-closed (no synthetic/cached/partial value); `GET /api/macro/nas` (no indicator) → `400` governed validation. Same transcript. |
| Unobserved part (unchanged, non-blocking) | A browser rendering of live observations on `/research/macro` has not been observed in any environment (D89 browser acceptance saw the refusal state). Per §16.31.6/§16.31.7 scope and `D-D`, this is **not** a condition of the route-level posture and no work item is opened for it. No browser was driven this pass; no browser claim is made. |
| Blocks | **Qualification: NO further block from this dimension at route level** (posture `A` stands as reused evidence). **New live proof from Arena: environmentally impossible** — any future live acceptance criterion requiring fresh Arena execution needs an egress-capable host. Minimum to resume: a host permitted to reach `api.mospi.gov.in:443`, running the P4-class procedure against the pinned `main` tree, with response digests published. |

No live-source success is claimed from synthetic data, mocks, cached responses, fixtures, or this pass's 502/400 probes.

### 2.6 D91/D88 Macro relief — `NOT GRANTED` (unchanged)

| Aspect | Determination |
|---|---|
| Governing records | D91 competence act (§§7–9, 12, 15); D91 mechanism act (§§6–8, 10–13, 17–18); Option E E-8; V-C5 records; D-D (via mechanism-act preservation). Blobs verified byte-identical (§1.3). |
| Current state | Competence **established** (D88, UI12 data-mode dimension only; WP-MACRO-03 expressly excluded). Mechanism **established** (requester/request-contents/evidence/two-stage/statuses/temporality/conditions). **Relief: NOT GRANTED** — no §9-conforming request has been submitted (D88 may not self-initiate, §8.3), no Stage 1 scope record exists, no Stage 2 determination exists. Corpus search confirms no Relief Determination record on `main`. |
| Implication for Macro qualification scope | Any qualification scope requiring UI12 data-mode participation changes, D91 §1-notice modification/withdrawal, or any relief of the LIVE-only exemption **cannot proceed** — it has no authority vehicle until a PA-originated §9 request with §10's ten evidence items is determined. The V-C5 notice implementation/acceptance (PR #110/#111) satisfied the notice by markup; it is **not** relief and grants none. CV-53 acceptance, route success, and UI tests grant no relief. |
| Required authority to advance | PA-originated D91 Relief Determination (`GRANTED`/`DENIED`/…), exactly within a recorded Stage 1 scope, preserving §15.1/WP-MACRO-03 constraints, per the mechanism act. |

### 2.7 L-C and production boundary (unchanged)

| Aspect | Determination |
|---|---|
| L-C status | **Evaluation-only, unadmitted.** D-1 (Option E §6.1, effective on `main` via PR #98): "`L-C` … **Retained for evaluation only.** It is **not** admitted, **not** selected as *the* implementation, and **not** authorised for merge or port by this act." CV-53 implementation-authority act §2 preserves that status "unless a separate authority changes that status." **No subsequent authority changes it** (verified: V-C5/V-C6/D-A…D-D records reference L-C only for separation, never for status change). The L-C branch tip is unchanged remotely (`36e433a0…`). |
| Permitted qualification activity within the boundary | Evidence inventory, read-only verification, local test execution, documentation, and publication — i.e., exactly what this pass performs. No L-C merge/port/selection, no implementation, no MoSPI contact. |
| Production | **`NOT AUTHORIZED`** — retained independently by the entitlement act (§18.15), D89 (§13), the CV-53 acts, Option E, the V-C5/V-C6 records, D-D, and §18 row 19. Evaluation permission is not production authorization. Nothing in this pass lifts or narrows any production fence (all three fence blobs re-verified identical). |

## 3. Qualification boundary determination (ten states)

| # | State | Status | Governor / criterion | Evidence available | Evidence missing | Next action + dependency |
|---|---|---|---|---|---|---|
| 1 | Display-contract acceptance | **ACCEPTED (D89 scope only)** | CV-53 Product Acceptance record; D89 DT-1–DT-8/DT-12–DT-13 | Browser + suite evidence (§16.27), PR #104 publication (§16.28) | None for this scope | None — preserve; do not reopen |
| 2 | Source & dataset identification | **ESTABLISHED (bounded)** | Provider designation act; D08 boundary; D89 §4 | MoSPI/e-Sankhyiki designated; NAS/CPI/IIP (+NIC-2) bounded; WPI/PPI/RBI/item-IIP excluded | None for this scope | None — preserve |
| 3 | External entitlement | **B — PARTIALLY ESTABLISHED** | Entitlement act; GSDD 2019 | Cat-A access/use, no registration (§2.1) | Commercial/redistribution/caching/retention/attribution rights | MoSPI instrument or PA terms-gate (D89 §19); provider contact needs separate explicit authorization |
| 4 | Attribution & licensing | **NOT DETERMINED / NOT ESTABLISHED** | D89 §9/DT-11–DT-13; entitlement §5.3/§11; D-D | Negative findings (Annex not read across; no GODL instrument; ToU unresolved) | Attribution formula; Copyright/ToU applicability; GODL ruling | PA-authorized terms/applicability gate; then formal determination |
| 5 | Provenance & reproducibility | **NOT ESTABLISHED (M-3)** | GATE-Y M2 act; `ExecutiveProvenance` contract | Contract shape; candidate implementation fields (not governed) | Governed M-3 payload values from actual source data | Separate M-3 establishment act |
| 6 | Live-source E2E | **A — ESTABLISHED (route level; reused evidence)** | §§16.29/16.31 acceptance conditions | CPI/IIP/NAS-P4 operator evidence; P4 commit retrievable | Fresh Arena execution (environmentally impossible); browser live-render (non-blocking) | Egress-capable host + P4-class procedure if fresh proof ever required |
| 7 | Qualification authority | **ABSENT** | — (no act located) | Standing authorization covers investigation/publication only | PA qualification-authority act naming scope, evidence, exclusions | PA act — cannot be manufactured by this pass |
| 8 | Qualification result | **NOT ESTABLISHED** | §18 row 19; D-D | Display + route evidence (necessary, not sufficient) | States 3/4/5 + authority 7 | Blocked until 3–5 advance **and** 7 exists |
| 9 | Admission authority & result | **ABSENT / NOT ESTABLISHED** | Gate 5 (separate); row 19 | None applicable to Macro | Admission act + qualification prerequisite | After 8, via the owning admission authority |
| 10 | Production authorization | **NOT AUTHORIZED** | Entitlement/D89/CV-53/D-D fences | Fences verified intact | Production authorization act | Separate production decision; out of PKG-06 |

### 3.1 Can any bounded non-production qualification be decided now?

**No — and no qualification act is rendered by this pass.** The technical layers are evidence-rich (display acceptance, bounded source identification, route-level live E2E, green suites, fail-closed behavior), but three independent bars each suffice to withhold qualification:

1. **Authority bar:** no qualification-authority act exists for Macro, and the standing authorization expressly excludes qualification/admission/licensing/production decisions. Rendering a "bounded qualification" without authority would manufacture an authority act.
2. **Rights bar:** entitlement is partial and attribution/licensing unresolved; any qualification asserting use-rights compliance would rest on NOT DETERMINED premises.
3. **Provenance bar:** M-3 is not established; no governed reproducibility evidence exists.

Evidence readiness and formal qualification are preserved as distinct. The D89 display acceptance does not alter these boundaries because it was explicitly scoped to exclude them (CV-53 record §1/§3/§6; D89 DT-15; D-D): **acceptance is not qualification.**

## 4. Residuals and deliberately untouched scope

- **V-C6 (API-client `code`/`message`/`dataset` surfacing + env/`deps` `MospiSourceConfig` wiring) and L-3 (UI12 settings-invariance test): ACCEPTED/CLOSED under D-B** (consolidated record §3.3; PR #112). Verified present at current `main` in code (`frontend/src/api/macro.ts` `MacroTransportError`; `macro-transport.ts` `resolveMacroSourceConfigFromEnv`; `executive-transport.ts` `setMacroRouteDeps`/mount `deps`) and in tests (23/23 transport incl. V-C6+L-3; 4/4 `macro.test.ts`; 16/16 `MacroResearch.test.tsx`). They are **not** PKG-06 work and were not reimplemented.
- **CPI missing-`index` (D-C), XV-15 (D-A), V-C5 notice:** closed as recorded; not reopened.
- **CV-24 / CV-38:** untouched (no evidenced PKG-06 dependency requires action).
- **General XV-16 rule:** `UNRESOLVED` by design per D-2/D-D; PKG-06 takes no position beyond recording that it does not block the row-19 technical evidence and is not resolved here.
- **Out-of-scope surfaces:** portfolio persistence/scoring, Gate 3/Gate 5 authority, Reports, IPD dependencies, unrelated frontend surfaces — untouched. No product file changed in this pass.

## 5. Validation executed this pass (VALIDATE)

Environment: `frontend/`, Node `v22.22.3`, npm `10.9.8`, `npm ci` clean (188 packages; `NODE_EXTRA_CA_CERTS` per Operator Runbook §0). Baseline `c6240fa`, tree clean before and after (no product diff).

| Check | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | **PASS** (exit 0) |
| Focused Macro suites | `vitest run` on `macro.test.ts`, `macro-transport.test.ts`, `mospi-source.test.ts`, `mospi-tls.test.ts`, `MacroResearch.test.tsx`, `MacroContext.test.tsx`, `MacroSourceDisclosure.test.tsx` | **PASS — 7 files / 119 tests** |
| Full suite | `npm run test:ci` | **PASS — 73 files / 814 tests / 0 failed** |
| Zero-failure guard | `node .ci/assert-tests.js .vitest-report.json` | **OK — 73 / 814 / 0 failed** |
| Production build | `npm run build` (`tsc -b && vite build`) | **PASS** (93 modules; exit 0) |
| Route probes (Arena-local tsx server `:8799`, stopped after) | `GET /api/macro/cpi`, `GET /api/macro/nas` | **502** `RETRY_BUDGET_EXHAUSTED` fail-closed, zero observations; **400** governed validation |
| Egress probe | curl + Node fetch to `api.mospi.gov.in` vs `api.github.com` control | **Blocked** (`SSL_ERROR_SYSCALL`/`ECONNRESET`, http 000); control `200` |
| Governed-act / fence integrity | `git hash-object` vs recorded blobs + remote API read-back | **All match** (§1.3) |
| External refresh | Web search: GODL/MoSPI, GSDD finality, e-Sankhyiki ToU | **No new authoritative evidence**; all legal states unchanged |

Local results are local; hosted CI is reported in §6. No live-source, browser, Windows, deployment, or host-only verification is claimed beyond what Arena performed.

## 6. Publication (PUBLISH → MERGE → POST-MERGE VERIFY)

_To be completed as the pass executes. No publication step below is a qualification, admission, or production act._

| Step | Record |
|---|---|
| Branch | `arena/736fe076-iips-review-recovered` |
| Files changed | `docs/integration/2026-10-19/PKG-06-MACRO-QUALIFICATION-BOUNDARY-DETERMINATION-2026-10-19.md` (this record) + `evidence/integration/pkg-06-macro-qualification-2026-10-19/ARENA-EGRESS-PROBE-TRANSCRIPT-2026-10-19.txt` (fresh probe evidence). **Documentation/evidence only — zero product files.** |
| Diff review | Every changed file belongs to PKG-06; tracker, acts, fences, code, and tests untouched (verified by `git status`/`git diff --stat` before commit). |
| Commit / push | _pending_ |
| PR | _pending_ (single PR; no competing PR) |
| Hosted CI | _pending_ (`Typecheck · Test · Build`) |
| Merge | _pending_ (merge-when-safe under standing authorization; documentation-only) |
| Post-merge verify | _pending_ (remote `main` SHA, tree/blob read-back, CI on merged `main`) |

## 7. Closure and next-action handoff

**PKG-06 disposition: investigation COMPLETE; qualification BLOCKED (authority + external evidence).** The Macro qualification boundary is now explicitly established to the extent the evidence and authority permit. Every remaining blocker has a named next action its owner can execute without reconstructing this investigation:

| # | Blocker | Minimum action to advance | Owner / authority needed |
|---|---|---|---|
| 1 | Entitlement partial (commercial/redistribution/caching/retention) | MoSPI instrument or PA-authorized terms/applicability gate (D89 §19) for the exact intended use; provider contact only under separate explicit authorization | Legal/source owner + PA |
| 2 | Attribution NOT DETERMINED | Resolve Copyright Policy scope + e-Sankhyiki ToU text/applicability + any Cat-A citation term; then formal DT-11 determination | Legal/source owner + PA |
| 3 | GODL NOT ESTABLISHED | MoSPI/e-Sankhyiki instrument (or PA gate) ruling GODL coverage of the governed API outputs in or out | Legal/source owner + PA |
| 4 | M-3 NOT ESTABLISHED | Separate M-3 establishment act with governed `ExecutiveProvenance` payload from actual source data | PA (governance) |
| 5 | D91/D88 relief NOT GRANTED | PA-originated §9 request + §10 evidence → Stage 1 scope → Stage 2 determination (only if a future scope needs UI12-dimension relief) | PA (as requester + determining authority via D88) |
| 6 | Qualification authority absent | PA qualification-authority act naming bounded scope, relied-upon evidence, and exclusions (only meaningful after 1–4 advance for that scope) | PA |
| 7 | Fresh live proof (if ever required) | Egress-capable host + P4-class procedure against pinned `main`, with published response digests | Operator + PA |

**Safety boundaries confirmed intact:** no tracker modification; CV-53's D89 scope unchanged and un-reopened; no qualification/admission/relief/production claim; no entitlement, attribution, licence, M-3, or relief inference; no synthetic evidence; no API-client/transport change; no product behavior change; all fail-closed behavior and non-production restrictions preserved; L-C remains evaluation-only; general XV-16 remains unresolved by design.

_End of determination. Publication of this record makes the boundary explicit; it does not qualify, admit, relieve, or authorize production use of Macro._
