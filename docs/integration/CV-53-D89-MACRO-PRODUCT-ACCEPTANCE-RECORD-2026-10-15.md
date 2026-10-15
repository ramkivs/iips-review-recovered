# CV-53 — D89 Macro disclosure Product Acceptance record

| Field | Value |
|---|---|
| Record ID | `CV-53-D89-MACRO-PRODUCT-ACCEPTANCE-01` |
| Date | `2026-10-15` (UTC) |
| Product Acceptance scope | **The D89 Macro product-transparency display contract only** on `/research/macro` (NAS / CPI / IIP). This is not acceptance of live-source availability or of the broader Macro capability. |
| Disposition | **ACCEPTED — D89 display-contract scope only**, on the inspected session-branch implementation, including the scoped responsive-layout correction recorded below. |
| Program Authority | **Ramki**, the IIPS application owner and Program Authority named in D89 §3 and the canonical tracker. The current session instruction explicitly directs this one-pass, bounded Product Acceptance and requires recording the result if its criteria pass. |
| Recording agent | Arena Agent Mode — evidence execution and record preparation only. No independent Program Authority or legal decision, human signature, authenticated identity, direct human review, or third-party sign-off is claimed. |
| Governing implementation authority | `CV-53-D89-MACRO-UI-DISCLOSURE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-01`, merged via PR #100 (`b06eaf4a965b888dded15453de36f19068045cef`); its §6 criteria govern this acceptance. |
| Reviewed implementation baseline | PR #103 merged to IRR `main` at `fd4ce6099f642cc3b581b1dd2a67e31cf2071984`; current `origin/main` was re-fetched and matched that SHA. The responsive correction and this record are on the session branch; their remote publication/PR coordinates are recorded in the tracker changelog after PR creation. They are not yet on `main`. |
| Publication state | Branch/PR publication only. This record does not itself authorize a merge. No claim that the acceptance record or responsive correction is already published on `main`. |

## 1. Decision and authority boundary

This record uses **Product Acceptance** for the product acceptance disposition, and **Program Authority** for the person authorized to direct/record that disposition. They are not interchangeable uses of “PA.” D89 §3 identifies Ramki as the application owner and Program Authority; the later CV-53 implementation-authority act explicitly limits the agent to recording/publication, with no independent authority rendered. The current task instruction is the bounded authorization to execute this Product Acceptance step. The standing project authorization transcribed at `IIPS_v3.0_OWNER_CONTEXT_F3_MECHANISM_AND_IMPLEMENTATION_PA_DECISION.md` §1.2 covers decisions, governance records, testing and publication only within established scope, and prohibits scope expansion or unverified success claims.

The acceptance evidence required here is the current CV-53 implementation-authority act §6, read with the binding D89 contract §§10 and 12 and the existing CV-53 tracker criteria. Product acceptance is not inferred from the merged implementation, green CI, route response, or a test suite. The evidence below separately covers component tests, route/navigation, actual browser rendering, and the live-source limitation.

**Disposition:** the D89 product-transparency display contract passes. The acceptance is deliberately narrow. It does not qualify/admit Macro, certify live MoSPI retrieval, authorize D91/D88 relief, decide legal attribution/licensing, authorize API-client or transport changes, or authorize production or deployment.

## 2. Governing sources and acceptance criteria

1. `NP-08-D08-D89-MACRO-UI-DISCLOSURE-DECISION-ACT.md` §§3–4, 10 (DT-1–DT-15), 12–16, 18–19: binding product-transparency and non-claim rules; NAS/CPI/IIP scope; the CPI Group/Subgroup view; IIP NIC 2-digit only; legal and entitlement non-determinations; no implementation/production authority from D89 itself.
2. `CV-53-D89-MACRO-UI-DISCLOSURE-IMPLEMENTATION-AUTHORITY-DECISION-ACT-2026-10-15.md` §§1–6: separate implementation gate; UI-presentation-only scope; protected transport/client/context boundary; explicit acceptance criteria DT-1, DT-2, DT-4–DT-8, DT-13 and no regression / byte-identical governed acts and fences.
3. `NP-08-D08-MACRO-OPTION-E-DISPOSITION-AND-XV16-AUTHORITY-DETERMINATION-2026-10-15.md` §§5–7, 11: prior disposition and V-C1–V-C6 adoption/compatibility checks. Those checks are reconciled below; D91’s separate notice and the two fenced API-client changes are not silently treated as D89 acceptance criteria or as completed.
4. Canonical tracker `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md`: former CV-53 row in §16.4 and §19; its cited §16.17.4 / §16.17.6 and §16.19.6 next action; §16.22–§16.27 status history; §18 row 19. The earlier tracker text predates the merged implementation-authority act and is updated additively by this record.
5. PR #103 and the current `origin/main` baseline; `gh pr checks 103` reports the hosted Typecheck · Test · Build check passed. That CI run verifies the already-merged baseline, not this session-branch responsive correction; the full local suite/build below was rerun against the correction.

## 3. Per-criterion disposition

| Criterion | Result | Evidence and limit |
|---|---|---|
| Authority to implement/accept the bounded D89 surface | **PASS** | The D89 act itself does not grant implementation authority; the separate CV-53 implementation-authority act did, and is merged via PR #100. The current task directly authorizes this one-pass Product Acceptance. This record does not infer acceptance from that implementation authorization. |
| Route and Research navigation (CV-53 / V-C6 route portion) | **PASS** | From `/executive`, the actual Chromium session clicked the visible `Macro` link (`href=/research/macro`) and rendered the `Macro Research` heading at `/research/macro`. Existing `App.test.tsx` generic navigation-destination coverage passed in the full suite. |
| DT-1 — provider/platform wording | **PASS** | Each of the three panels shows the exact neutral line: “Provider: Ministry of Statistics and Programme Implementation (MoSPI) · Data platform: e-Sankhyiki.” The `e-Sankhyiki` text links to the official portal landing page; the REST host/raw API URL is not exposed. |
| DT-2 — dataset names and granularity | **PASS** | NAS: “National Accounts Statistics (NAS)”. CPI: “Consumer Price Index (CPI), governed published Group/Subgroup index view”; this is the governed index path, not shop-price microdata. IIP: “Index of Industrial Production (IIP), NIC 2-digit level only”; no broader or item-level scope is claimed. |
| DT-3 — shared source, per-dataset scope | **PASS** | One common provider/platform line is repeated in each panel; each panel has its own dataset label and relevant granularity. No alternate source or unsupported per-dataset attribution is introduced. |
| DT-4 — placement and persistence | **PASS** | In every dataset panel the disclosure region contains the dataset label and the associated observation or refusal content; it is not in a footer, tooltip, hover state or expandable area. Existing `MacroResearch.test.tsx` checks adjacency with test-only observation fixtures; browser inspection checks the same panel placement in the live refusal state. |
| DT-5 — responsive/accessibility | **PASS after scoped correction** | Actual Chromium checks at 1280×800, 390×844, 320×720 and 280×640 found all three provider/dataset labels visible and fitting their containers; no document horizontal overflow; each disclosure is ordinary text in an `aria-label="Macro source disclosure"` region. The first mobile probe exposed clipping; a Macro-route-only shell/CSS adjustment was made and the rerun passed at all four widths, including the prior 1 px CPI label overflow at 280 px. This is not a cross-browser claim. |
| DT-6 — distinguish source from IIPS interpretation | **PASS** | The view identifies itself as showing only the governed read and no IIPS-generated interpretation, trend, score or recommendation; no analysis block or derived table is rendered. Component tests and browser DOM inspection agree. |
| DT-7 — neutrality / no implied endorsement | **PASS** | Provider is plain text; no MoSPI emblem, seal, logo, endorsement, approval, sponsorship, partnership or review claim appears. Browser rendered-text scan and image count found none. |
| DT-8 — no invented provenance | **PASS** | No period, freshness, “as of,” retrieval/last-evaluated timestamp, licence status or unsupported source citation is fabricated. With no returned observations, the browser rendered no observation table. Fixture-based component tests only verify honest rendering of explicitly returned test fields; they are not source evidence. |
| DT-9 / DT-10 optional classification/link | **PASS / not required** | The optional GSDD Category-A sentence is not shown. An official portal landing-page link is present as an optional usability link; no legal source-link obligation is asserted. |
| DT-11 / DT-13 legal attribution and legally required disclaimer | **NOT DETERMINED / NOT ESTABLISHED; no claim made** | No legal attribution formula or legally required non-endorsement/disclaimer is asserted or added. This preserves the governing non-determinations; it is not represented as legal approval. |
| DT-12 — no licence/rights language | **PASS** | No licence, permission, commercial-use, redistribution, retention, public-domain, GODL or equivalent rights claim appears in the rendered view. |
| Dataset boundary and fail-closed behavior | **PASS for the boundary/failure display** | The component tests assert exactly `/api/macro/nas`, `/api/macro/cpi`, `/api/macro/iip`; no other dataset is requested. Actual browser calls to those three endpoints returned HTTP 502. Each panel visibly refused observations and said no cached, partial or synthetic value is substituted; zero observations/tables, analysis or images were displayed. A real local missing-indicator route probe returned HTTP 400; a separate browser UI-only 400 response fixture showed “macro transport returned 400” and the same refusal. The 400 fixture is not live-provider evidence. |
| Tracker criterion “upstream 502/400 codes reach the screen” | **PASS only for HTTP status text; body-code pass-through remains OPEN** | The actual live 502 status and the injected 400 status are displayed. The current API client still discards the response body’s `code` field (e.g. `RETRY_BUDGET_EXHAUSTED`); the two client one-liners (`code`/dataset propagation and `deps`/config injection) were not changed or accepted. The implementation-authority act §5 excludes API-client/transport changes; they remain fenced and outside this D89 Product Acceptance. Do not interpret this row as accepting error-body-code propagation. |
| Prior V-C5 — separate D91 §1 notice | **BLOCKED / outside this D89-only disposition** | No D91 notice or D91/D88 relief is added or inferred. V-C5 is a separate obligation recorded by the prior Option E act, not one of the D89 implementation act §6 display criteria. This acceptance is not acceptance of the broader Macro surface or that separate notice; any such disposition needs its own authorized scope. |
| Prior V-C6 — one-change nav/view/tests and client one-liners | **PASS for one-change route/view/tests; OPEN for client one-liners** | PR #103 supplied the mounted view, route, nav entry and tests together. The separate API-client items remain incomplete/fenced as stated above, not silently waived or completed. |
| Protected files and governed acts | **PASS** | The session diff is limited to the Macro-route shell class/CSS, this acceptance record, the canonical tracker and the two browser evidence PNGs. No `frontend/server/macro/**`, `frontend/src/api/macro.ts`, `MacroContext.tsx`, source adapters, or governed act changed. Protected fence blobs and D89/D91/D8/M-5/CV-53 authority-act blobs were inspected and remain byte-identical to `main`. No dependency manifest changed. |
| Live MoSPI source retrieval / live-source E2E | **BLOCKED — not passed** | All actual browser requests returned 502 in this environment; Arena egress is blocked. No successful MoSPI retrieval was observed, no synthetic observation was substituted, and no live-source E2E acceptance is claimed. |
| Qualification, admission, production/release authorization | **NOT ESTABLISHED / NOT AUTHORIZED** | This Product Acceptance is not a qualification, admission, production, legal, licensing, entitlement, M-3 provenance, or D91/D88-relief decision. |

**Disposition rule applied:** every D89 display criterion in the current implementation-authority act §6 passed after the responsive correction. The non-D89 items above remain explicit separate limitations; none has been waived or folded into the acceptance.

## 4. Test and browser evidence

### Reused / remote evidence

- PR #103 is merged at `fd4ce6099f642cc3b581b1dd2a67e31cf2071984`; the remote `main` ref matched on a fresh fetch. `gh pr checks 103` reported hosted Typecheck · Test · Build **pass** (Actions run `38685466455`, head `1d031f37ecb23a3df6996e0d1e36cdcc98fcab45`). This covers the pre-existing merged UI, not the new responsive adjustment.
- Reused the existing Macro source, transport, context, disclosure, view and route/navigation suites. The existing jsdom fixture tests establish component rendering/adjacency and failure behavior only; they are not browser acceptance, route-probe evidence, or live-source evidence.
- Prior 13-route Macro boundary probes are reused as historical transport evidence (`CV-CORR-05` / V22, tracker §16.17). No protected server/client code changed. A fresh local missing-indicator probe returned 400 as noted above.

### Rerun on the session-branch candidate after the responsive correction

In `frontend/`:

```text
npm run typecheck                         PASS
npm run test:ci                           PASS — 67 files / 726 tests
node .ci/assert-tests.js .vitest-report.json  PASS — 67 files / 726 tests / 0 failures
npm run build                             PASS — tsc -b and Vite production build
```

The test output included non-fatal existing React Router future-flag and `act(...)` warnings; no test, typecheck or build failed. Full suite run includes `MacroSourceDisclosure.test.tsx`, `MacroResearch.test.tsx`, `MacroContext.test.tsx`, `App.test.tsx`, `macro-transport.test.ts` and `mospi-source.test.ts`.

### Real-browser check (distinct from jsdom/route probes/live-source E2E)

- Browser: headless Chromium `153.0.8010.0` with Playwright Core.
- Starting at `/executive`, clicked the visible Research → Macro link and reached `/research/macro`; heading, all three named panels and one accessible disclosure region per panel were present.
- Viewports checked: `1280×800`, `390×844`, `320×720`, `280×640`. At each, all three provider and dataset strings fit; document width equalled viewport width; no horizontal page overflow.
- Actual network responses: `/api/macro/nas`, `/api/macro/cpi`, `/api/macro/iip` returned HTTP 502. The UI rendered the governed fail-closed refusal; no returned observation/table, cached value, partial value, synthetic value, IIPS analysis, MoSPI branding or licensing/endorsement language appeared.
- An additional 400 browser check deliberately intercepted NAS with a test-only HTTP 400 response while leaving CPI/IIP on the actual 502 path. It verified that the UI displays the HTTP status and fails closed. This injected error is not a provider retrieval and not live E2E.
- The first browser run detected mobile clipping; after the route-scoped CSS correction and at-width-320 padding adjustment, the repeated run passed at all four sizes. The correction changes presentation only and does not touch the governed transport/client boundary.
- Screenshot evidence (actual Chromium render; refusal state, not observations):
  - `evidence/integration/cv-53-d89-product-acceptance-2026-10-15/macro-research-desktop-1280x800.png`
  - `evidence/integration/cv-53-d89-product-acceptance-2026-10-15/macro-research-mobile-390x844.png`

## 5. Protected boundary verification

The only application-code changes in this acceptance are the route-aware CSS class in `frontend/src/app/AppShell.tsx` and the new `frontend/src/app/AppShell.css`. The canonical tracked diff includes no change to:

- `frontend/server/macro/**` or `frontend/server/executive-transport.ts`;
- `frontend/src/api/macro.ts` (`dc283de08ceb88a30c722ae63b5352212a6c4e58`);
- `frontend/src/features/research/MacroContext.tsx` (`2066eae2cd3a0738b1b427b5a0ee725496133a58`);
- `frontend/server/macro/macro-transport.ts` (`451f0c8c8ac9db2170081efad34fe4648eb304f3`) or `mospi-source.ts` (`03b4bb047251feccb8ba4654f2d19ee37fbe43ac`);
- owner/report/portfolio fences: `981470541812a64c733309f1debec75455d85bee`, `51704c12a467cd2f718a030b5036bc55c9afa73f`, `cb8db45d668d28cee7e0a52721001d579a872733`;
- governed acts: D89 `9652f890ba19d340d2dd896e3b735055d03d35eb`, D91 relief `f61325ee3d3121467ca29c731440e0e233a44165`, D8 scope `7cd63efb4de4dd574a5ce04fe0c471465210bf0f`, M-5 `2006786c4fef48ba7fc38ebcf24622077828ceee`, or the CV-53 implementation-authority act `3befae7212a56a33858ed783a83fbc1924766074`.

No API-client correction, `baseUrl`/`deps` injection, extra dataset, synthetic fallback, D91/D88 relief, MoSPI contact, legal/rights statement or production behavior was introduced.

## 6. Limits, residuals and next action

- **Accepted:** D89’s UI source/dataset disclosure display contract only, on the inspected branch candidate.
- **Not accepted / blocked:** live-source retrieval and Live E2E (`C — BLOCKED`); actual provider data not obtained here.
- **Separate and still open/fenced:** API response-body `code`/dataset passthrough and `deps`/operator-config injection from tracker §§16.17.4 and 16.19.6. Current implementation authority §5 excludes these API-client/transport changes; this record does not grant their authority.
- **Separate and not evaluated/accepted:** V-C5’s D91 §1 notice and any broader Macro view/governance acceptance. D91/D88 relief remains NOT GRANTED.
- **Unchanged non-determinations:** entitlement `B — PARTIALLY ESTABLISHED`; formal Category-A attribution `NOT DETERMINED`; GODL applicability `NOT ESTABLISHED`; M-3 provenance `NOT ESTABLISHED`; production `NOT AUTHORIZED`; no qualification/admission claim.
- **Publication:** the record and proposed tracker update are remote on the session branch/PR after publication; no claim of merge to `main`. Merge/activation/release require their own authority.

No further work is authorized by this acceptance record. The precise external ChatGPT Library tracker text remains to be applied by its owner; no ChatGPT Library update is claimed here.
