# Dhan and Broker Holdings — executed convergence (2026-10-16)

## Authority and bounded decision DB-C1

The current Ramki instruction authorizes one-pass verification, implementation, testing and
additive publication for the single-user personal-use product. Under that express instruction,
procedural investigation-only sequencing is superseded **only for a read-only broker CSV preview
and its exact, additive IPD source consumption boundary**. This is the smallest gap independent
of the unresolved durable portfolio work. No new signature, human review or approval is asserted.

Designate IPD `main@70b24f029842a7e9b7f615e4d9df7376fd4ff817` broker-import sources as
IRR's immutable **preview-only** dependency under the separate npm alias `iips-broker-import`.
The source list is closed by `frontend/tsconfig.broker-import.json`; source blobs are verified in
`evidence/integration/dhan-broker-convergence/2026-10-16/validation.json`. This is not promotion
of G24 or a repin of `iips-production-market-data#2e11fa3b…`. No durable-save, canonical-identity,
Group 6 (Opportunities/Risks/Rankings), production, Reports or certified-analytics authority follows.
G-2 ownership and GC-D2/2F refusals remain intact. The earlier records remain historical evidence;
this is not a rewrite of their original grants. Ordinary additive branch publication is sufficient
for this bounded implementation candidate; no formal Product Acceptance is invented.

## Verified baseline and dependency chain

- **IRR:** `main@98c21768f77061a68470e4b4f6750d38abeec594`, PR #113 merged, no open PRs
  at entry. Current Arena branch is `arena/d57c506a-iips-review-recovered`.
- **IPD:** `main@70b24f029842a7e9b7f615e4d9df7376fd4ff817`, PR #7 merged. Broker import
  sources equal those in IRR's separate `2e11fa3b…` lineage, but the installed old package contains
  only compiled PIT/D114/persistence exports, **not broker sources**. Main has no package exports or
  preparation script and its npm Git archive includes source. The new immutable alias uses this
  already-published baseline without changing any IPD ref.
- Read the G-2 accepted architecture, implementation record and current tracker dispositions;
  inspected existing portfolio boundaries, adapter/detector/mapper/ingress/controller/store/UI and
  relevant BI-04/05/08 tests, package manifests, tags and recent PR history. Reused the existing
  Group 6 and G24 evidence rather than re-auditing unrelated protected paths. Tags were inspected
  for context; none supersedes the verified main/source and governed pin for this action.

### Dhan — individually traceable disposition

Existing capability is **offline CSV**, detailed holdings and Web UI summary variants, with
XLSX explicitly deferred. No Dhan HTTP client, API endpoint, account login, token acquisition,
refresh/session handling or live market-data connector was located in the runtime trees inspected.
The current change makes both CSV variants executable in the IRR browser application through
IPD's existing implementation. It does **not** implement or demonstrate live API access.
No broker credentials, account/API entitlement or permission to reach Dhan's host is established
in this sandbox (egress excludes the broker). Do not place tokens in chat or the tracker.

### Broker Holdings — individually traceable disposition

Existing IPD path: local CSV → format detector → broker adapter → holdings mapper → ingress →
`PortfolioBrokerImportController` → in-memory `PortfolioStore` → `PortfolioWorkspace` /
`BrokerImportModal`. Current source contains **three broker adapter classes**, Dhan/Zerodha/Groww. Earlier tracker
wording "4 adapters" is not supported by this tree: GENERIC is a contract/mapper fallback, not
a fourth adapter. Generic/unrecognized format admission is not added.

IPD's identity mapper can fabricate ticker-like companyId when called without a master or with
permissive unmapped handling. IRR therefore supplies an **empty SecurityMaster**, strict unmapped
handling and no bypass. It never seeds D05's partly synthetic data or relies on it as real-account
coverage. The full ingress refuses unresolved identity; the new IRR projection retains the refusal
and **parsed native fields**, labels every row UNRESOLVED, omits companyId/raw objects/weights and
never invokes a store. `PARSED_UNRESOLVED` is not `READY_FOR_PORTFOLIO_SAVE` or valid normalization.
Native fields are parser output and may include existing price/quantity defaults, not a lossless
rendering of the original CSV. This limitation is disclosed in the UI.

New IRR path: `/broker-holdings` → local `File.text()` → IPD detector/adapter/ingress → narrow
preview projection → native-fields table + pipeline refusals. No HTTP, local/session storage,
owner inference, cache, shadow portfolio, save, digest restamping or certified-reference substitution.
The existing `/api/user-portfolios` fence and read-only UI remain unchanged and unavailable. G24's
off-main durable line still cannot be advertised as admitted or restart-qualified for this product.

## Implementation, integrity and self-review

- Added `brokerHoldingsPreview.ts`, React page, route/navigation and 16 focused tests.
- Compiles only the dependency's broker/identity/contracts files to ignored `.cache/broker-import`
  JS/declarations before dev/typecheck/test/build. The third-party config preserves IPD's strict
  type checking without imposing IRR's unused-local policy on untouched IPD source; IRR's own
  typecheck remains unchanged and strict. No `ts-ignore`, mock implementation or copied parser.
- Input bounded at 1 MiB in the file selector **and** wrapper. Rejects unsupported file types before
  read. Clear/new selection invalidates pending reads; an old preview cannot reappear after clear
  or overwrite newer data. React escapes broker strings. No raw file logging or storage added.
  Clearing is not a secure JavaScript-memory-erasure guarantee.
- Initial direct TS imports exposed IPD unused-local diagnostics; fixed via the separate compiled
  dependency boundary, not weakened tests. Initial npm install failed sandbox CA validation;
  retry used `NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/e2b-ca.crt`, never disabled TLS.
- An IPD package-export alternative was locally tested but its push was denied HTTP 403 by the
  session's external-repository permission boundary. It was **not committed/published**, was
  discarded from the reference checkout, and is not a runtime dependency. The final solution
  needs **no IPD mutation**. IPD checkout and main remain unchanged. GitHub connection needs
  attention before any future required IPD write; no bypass attempted.

## Tests and publication

Commands run in IRR `frontend/` unless stated otherwise:

| Check | Result |
|---|---|
| CA-configured `npm ci --no-audit --no-fund` | PASS, immutable pins retained |
| `npm run typecheck` (includes separate dependency compilation) | PASS |
| `npm test -- src/api/brokerHoldingsPreview.test.ts src/features/broker-holdings/BrokerHoldingsPreview.test.tsx` | PASS, final 16 tests; actual IPD parsers, both Dhan variants, other brokers, unknown identity, browser without Buffer, sizes/types, no network/storage/save, clear/read races |
| `npm run test:ci` + `node .ci/assert-tests.js .vitest-report.json` | PASS, 71 files / 783 tests before three added regression cases; final head also covered by hosted CI when available |
| `npm run build` | PASS, 103 modules; no Node polyfill or external broker request |
| IPD `npm run build:tsc`; `node --test dist/tests/bi04_broker_adapters.test.js dist/tests/bi05_broker_ingress.test.js dist/tests/bi08_idempotent_ingress.test.js` | PASS, existing 49 tests; built actual source, nonzero-test count checked |
| Installed-source / protected-fence blob comparison; `git diff --check` | PASS |
| Live Dhan connection, real broker holdings import, browser manual observation | NOT VERIFIED; not replaced by synthetic success |
| Durable user-portfolio save/restart | BLOCKED; unchanged G-2/identity/persistence gates; not attempted |
| Library master synchronization | BLOCKED; Library connector returns unsupported; no claim that repository publication synchronizes Library |

Publication is on the active Arena branch in **IRR**, with one ordinary PR and additive evidence;
no lifecycle-closing merge is required to prove the branch artifacts exist. Implementation commit,
PR and independent remote file/blob verification are added to the **existing master tracker**,
not a new pending-work register. The tracker commit's own SHA is verified externally (PR comment),
not self-embedded. No IPD ref mutation or extra approval step is required for the final preview.

Next substantive step: exercise the new page with Ramki's own CSV locally (not uploaded to chat).
For saved portfolios, execute the separately governed G-2 ownership/identity/durable-persistence
path with actual restart evidence before lifting the existing write fence. For live Dhan, establish
broker account/API entitlement, secure credential custody and an egress-capable execution locus
before implementing/claiming a read-only account API connection. Group 6 remains investigation-only.
