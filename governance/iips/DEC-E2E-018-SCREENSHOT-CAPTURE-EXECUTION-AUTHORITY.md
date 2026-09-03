# DEC-E2E-018-SCREENSHOT-CAPTURE-EXECUTION-AUTHORITY

- **Record ID:** `DEC-E2E-018-SCREENSHOT-CAPTURE-EXECUTION-AUTHORITY`
- **Title:** E2E-018 Screenshot-to-Certified-Product Parity Matrix -- Screenshot Capture Execution Authority (Stage A, external capture on the maintainer machine) and Conditional Evidence-Artifact Creation Authority (Stage B, exactly nineteen PNG files and one manifest under `docs/v3.0/e2e-018-screenshots/` at `phase13-next` HEAD `7964fcce`)
- **Class:** `DECISION / AUTHORITY - CAPTURE EXECUTION AND CONDITIONAL EVIDENCE-ARTIFACT CREATION`
- **Status:** `RECORDED - CAPTURE EXECUTION AUTHORITY GRANTED FOR THE MAINTAINER WINDOWS MACHINE ONLY; EVIDENCE-ARTIFACT CREATION AUTHORITY GRANTED CONDITIONAL ON SECTION 6 POST-CAPTURE VALIDATION, FOR EXACTLY TWENTY NAMED FILES UNDER docs/v3.0/e2e-018-screenshots/. NO CAPTURE PERFORMED BY THIS RECORD. NO MATRIX AMENDMENT, PARITY DETERMINATION, E2E-018 STATUS RE-DETERMINATION, H/I/J RE-DETERMINATION, CERTIFICATION, A2 -> A1, RELEASE, TAG, IVM, ROADMAP OR D7 AUTHORITY GRANTED. E2E-018 REMAINS PARTIALLY COMPLETE. D7-TIER3-PARITY AND D7-TIER3-INDEPENDENCE REMAIN OPEN.`
- **Date/time:** 2026-09-03 (Asia/Calcutta, +05:30); exact recording time is the commit timestamp of this record
- **Authority relationship:** gate `E2E-018 - SCREENSHOT CAPTURE EXECUTION AUTHORITY RECORDING GATE`. Supplies the separate capture-execution authority that `DEC-E2E-017-018-REFERENT-AND-CHARTER` section 6.5 and `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md` section 4 require before any live-side cell of the parity matrix may move off `ABSENT`. Follows `DEC-E2E-017-018-STATUS-RECONCILIATION` (arena `4521d30fbb8249e1dd1b80164bf220279f383c57`), whose section 10 item 2 names this gate as optional and separately authorized. The maintainer explicitly authorized items 1 and 2 of section 3 and explicitly withheld every other item, after the read-only discovery of section 1 had been presented in full.
- **Scope:** (1) pins; (2) the discovery findings relied on (routes, authentication model, runtime, tooling); (3) the exhaustive authority table; (4) the Stage A capture mechanism and its constraints; (5) the Stage B artifact allow-list; (6) the post-capture validation that conditions Stage B; (7) manifest and provenance requirements; (8) the cell-to-capture coverage map; (9) prohibitions; (10) pre/post invariants; (11) recording-gate invariants; (12) later gates. Nothing else.
- **Provenance:** newly recorded at this gate from a read-only discovery performed against the fetched remote objects of `phase13-next` @ `7964fccefbf95341699bf56b5833b2432981767d` (frontend route map `frontend/src/app/App.tsx`, `routes.ts`, `navigation.ts`; `frontend/src/main.tsx`; `frontend/src/core/auth/AuthProvider.tsx` and `oidcClient.ts`; `frontend/server/executive-transport.ts`; `frontend/server/live/keycloak-provision.mjs`; `frontend/vite.config.ts`; `frontend/package.json`; `docs/v3.0/g3-build/PROGRAM_v3.0_G3_LIVE_CERTIFICATION.md`), the parity matrix at that commit, and the governance records `DEC-D13-HIJ-EXECUTION-AUTHORITY` and `DEC-E2E-017-018-STATUS-RECONCILIATION`. No screenshot, browser, UI, server, test or package operation was performed in the recording environment; the recording environment cannot perform them (`DEC-D13-HIJ-EXECUTION-AUTHORITY` section 4).
- **Supersession / revision relationship:** supersedes none; amends none. Does not amend the D1 charter, either matrix, `DEC-E2E-017-018-STATUS-RECONCILIATION`, `DEC-D13-HIJ-EXECUTION-AUTHORITY`, `DEC-G-AI-IMPL-CERTIFICATION`, `DEC-D7-EVIDENCE-DEBT-DISPOSITION`, the IVM, `ROADMAP.md`, or the maintainer-supplied E2E inventory baseline (E2E-019 to E2E-024). The `NOT PERFORMED` standing of criteria H / I / J is carried, not re-determined.

---

## 1. AUTHORITATIVE PINS

| Item | Value |
|---|---|
| Product branch / commit | `phase13-next` @ `7964fccefbf95341699bf56b5833b2432981767d` (parent `f8aa038e78373113858459c8136ba888cae6520c`); live `ls-remote` confirmed at recording |
| E2E-018 parity matrix | `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md` @ `7964fcce` -- blob `b175e8cf9b4cf311f2ea07120696cffd5f9562c0`, 18,106 bytes, SHA-256 `ee45d98e6e325c806178c4baa5d3a4660d5e82f235e7576735c44f7604eb5b11`; must remain byte-identical throughout |
| E2E-017 engine master matrix | `docs/v3.0/E2E-017_ENGINE_MASTER_MATRIX.md` @ `7964fcce` -- blob `d84956071bebda4e65b5cd1193116a382b5c19a6`, 23,322 bytes, SHA-256 `6e8316688af0b677c0a31ff4c6e3e6811aac3b5b258a4da3b7d5752b9208f2a8`; unchanged |
| Integration Verification Matrix | `docs/v3.0/INTEGRATION_VERIFICATION_MATRIX.md` blob `cada0451400409b0fe9ff0d62309b756c7b45e43` (SHA-256 `fa5758885cc9b214b9fb4957790e4274a24b4fbf30b56f6d5ac81813081aee66`); unchanged |
| ROADMAP | `ROADMAP.md` blob `b5485618f8dbc390d5b542fdfd5256d335d10b03`; unchanged |
| Package manifests and lockfiles (must remain byte-identical; `npm ci` never alters them) | `frontend/package.json` blob `0e380068c82c4949734744e0681322adf5f32cf3`; `frontend/package-lock.json` blob `0bb178e4fb60868e6d01100ae0a68f2b52aaab86`; `iips-platform/package.json` blob `1093ee304ac52b0f94946a23049517c2688a615e`; `iips-platform/package-lock.json` blob `3c63b4b9d2785b179f67e42edd8d2e4994be0fe8` |
| Runtime sources relied on (read-only; never modified) | `frontend/server/executive-transport.ts` blob `fab26a42973619e87ea9bae2db4ef31210fe1ca2` (port `EXEC_TRANSPORT_PORT` default 8787); `frontend/server/live/keycloak-provision.mjs` blob `c4e5705812b90423c815735e067211d8e9e75454`; `frontend/vite.config.ts` blob `8b36e4f62176577de6ad96a36a760d03512cbf63` (port 5173, `/api` proxied to 8787); `frontend/src/main.tsx` blob `2367d065b17ff8ecbca54217715cfba52bca7477` (light theme default; real OIDC/PKCE session; no demo session) |
| Data baseline | `program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json` blob `63bcd350f2cda2b0337097c25236fd8dbe82d87b` |
| Protected calibration files (must remain ` M` and byte-identical) | `ies-012-utilities/calibration/utilities-calibration-1.0.0.json` `cd60d644c92f999cc6484b31ae3842376ced07c7727fe5dd7b13a67a7f2f0ab8`; `ies-013-consumer/calibration/consumer-calibration-1.0.0.json` `2c25fa39cb85f4202eafb0f57c08996aa4c6cd0619c7f462f3a8ca118833b0c9`; `ies-014-industrials/calibration/industrials-calibration-1.0.0.json` `abaa02d0c96055febbc69a3175b28d354aed515fe9695acb089fd3f849ee05be`; `ies-015-technology/calibration/technology-calibration-1.0.0.json` `9be45e06c953711a7c3202ac8b4fc5d6337dc9c59189f0a2c5f45485d729a06d` |
| Six Tier-2 tests (must remain `??` and byte-identical; never staged) | `iips-platform/tests/regression/banking-framework-integration.test.ts` `a8199e4c6759e99f63eca190cf0acb3746f279b0f9679084c87b4fc0ba9c6394`; `banking-reuse-verification.test.ts` `e18b7727c1f1051638596e0b6fb815d10f79c3cdeece35172ab924f889b66912`; `banking-wp4-validation.test.ts` `f226775dcad92220ff9e33b075931c46136f91ac3959c736dfec2afc5ecbe239`; `insurance-wp4-validation.test.ts` `2e101a69d42adf4b2ec3031f7eb8153460665960b610d2a5a1a3045236a3575f`; `capital-markets-wp4-validation.test.ts` `f21f57cc6edc17a53119e46adff460b539741bb0c589b5cb92b2a11938adf698`; `healthcare-wp4-validation.test.ts` `96666d53be25048a1a0e0130d08aac84509ba9a470727a66019693b59b76887e` |
| Governance branch / parent of this record | `arena/01a03e3b-iips-review-recovered` @ `4521d30fbb8249e1dd1b80164bf220279f383c57`; live `ls-remote` confirmed |
| Governance chain relied on | `DEC-E2E-017-018-REFERENT-AND-CHARTER` (`7ec36ea1e93cda0d2d7ce1689744969f4a9fdf0b`, SHA-256 `1a8784f00735c7a3829fb4414a2fc4dacabe7fa9598c0bd584ccb77f53ea45fb`); `DEC-E2E-017-018-MATRIX-CREATION-AUTHORITY` (`625e2fe5a1376bd8b18a6abddf2aafa401227628`, `d582d764b65275abfe8a4c28c3e4d9629829750ad72a851b030067e64e592986`); `DEC-E2E-017-018-MATRIX-COMMIT-PUSH-AUTHORITY` (`1f49ba4423ccbd7b7a8aed7fea20270149947c98`, `a22a02a5b6012aea11130a4368aa7a17759552f8da0e5ff713f62ce43809cbe1`); `DEC-E2E-017-018-STATUS-RECONCILIATION` (`4521d30fbb8249e1dd1b80164bf220279f383c57`, `813f1092afcd86203f9c9f76ded27eec9682da21bfe1151bfcef44d5cee3191c`); `DEC-D13-HIJ-EXECUTION-AUTHORITY` (SHA-256 `339053632a2d88a4b391df551b569e6f9122098ac18c997a03644daece039e00`); `DEC-G-AI-IMPL-CERTIFICATION` (SHA-256 `6ff2325c3c38a682763842e96f4ca1271c41de37e1ee9289deec68610af5fc3c`; AI Advisory certified at `f63a9b493118643725568a95b86405a5835a30a0`) |
| Current statuses (carried, not changed) | E2E-017 = COMPLETED / EVIDENCE-ONLY; E2E-018 = PARTIALLY COMPLETE; neither certified; `D7-TIER3-PARITY` OPEN; `D7-TIER3-INDEPENDENCE` OPEN; H / I / J NOT PERFORMED; IVM seven A1 / seven A2 |
| Screenshot state at `7964fcce` | `docs/v3.0/e2e-018-screenshots/` ABSENT; zero image files (`.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.bmp`, `.svg`) anywhere in the tree; 46 live-side cells `ABSENT` |

## 2. DISCOVERY FINDINGS RELIED ON (read-only; verified against `7964fcce`)

| # | Finding | Source |
|---|---|---|
| F1 | The 46 live-side cells resolve to six route families in the shipped SPA: `/admin/engines` (one registry table listing all thirteen engines), `/executive` (one dashboard), `/research/company/:id` (`:id` = sector display name; thirteen values), `/research/cross-sector`, `/intelligence/decision-matrix`, `/screener`; AI Advisory is embedded in Company Intelligence, Sector Intelligence (`/research/sector/:id`) and Decision Matrix | `frontend/src/app/App.tsx`, `routes.ts`, `navigation.ts`; `CompanyIntelligence.tsx`, `SectorIntelligence.tsx`, `DecisionMatrix.tsx`, `AdminEngines.tsx` |
| F2 | The SPA renders only the Sign-in page unless a real, unexpired Keycloak token is held in memory; there is no demo, mock or bypass session and no environment toggle | `frontend/src/main.tsx`, `core/auth/AuthProvider.tsx`, `core/auth/oidcClient.ts` (issuer default `http://localhost:8080/realms/iips`, client `iips-spa`) |
| F3 | `/api/admin/*` and the advisory endpoint require an authenticated executor; without an IdP the transport answers `401 authentication unavailable (no IdP configured)`; the Administration surface therefore needs an `iips-admin` session | `frontend/server/executive-transport.ts`, `admin-transport.ts`, `ai-advisory-transport.ts` |
| F4 | The runtime is Keycloak (Java; G3 LIVE used Keycloak 19.0.3 `start-dev` on 8080 with the tracked provisioning harness creating realm `iips`, client `iips-spa`, roles `iips-admin` / `iips-analyst` / `iips-viewer`, users `admin-a`, `analyst-a`, `viewer-a`, `analyst-b`), the executive transport on 8787 and Vite on 5173 | `frontend/server/live/keycloak-provision.mjs`, `docs/v3.0/g3-build/PROGRAM_v3.0_G3_LIVE_CERTIFICATION.md`, `frontend/vite.config.ts` |
| F5 | No screenshot tooling exists in the repository (no Playwright, Puppeteer or Cypress dependency); adding one would alter tracked package manifests and lockfiles and is therefore not permitted; capture must use a tool that lives entirely outside both checkouts | `frontend/package.json`, `iips-platform/package.json`, lockfiles |
| F6 | The recording environment cannot capture: no browser, no Java, no usable package manager (verified unobtainable in `DEC-D13-HIJ-EXECUTION-AUTHORITY` section 4); only the maintainer Windows machine (`DESKTOP-NO0NHTP`, where G3 LIVE was provisioned) can perform Stage A | `DEC-D13-HIJ-EXECUTION-AUTHORITY` |
| F7 | Slugs for per-sector files are the tracked `SECTOR_DIR` values (`banking`, `insurance`, `capital-markets`, `healthcare`, `hospitality`, `energy`, `utilities`, `consumer`, `industrials`, `technology`, `telecommunications`, `automobile`, `materials-metals`), so every filename is derivable from the code | `frontend/server/executive-transport.ts` |

## 3. AUTHORITY TABLE (exhaustive; directed by the maintainer at this gate)

| Row | Item | Granted |
|---|---|---|
| 1 | **Capture execution (Stage A)**: on the maintainer Windows machine only, under the mechanism of section 4, capture exactly nineteen PNG screenshots plus one `CAPTURE_MANIFEST.json` into the external staging directory `G:\IIPS\e2e-018-capture\<UTC-yyyymmddThhmmssZ>\`; no product-tree write | **YES** |
| 2 | **Evidence-artifact creation (Stage B)**: create exactly the twenty files of section 5 under `docs/v3.0/e2e-018-screenshots/` in the product checkout, CreateNew semantics, byte-copied from the validated staging directory | **YES - CONDITIONAL on section 6 post-capture validation passing in full** |
| 3 | Amendment of `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md` (any byte), or of `docs/v3.0/E2E-017_ENGINE_MASTER_MATRIX.md` | **NO** - separate matrix-amendment authority required |
| 4 | Parity determination for any row (`PARITY-ESTABLISHED`, `PARITY-GAP`, `UNVERIFIABLE`); E2E-018 status re-determination | **NO** - separate read-only determination gate required; E2E-018 remains PARTIALLY COMPLETE |
| 5 | Re-determination of criteria H / I / J (they are carried verbatim as `NOT PERFORMED`) | **NO** - separate successor to `DEC-D13-HIJ-EXECUTION-AUTHORITY` required |
| 6 | Certification of either E2E item; A2 -> A1 promotion of any capability; release; Git tag; production-readiness or release-readiness language | **NO** |
| 7 | Closure or narrowing of `D7-TIER3-PARITY`, `D7-TIER3-INDEPENDENCE` or D7-1 | **NO** |
| 8 | IVM or `ROADMAP.md` amendment; calibration, Tier-2 test, D36, D5 / D5-S1 / D5-S3, E2E-019 or inventory-baseline change | **NO** |
| 9 | Any change to tracked product source, including `package.json`, `package-lock.json`, `.gitignore`, `.gitattributes`, `vite.config.ts`, authentication code, transport code; installation of any dependency into the repository | **NO** |
| 10 | Staging, commit or push of the Stage B artifacts (or of anything else) on `phase13-next` | **NO by this record** - separate product commit/push gate required |
| 11 | Any image format other than PNG; any cropped, annotated, edited, scaled or composited image; any capture of the Sign-in, `403`, `NotYetAuthorized`, loading or error state presented as a certified surface | **NO** |
| 12 | Amendment of this record or of any existing governance record; commit or push of this record | **NO by this record** - separate governance commit/push gate required |

Exactly one row is granted unconditionally (1) and exactly one conditionally (2). Every other row is refused. Rows 1 and 2 are mechanically separable (external staging, then CreateNew copy) and remain separately verifiable; they share this record only because row 2 has no content without row 1.

## 4. STAGE A - CAPTURE MECHANISM (the only authorized mechanism)

| Element | Authorized value |
|---|---|
| Machine | the maintainer Windows machine `DESKTOP-NO0NHTP` only; never the recording environment |
| Product checkout | `G:\IIPS\phase13-next-authority`, `phase13-next` @ `7964fcce`, worktree state exactly as section 1 (ten status entries) throughout |
| Identity provider | Keycloak 19.x, `start-dev`, `http://localhost:8080`; realm `iips` provisioned with the tracked, unmodified `frontend/server/live/keycloak-provision.mjs` (client `iips-spa`, roles `iips-admin` / `iips-analyst` / `iips-viewer`, users as provisioned); credentials are test-only and are never written to any repository |
| Session | one real Keycloak OIDC authorization-code + PKCE browser login as user `admin-a` (realm role `iips-admin`, tenant A) through the SPA Sign-in button; no token injection, no mock, no bypass |
| Transport | `frontend/server/executive-transport.ts` @ `7964fcce`, started from the checkout without modification, port 8787 |
| Frontend | Vite development server from `frontend/`, port 5173, `/api` proxied to 8787 as configured |
| Dependencies | if `frontend/node_modules` or `iips-platform/node_modules` is absent, `npm ci` (lockfile-pinned, no arguments that alter manifests) may be run once per package; `npm install`, `npm update`, `npm audit fix` and any dependency addition are prohibited; the four manifest/lockfile blobs of section 1 must be byte-identical afterwards |
| Browser | Microsoft Edge or Google Chrome (stable), viewport exactly 1440 x 900 CSS pixels, device scale factor 1, light theme (application default), no DevTools panel, overlay, ruler or extension visible in the image |
| Capture | full-size (full-page) PNG per route via the browser capture facility or a capture tool installed entirely outside both checkouts; one capture per route of section 8, taken after the surface has finished loading (no loading skeleton visible) |
| Staging | `G:\IIPS\e2e-018-capture\<UTC-yyyymmddThhmmssZ>\`; the directory must not exist before the run; exactly nineteen `.png` plus `CAPTURE_MANIFEST.json` afterwards |
| Product-tree writes during Stage A | none; the only expected untracked side effects are gitignored (`node_modules/`, `.vite/`) |
| Tests, typecheck, builds | none (`npm test`, `tsc`, `vite build` not authorized) |

An advisory panel that renders `AI explanation unavailable` is captured as rendered; it is never fixed, hidden or re-captured after code change. A surface that cannot be reached with the `admin-a` session is not captured; its file is simply absent from staging, section 6 then fails closed, and the cells it serves remain `ABSENT` for the later determination gate.

## 5. STAGE B - EXACT PRODUCT ALLOW-LIST

Directory `docs/v3.0/e2e-018-screenshots/` (must be absent before Stage B). Exactly these twenty files, no others:

```text
CAPTURE_MANIFEST.json
admin-engines.png
executive.png
company-intelligence_banking.png
company-intelligence_insurance.png
company-intelligence_capital-markets.png
company-intelligence_healthcare.png
company-intelligence_hospitality.png
company-intelligence_energy.png
company-intelligence_utilities.png
company-intelligence_consumer.png
company-intelligence_industrials.png
company-intelligence_technology.png
company-intelligence_telecommunications.png
company-intelligence_automobile.png
company-intelligence_materials-metals.png
sector-intelligence_banking.png
cross-sector-intelligence.png
decision-matrix.png
screener.png
```

Creation is a byte-for-byte copy from the validated staging directory using CreateNew semantics; an existing file at any target path is a hard failure, never an overwrite. No other path under the product tree may be created or modified.

## 6. POST-CAPTURE VALIDATION (conditions row 2; all must hold; any failure -> no Stage B)

| # | Check |
|---|---|
| V1 | Staging directory contains exactly nineteen `.png` files and one `CAPTURE_MANIFEST.json`, names exactly as section 5 (case-sensitive); nothing else |
| V2 | Every PNG: size greater than zero; first eight bytes `89 50 4E 47 0D 0A 1A 0A`; IHDR width exactly 1440; IHDR height at least 900 |
| V3 | Every PNG SHA-256 equals its manifest entry; every manifest `bytes` equals the file length |
| V4 | Manifest is ASCII, LF, valid JSON; contains exactly nineteen capture entries; `productCommit` equals `7964fccefbf95341699bf56b5833b2432981767d`; `authorityRecord` names this record and its SHA-256 |
| V5 | Every entry carries all fields of section 7 non-empty; `authMode` equals `real-keycloak-oidc-pkce`; `user` equals `admin-a`; `role` equals `iips-admin`; `hij` equals `H NOT PERFORMED`, `I NOT PERFORMED`, `J NOT PERFORMED`; `operator` equals exactly `desktop-no0nhtp\user -- DESKTOP-NO0NHTP` |
| V6 | The union of `servesMatrixRows` over the nineteen entries equals rows 1 to 43 plus A1, A2, A3 (46 cells, none unserved, none served by an entry whose route does not match section 8) |
| V7 | Product checkout unchanged: HEAD `7964fcce`; index empty; status exactly the ten entries of section 1; four calibration and six Tier-2 hashes unchanged; both matrices at HEAD equal their pins; four manifest/lockfile blobs unchanged; `docs/v3.0/e2e-018-screenshots/` absent; zero image files in the tree, in untracked paths and under `docs/` |
| V8 | No file in staging is a capture of the Sign-in, `403`, `NotYetAuthorized`, loading or error state (operator attestation recorded in `observables`; the later determination gate re-examines the images) |

## 7. MANIFEST AND PROVENANCE REQUIREMENTS (`CAPTURE_MANIFEST.json`)

Top level: `schema` (`e2e-018-capture-manifest/1`), `productCommit`, `productParent`, `authorityRecord` (path), `authorityRecordSha256`, `matrixPath`, `matrixSha256` (`ee45d98e6e325c806178c4baa5d3a4660d5e82f235e7576735c44f7604eb5b11`), `capturedUtcStart`, `capturedUtcEnd`, `operator` (exactly `desktop-no0nhtp\user -- DESKTOP-NO0NHTP`), `machine` (`DESKTOP-NO0NHTP`), `os` (name and version), `browser` (name and version), `viewport` (`1440x900`, scale 1), `theme` (`light`), `keycloak` (`version`, `url`, `realm` `iips`, `client` `iips-spa`, `user` `admin-a`, `role` `iips-admin`, `tenant`), `transport` (`file` `frontend/server/executive-transport.ts`, `commit` `7964fcce`, `port` 8787), `frontend` (`port` 5173), `dataBaseline` (`program-v1.1-certification/PROGRAM_v1.1_REPLAY_BASELINE.json`, blob `63bcd350f2cda2b0337097c25236fd8dbe82d87b`), `hij` (`H`, `I`, `J` each exactly `NOT PERFORMED`), `runtimeNotes` (`npm ci` performed yes/no per package; advisory panel state; anything unusual), `captures` (array of nineteen).

Per capture entry: `file`, `sha256`, `bytes`, `width`, `height`, `route` (exact URL path including encoding, e.g. `/research/company/Capital%20Markets`), `surface`, `capability` (engine id and IES, or `AI Advisory (non-engine)`), `servesMatrixRows` (array), `authMode` (`real-keycloak-oidc-pkce`), `capturedUtc`, `observables` (what is visibly rendered: headings, table row count, badges, advisory state), `notes`.

Provenance rule: the manifest records what happened; it never records H, I or J as performed, never claims certification, parity, readiness or organizational independence, and never invents an identity.

## 8. DETERMINISTIC COVERAGE MAP (nineteen captures serve forty-six cells)

| File | Route | Surface | Capability | Matrix rows served |
|---|---|---|---|---|
| `admin-engines.png` | `/admin/engines` | Admin registry (Engines & Certification) | all thirteen engines (one registry table) | 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37 |
| `executive.png` | `/executive` | Executive | all thirteen engines and CSIP | 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41 |
| `company-intelligence_banking.png` | `/research/company/Banking` | Company Intelligence (AI Advisory embedded) | `sector.banking` (IES-006.2A) | 3, A1 |
| `company-intelligence_insurance.png` | `/research/company/Insurance` | Company Intelligence (AI Advisory embedded) | `sector.insurance` (IES-007) | 6 |
| `company-intelligence_capital-markets.png` | `/research/company/Capital%20Markets` | Company Intelligence (AI Advisory embedded) | `sector.capital-markets` (IES-008) | 9 |
| `company-intelligence_healthcare.png` | `/research/company/Healthcare` | Company Intelligence (AI Advisory embedded) | `sector.healthcare` (IES-009) | 12 |
| `company-intelligence_hospitality.png` | `/research/company/Hospitality` | Company Intelligence (AI Advisory embedded) | `sector.hospitality` (IES-010) | 15 |
| `company-intelligence_energy.png` | `/research/company/Energy` | Company Intelligence (AI Advisory embedded) | `sector.energy` (IES-011) | 18 |
| `company-intelligence_utilities.png` | `/research/company/Utilities` | Company Intelligence (AI Advisory embedded) | `sector.utilities` (IES-012) | 21 |
| `company-intelligence_consumer.png` | `/research/company/Consumer` | Company Intelligence (AI Advisory embedded) | `sector.consumer` (IES-013) | 24 |
| `company-intelligence_industrials.png` | `/research/company/Industrials` | Company Intelligence (AI Advisory embedded) | `sector.industrials` (IES-014) | 27 |
| `company-intelligence_technology.png` | `/research/company/Technology` | Company Intelligence (AI Advisory embedded) | `sector.technology` (IES-015) | 30 |
| `company-intelligence_telecommunications.png` | `/research/company/Telecommunications` | Company Intelligence (AI Advisory embedded) | `sector.telecommunications` (IES-016) | 33 |
| `company-intelligence_automobile.png` | `/research/company/Automobile` | Company Intelligence (AI Advisory embedded) | `sector.automobile` (IES-017) | 36 |
| `company-intelligence_materials-metals.png` | `/research/company/Materials%20%26%20Metals` | Company Intelligence (AI Advisory embedded) | `sector.materials-metals` (IES-020) | 39 |
| `sector-intelligence_banking.png` | `/research/sector/Banking` | Sector Intelligence (AI Advisory embedded) | AI Advisory (non-engine) | A2 |
| `cross-sector-intelligence.png` | `/research/cross-sector` | Cross-Sector Intelligence | CSIP | 40 |
| `decision-matrix.png` | `/intelligence/decision-matrix` | Decision Matrix (AI Advisory embedded) | CSIP; AI Advisory (non-engine) | 42, A3 |
| `screener.png` | `/screener` | Screener (composed cross-sector view) | CSIP | 43 |

Row A1 (AI Advisory embedded in Company Intelligence) is served by `company-intelligence_banking.png`. Coverage: 13 + 14 + 13 + 1 (A1 with banking) + 1 + 1 + 2 + 1 = 46 cells; each of the 46 appears exactly once.

## 9. EXPLICITLY PROHIBITED UNDER THIS AUTHORITY

- Any change to any tracked product file; any new file under the product tree other than the twenty files of section 5 (gitignored `node_modules/` and `.vite/` excepted); any write to `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md`, `docs/v3.0/E2E-017_ENGINE_MASTER_MATRIX.md`, the IVM, `ROADMAP.md`, calibration files, Tier-2 tests, D36 documentation or the inventory baseline.
- Any `git add`, `git commit`, `git push`, tag, branch, reset, restore, checkout, stash, clean, merge, rebase or cherry-pick in either checkout under this authority.
- Any image format other than PNG; any image that is cropped, annotated, scaled, composited or otherwise edited after capture; any viewport other than 1440 x 900; any dark-theme or DevTools-overlaid capture.
- Treating a Sign-in, `403`, `NotYetAuthorized`, loading or error rendering as a certified product surface; substituting an unauthenticated or mock session for the real `admin-a` Keycloak session.
- Any parity value, any change of the E2E-018 status, any H / I / J re-determination, any certification, A2 -> A1, release, tag, production-readiness or release-readiness statement, any claim of organizational independence (the operator is role-separated and is not organizationally independent), any D7 closure.
- `npm install`, `npm update`, `npm audit fix`, dependency addition, `npm test`, `tsc`, `vite build`, or installation of any capture tool inside either checkout.
- Any capture in the recording environment; any access to the maintainer machine from the recording environment.

## 10. PRE / POST INVARIANTS

### 10.1 Before Stage A and again before Stage B (read-only; any failure -> stop)

- Governance: `G:\IIPS\arena-governance` on `arena/01a03e3b-iips-review-recovered`; HEAD == live `ls-remote` == the commit that carries this record (parent `4521d30fbb8249e1dd1b80164bf220279f383c57`); this record present with its pinned SHA-256; worktree clean.
- Product: `G:\IIPS\phase13-next-authority` on `phase13-next`; HEAD == tracking ref == live `ls-remote` == `7964fccefbf95341699bf56b5833b2432981767d`; parent `f8aa038e78373113858459c8136ba888cae6520c`; index empty; status exactly the ten entries of section 1; four calibration and six Tier-2 hashes unchanged; `docs/v3.0/E2E-018_SCREENSHOT_CERTIFIED_PRODUCT_PARITY_MATRIX.md` and `docs/v3.0/E2E-017_ENGINE_MASTER_MATRIX.md` at HEAD equal their pins; IVM and ROADMAP blobs unchanged; four manifest/lockfile blobs unchanged.
- Screenshot state: `docs/v3.0/e2e-018-screenshots/` absent; zero image files in the tree, in untracked paths and under `docs/`.
- Stage A only: staging directory absent; Keycloak discovery document at `http://localhost:8080/realms/iips/.well-known/openid-configuration` reachable (recorded as a runtime fact, not as criterion H); transport 8787 and frontend 5173 answering.

### 10.2 After Stage A (post-capture validation)

- Section 6 V1 to V8 in full.

### 10.3 After Stage B (read-only)

- Exactly twenty new untracked paths, all under `docs/v3.0/e2e-018-screenshots/`, names exactly as section 5; each byte-identical (SHA-256) to its staging counterpart; no other new, modified or deleted path; status == ten baseline entries + twenty `??` entries; index empty; HEAD `7964fcce`; both matrices, IVM, ROADMAP, calibrations, Tier-2 tests and manifests/lockfiles unchanged; no tag; nothing pushed.
- E2E-018 remains PARTIALLY COMPLETE; every live-side cell of the matrix still reads `ABSENT` (the matrix is unchanged); H / I / J remain `NOT PERFORMED`; `D7-TIER3-PARITY` and `D7-TIER3-INDEPENDENCE` remain OPEN; no certification, promotion or release exists.
- On any failure after a write: stop, report the failed invariant and the state; no rollback; no deletion; human review.

## 11. RECORDING-GATE INVARIANTS (this record)

- Exactly one file created: `governance/iips/DEC-E2E-018-SCREENSHOT-CAPTURE-EXECUTION-AUTHORITY.md` on `arena/01a03e3b-iips-review-recovered` at HEAD `4521d30fbb8249e1dd1b80164bf220279f383c57`, CreateNew; ASCII, no BOM, LF, exactly one final newline, no trailing whitespace; byte length and SHA-256 verified before and after the write.
- Preflight: governance root, branch, HEAD == live ref == `4521d30fbb8249e1dd1b80164bf220279f383c57`, index empty, worktree clean, target absent, five predecessor records content-hash pinned; live `refs/heads/phase13-next` == `7964fccefbf95341699bf56b5833b2432981767d`; if the product checkout is present it is inspected read-only only.
- Post-write: exactly one untracked entry (this record); nothing staged; HEAD unchanged; Record ID once; exactly one `**YES**` row and one conditional row; twenty allow-list names present; no prohibited claim.
- No commit, no push, no product operation, no capture, no browser, no server, no test by the recorder.

## 12. LATER GATES (none authorized by this record)

1. **STATUS RECORD COMMIT/PUSH GATE for this record** (governance-only; explicit path; one commit, parent `4521d30fbb8249e1dd1b80164bf220279f383c57`, subject `E2E-018: record screenshot capture execution authority`; single refspec, fast-forward, no force, no tags).
2. **E2E-018 STAGE A CAPTURE + POST-CAPTURE VALIDATOR** (maintainer-executed; read-only on the product; validates the staging directory per section 6).
3. **E2E-018 STAGE B ARTIFACT-CREATION GATE** (maintainer-executed; CreateNew copy of the twenty files; section 10.3 verification).
4. **E2E-018 CAPTURE-ARTIFACT COMMIT/PUSH GATE** (product; one commit adding exactly the twenty files; separate authority).
5. **E2E-018 CAPTURE VERIFICATION AND PARITY DETERMINATION** (read-only reconciliation; assigns parity values per row in a governance record; may re-determine the E2E-018 status).
6. **E2E-018 MATRIX AMENDMENT AUTHORITY** (separate; the only route by which a live-side cell may change).
7. Optional successor to `DEC-D13-HIJ-EXECUTION-AUTHORITY` for H / I / J re-determination; certification and D7 gates are not implied by anything above.

---

# **DEC-E2E-018-SCREENSHOT-CAPTURE-EXECUTION-AUTHORITY RECORDED - STAGE A CAPTURE EXECUTION GRANTED (MAINTAINER WINDOWS MACHINE ONLY) - STAGE B EVIDENCE-ARTIFACT CREATION GRANTED CONDITIONAL ON SECTION 6 - EXACTLY 19 PNG + 1 MANIFEST UNDER docs/v3.0/e2e-018-screenshots/ - NO MATRIX AMENDMENT - NO PARITY DETERMINATION - NO H/I/J RE-DETERMINATION - NO CERTIFICATION - NO A2 -> A1 - NO RELEASE - NO TAG - NO IVM / ROADMAP CHANGE - E2E-018 REMAINS PARTIALLY COMPLETE - D7-TIER3-PARITY OPEN - D7-TIER3-INDEPENDENCE OPEN**
