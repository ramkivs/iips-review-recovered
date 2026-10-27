# IIPS v3.0 — 51 × 17 Capability Matrix: Full Current-State Investigation and Reconstruction (`2026-10-27`)

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAPMATRIX-51X17-RECONSTRUCTION-2026-10-27-01` |
| **Record type** | Independent current-state investigation, reconstruction and reconciliation of the 51 × 17 capability matrix. Creates no authority, lifts no fence, admits no lineage, provisions nothing and renders no acceptance, qualification or release decision |
| **Investigation date** | `2026-10-27` (UTC) |
| **Investigator** | Arena Agent Mode — read-only investigation, execution of existing test/build/route surfaces, and documentation only |
| **Repositories** | `ramkivs/iips-review-recovered` (IRR) and `ramkivs/iips-production-market-data` (IPD) |
| **Prior artefacts (treated as prior records only, never as current status)** | `IIPS-V3-CAPMATRIX-51X17-RECONSTRUCTION-2026-10-23-01` (IPD `evidence/cross-repository/`, blob `90131a05…`; CSV blob `b02d5859…`); tracker §18.1 |
| **Deliverables** | This report; `evidence/integration/capability-matrix-51x17-2026-10-27/IIPS_V3_CAPABILITY_MATRIX_51x17_2026-10-27.csv`; `…​.xlsx`; reproducible generator + verifier in the same directory |

> **Starting condition.** No matrix spreadsheet is present in Arena, IRR or IPD as a standalone
> artefact on any current ref. The only matrix of record is master tracker §18.1, whose values were
> re-derived from primary evidence for this pass; the 2026-10-23 reconstruction was read as a prior
> record and re-tested cell by cell. **No cell in §H is carried forward on a prior record's authority.**

---

## A. Investigation baseline

### A.1 Repository state (verified live at the start and re-verified before publication)

| Item | IRR `ramkivs/iips-review-recovered` | IPD `ramkivs/iips-production-market-data` |
|---|---|---|
| Default branch | `main` | `main` |
| `main` commit | **`f74af6d4f488ebf6d3e3a94f612a0d831b6b765a`** (merge of PR #320) | **`888eb375eebee01640e44ccdcbb138a71e8c4513`** |
| `main` root tree | **`ed424ffbe4e3b3863ff00a47aa25fa0ca4e0c62f`** | **`cf3b90482fa7ed1f9780f20a9286164686885d2b`** |
| Commits reachable from `main` | 850 (full, non-shallow clone) | 328 (full, non-shallow clone) |
| Remote branches | 240 | 89 |
| Tags | `program-v1.2.0` → commit `5decdca9…` (tag object `4ec8812e…`); `v3.0-phase12-certified` → `7325aeda…` (tag object `a975b0dc…`) | 6 (`iips-pin-*` and cleanup tags) |
| Open pull requests | **0** | **0** |
| Releases | `program-v1.2.0` — "Program v1.2.0 — 13-Engine Successor LTS", published `2026-09-05T06:11:08Z`, not draft, not prerelease | 0 |

**Verification environment.** Linux sandbox (`Debian 12`, kernel `6.1.158+`); Node `v22.22.3`; npm `10.9.8`;
Python `3.11`; `gh` authenticated against both repositories. `npm ci` required
`NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/e2b-ca.crt` because the sandbox TLS-intercepting
proxy otherwise fails on `codeload.github.com` — the caveat the operator runbook documents. TLS
verification was **not** disabled and no lockfile was modified. Egress exists only to GitHub/npm/PyPI;
MoSPI is unreachable, which is why the macro route returns its documented `502` refusal here.

### A.2 Refs, branches and PRs examined

- **IRR:** `main`; `origin/arena/a2df3b85-iips-review-recovered` (carries the G24 lineage commit `470cc698`);
  `origin/promotion/governed-reports-candidate` (`4906a6b`); `origin/arena/01a0f1b3-…` (`6a8afbb`);
  `origin/feat/global-no-auth-implementation` (retired auth stack); `gate-b/local-principal-ipc-implementation{,-r2}`;
  both annotated tags; merges #310–#320.
- **IPD:** `main`; the six tags; the `arena/feda2d8c-…` draft-#42 lineage; `src/**` and `tests/**` at `888eb375`.
- **Ancestry was tested with full clones.** The Arena workspace checkout of IRR is a depth-1 clone
  (`git rev-parse --is-shallow-repository` → `true`) — the trap recorded as D-08 in 2026-10-23. No
  ancestry conclusion anywhere in this record comes from that checkout; a full clone and a fresh IPD
  clone were used instead.

### A.3 Authoritative tracker and decision registers

| Register | Location | Use in this pass |
|---|---|---|
| Master tracker + IRR/IPD decision register | IRR `IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (now through §16.149) | Primary reconciliation source; §18.1 re-tested row by row |
| Program authority decisions `REG-01`…`REG-13` | tracker §2 | Effective where recorded |
| Work-item register `CV-*` | tracker §16.4 | Status claims re-tested per row |
| IRR integration records | IRR `docs/integration/` (286 entries) | Effective only when merged to `main` |
| IPD cross-repository records | IPD `evidence/cross-repository/` | Effective only when merged to `main` |
| Prior matrix | tracker §18.1; IPD `evidence/cross-repository/IIPS_V3_CAPABILITY_MATRIX_51x17_*` | Prior record only |

### A.4 Validation actually executed in this pass (not reported by a prior record)

| Check | Command | Result at the stated baseline |
|---|---|---|
| IRR typecheck | `npm run typecheck` (`tsc --noEmit`) | **exit 0** |
| IRR replay-server typecheck | `npm run typecheck:replay-server` | **exit 0** |
| IRR full suite | `npx vitest run --reporter=json` | **106 test files / 365 suites / 1,350 tests / 1,350 passed / 0 failed** |
| IRR build | `npm run build` | **exit 0**; 142 modules; main chunk **1,609.84 kB** (gzip **226.69 kB**) |
| IRR restart block | `vitest run` on `persistence-restart-proof`, `consumer-restart-read`, `owner-context-restart`, `reports-restart` | **15 / 15 passed** (4 files) — genuine separate OS processes |
| IRR fence/adapter/boundary block | 6 files (`fenceUnchanged`, `ipcPortAdapter`, `option2F`, `ownerContextFromBinding`, `user-portfolio-transport`, `reports-transport`) | **112 / 112 passed** |
| IRR reports block | `reports-api`, `reports-persistence-integration`, `Reports.test.tsx` | **20 / 20 passed** |
| IPD install/typecheck/build | `npm ci`; `npx tsc --noEmit`; `npm run build` | **exit 0 / exit 0 / exit 0** |
| IPD guarded suite | `node scripts/run-tests.mjs` | **924 tests / 923 passed / 1 skipped / 0 failed**; `[test-guard] OK` |
| IPD package consumer | `npm run test:package-consumer` | **PASS**; pack `1,729,700` B; forbidden hits `[]`; strict typecheck `skipLibCheck:false` |
| Fence blobs | `git hash-object` at IRR `main` | `reports-transport.ts` **`775d282b…`**; `user-portfolio-transport.ts` `51704c12…`; `owner-context-unavailable.ts` `cb8db45d…`; `userPortfolioContract.ts` `e6b57bb8…` |
| Ancestry (G24 lineage) | `git merge-base --is-ancestor 470cc698 origin/main` | **NOT an ancestor**; `origin/arena/a2df3b85-…` is `692` behind / `7` ahead of `main` |
| Pin census | `frontend/package.json:24-26` + `package-lock.json` | **three** IPD specifiers: `8eec74ae…` (main), `2e11fa3b…` (np04), `70b24f02…` (broker-import) |
| Consumer import census (IPD) | `grep` of `durablePortfolioStorePort` / `brokerImportPersistence` | **tests only** — no production consumer |
| D115 consumer census (IRR) | `grep` of `d115-runtime` importers | **its own test file only** — zero runtime consumers |
| Release | `gh release view program-v1.2.0` | published `2026-09-05T06:11:08Z`, not draft, not prerelease |

### A.5 Live route probe — composed IRR server at `main@f74af6d4` (2026-10-27)

The server was started exactly as the operator runbook prescribes (`npx tsx server/executive-transport.ts`).
Every row below was executed in this pass.

| Route | Result | Matrix rows it evidences |
|---|---|---|
| `GET /api/health` | `200` | transport up |
| `GET /api/executive` | `200`, `PF-REAL`, 13 holdings | 1 |
| `GET /api/portfolio` | `200`, `PF-REAL`, 13 holdings | 2 |
| `GET /api/company/banking` | `200`, `Banking-H1`, `Watch`, `47.1` | 3 |
| `GET /api/sector/banking` | `404 not found` | 4 (surface composes five governed routes; no such endpoint by design) |
| `GET /api/cross-sector` | `200`, `avgConviction 72.9` | 5 |
| `GET /api/engines` | `200`, 13 engines | 6 |
| `POST /api/engines/sector.banking/execute` | `200`, `COMPLETED`, `SNAP_00034F55` | 6 |
| `POST /api/screener` (valid) | `200`, `memberCount 13`, 13 members, `NP12-SCREEN-EVALUATOR` | 7, 41 |
| `POST /api/screener` `{}` | `400 missing-definition` | 7 fail-closed |
| `POST /api/screener` (coerced id) | `422 INVALID_IDENTIFIER` | 7 fail-closed |
| `GET /api/evidence/banking` | `200`, `referenceOnly:true` | 13 |
| `GET /api/replay/banking` | `200`, `original:null`, `NOT_PERFORMED`, `SECTOR_REFERENCE_NOT_CAPTURE` | 15 |
| `GET /api/ai-advisory/banking` | `200`, `nonAuthoritative:true`, `grounded:true` | 18 |
| `GET /api/pit/market-data` `ISIN:INE467B01029:EQ` / `D01_QUOTES` / `2026-02-10T00:00:00.000Z` | `200`, `found:true`, `resolvedAsOf 2026-01-05T15:30:00.000Z`, full provenance | 20 |
| `GET /api/pit/market-data` `…:BL` / same asOf | `200`, `found:true` (distinct series) | 20 |
| `GET /api/pit/market-data` typed misses | `404` with `INVALID_IDENTITY` / `INVALID_DOMAIN` / `INVALID_ASOF` | 20 fail-closed |
| `GET /api/macro/NAS?indicatorCode=1` | `502 RETRY_BUDGET_EXHAUSTED` (`dataset NAS`) | 19 (documented no-egress refusal, **not** a defect) |
| `GET /api/user-portfolios`, `/api/watchlists`, `/api/settings`, `/api/collaboration` | `503 owner-context-unavailable` | 9, 10, 11, 30, 34 |
| `GET /api/reports/context`, `POST /api/reports/artifacts` | `503 owner-context-unavailable` | 34, 35, 37 |
| `GET /api/reports`, `/api/reports/summary`, `/api/broker-import`, `/api/not-a-route` | `404 not found` | 34 (no unfenced sub-route is exposed) |

**Reading rule for the `503`s.** A fail-closed `503` is the *required* behaviour while no ownership
source and no carrier exist. It is recorded as correct wiring, not as a defect — and it means rows
9/10/11/30/35/37 could not be exercised over HTTP in this environment; their persistence and recovery
evidence comes from the executed separate-process suites, which drive the real services.

---

## B. Complete capability assessment (all 51)

Disposition buckets are assigned explicitly in `disposition.py` (never inferred from cell text) and
counted in §E. "Change vs 2026-10-23" compares against the prior reconstruction **and** tracker §18.1;
"—" means the status is unchanged after re-derivation.

| # | Capability (owner) | Disposition | Current state (one line) | Change vs 2026-10-23 |
|---|---|---|---|---|
| 1 | Executive dashboard + certified executive DTO (IRR) | `ACCEPTED` | Route, DTO and client wired; live `200`, 13 holdings. | — |
| 2 | Portfolio workspace + certified reference holdings read (IRR) | `ACCEPTED` | Reference workspace wired; live `200`; distinct from the fenced owner path. | — |
| 3 | Research — company intelligence (IRR) | `ACCEPTED` | Snapshot view wired; live `200`. | — |
| 4 | Research — sector surface (IRR) | `ACCEPTED` + follow-up | Implemented, mounted, PA-approved contract; browser E2E operator-owned. | — |
| 5 | Cross-sector intelligence pipeline (IRR + platform) | `ACCEPTED` + follow-up | IRR pipeline wired and live; platform CSIP/v1.1 chain source-reported. | — |
| 6 | Engine registry + engine execution surface (IRR + platform) | `ACCEPTED` | 13-engine registry; live execute returned `COMPLETED`. | E2E re-verified live (was `VP` in §18) |
| 7 | Governed Screener — N4 certified producer (IRR) | `ACCEPTED` | 13-member governed screener proven live (13/13); two refusal classes re-executed. | — |
| 8 | NP-12 producer convergence `A6-IMPL-10` (IRR) | `DEFERRED` | Producer convergence not built; Option B is the final disposition. | — |
| 9 | Watchlists (IRR + Class-C journal) | `ACCEPTED` | Journal-backed; separate-process restart read re-proven. | restart proof re-executed |
| 10 | Collaboration (IRR + journal) | `ACCEPTED` | Journal-backed; thread/comment/vintage recovery re-proven. | restart proof re-executed |
| 11 | Settings incl. reset (IRR + journal) | `ACCEPTED` | Journal-backed; update **and** reset recovery re-proven. | restart proof re-executed |
| 12 | Owner-context carrier + fail-closed owner fence (IRR) | `ACCEPTED` | Carrier + fence behave as designed; 8/8 restart tests executed. | — |
| 13 | Evidence landing + explorer (IRR) | `ACCEPTED` | Landing/explorer wired; live `200` reference-only evidence. | — |
| 14 | Evidence snapshots surface (platform + IRR route) | `OOS` | Reserved placeholder on IRR; platform implementation only. | — |
| 15 | Evidence replay + v1.1.0 Replay Baseline (IRR) | `ACCEPTED` | Stage A capture/replay accepted; live `NOT_PERFORMED` semantics correct; no durable archive. | — |
| 16 | Replay landing route (IRR) | `OOS` | Bare landing reserved unavailable by PA decision. | — |
| 17 | Decision matrix (IRR) | `ACCEPTED` | Wired; live `200`. | — |
| 18 | AI advisory over certified results (IRR) | `ACCEPTED` | Wired; live `200`, explicitly non-authoritative. | — |
| 19 | Macro / D08 guarded read — NAS, CPI, IIP (IRR) | `ACCEPTED` + follow-up | Wired; sandbox returns documented `502`; live-source E2E remains operator-host only. | — |
| 20 | PIT read seam + `/api/pit/market-data` (IRR ↔ IPD, Gate 43) | `ACCEPTED` | Live `200 found:true` with vintage resolution (`2026-02-10` → `2026-01-05`) + provenance; typed misses reproduced. | **pin anchor reconciled**: served from `./pit` of the `8eec74ae…` package, not `2e11fa3b`/`2d9130e7` |
| 21 | PIT UI surface (IRR) | `OOS` | API-only by decision; no UI route exists (verified). | — |
| 22 | D115 runtime CompanyId boundary (IRR) | `IMPLEMENTED` | Boundary + tests present; **zero** runtime consumers (re-verified by import census). | — |
| 23 | Universal Company identity / tenant authority (IRR + IPD) | `OOS` | Deliberately not built (`D-2` Option B); the decision is the deliverable. | — |
| 24 | Intelligence destination surface (IRR) | `ACCEPTED` | Three views admitted and routed; `/intelligence/*` splat still placeholder. | — |
| 25 | IPD security master + instrument identity mapping (IPD P04/D05) | `ACCEPTED` | Security master present and qualified, but **no record carries a `REAL` classification** — all `UNCLASSIFIED`/`UNKNOWN` (executed `SMI-01`). | **data fact corrected**: the "52 real / 2,198 synthetic" split is not per-record truth |
| 26 | IPD engine adapters + `CertifiedSectorEngineId` bridge (IPD WSD P11) | `ACCEPTED` | Library present with IPD-internal consumers; no IRR product consumer. | — |
| 27 | IPD offline shell (data plane + UI) | `ACCEPTED` + follow-up | Shell surfaces + tests green; Windows visual verification remains source-reported. | — |
| 28 | Broker ingestion chain (IPD) | `IMPLEMENTED` | Chain complete to the durable port; **no production consumer** (verified import census); durable leg unqualified. | — |
| 29 | Operator Drop (IPD) | `DEFERRED` | Parser preserved; product admission deferred by `REG-06`. | — |
| 30 | User-portfolio read surfaces — UI + typed client (IRR) | `BLOCKED` | UI + typed client complete and fail-closed; every route `503`; no ownership source provisioned, `P-1` unspent. | **scope narrowed**: accepted only as fail-closed composition; a data-backed read has never been demonstrated |
| 31 | `G-2` §5 HTTP contract + port + `D-2` §8 translation boundary (IRR) | `ACCEPTED` | Contract/port/boundary present; 112-test block green. | — |
| 32 | G24 durable store + IRR HTTP adapter (off-`main` lineages) | `BLOCKED` | G24 lineage still off-`main` (`470cc698` **not** an ancestor); branch now `692` behind / `7` ahead. | **distance re-measured** 499 → 692 behind |
| 33 | Owner→G24 binding chain `P-2` → `P-4` → `P-6` → `P-8` (IRR + IPD) | `OOS` | `P-2` closed in scope; `P-4`/`P-6`/`P-8` closed by `H-18`. | — |
| 34 | Fail-closed `503` fences — `/api/user-portfolios*`, `/api/reports*` (IRR) | `VERIFIED` | Refusals executed live across six families; user-portfolio fence blobs unchanged. | **reports fence blob changed** to `775d282b…` under the authorized R1/R2 rewrite |
| 35 | Reports domain on `main` (IRR) | `ACCEPTED` + follow-up | Domain **present on `main`** (10 files) after the 2026-10-25 re-implementation; F-7 qualified; backend accepted bounded; durable writes deferred (`CV-21` A2). | **material change**: absent (R4-B removal) → present and accepted bounded |
| 36 | Reports implementation lineage (branch-only) | `BRANCH-ONLY` | Historical lineage still branch-only and must not be promoted; it is **not** the current implementation. | **distinction sharpened** — current `main` implementation is the re-implementation |
| 37 | Reports UI + no-auth port (IRR) | `ACCEPTED` | `/reports` + `/reports/:id` mounted; no-auth port wired; `CV-51` accepted bounded read-only. | **material change**: branch-only/absent → accepted on `main` |
| 38 | Class-C journal persistence service (IRR PF-1) | `ACCEPTED` | Append-only journal with separate-process recovery executed today. | restart proof re-executed |
| 39 | Data-directory policy — TD-7a local, TD-7b production profile (IRR) | `ACCEPTED` + follow-up | TD-7a works (`IIPS_DATA_DIR`, `.gitignore:149`); TD-7b deferred. | — |
| 40 | Certified-analytics ↔ user-portfolio integration | `OOS` | Excluded by `G-2` §7. | — |
| 41 | Governed-universe widening for owner data (IRR) | `DEFERRED` | 13-row universe preserved (screener `memberCount 13` executed); expansion deferred (`CV-22` Option C). | — |
| 42 | WorkflowRuntime (platform, historical-only) | `HISTORICAL` | Present in the platform tree; one regression test consumes it; not re-executed here. | — |
| 43 | CSIP + v1.1 certification tracks (platform + cross-sector) | `HISTORICAL` | Certificates/baselines present; historical qualification, not re-run. | — |
| 44 | Retired auth/admin stack on unmerged branches (IRR) | `OOS` | `main` has zero auth/OIDC source paths; the retired stack survives only on unmerged branches. | — |
| 45 | Package + ref durability of the IPD pin (IRR + IPD) | `ACCEPTED` + follow-up | Three IPD specifiers install from `codeload`; consumer pin remains the approved baseline `8eec74ae…` while the S2/P-1 basis is the candidate `001c3c80…`; `70b24f02…` unguarded. | **pin set corrected**: three specifiers, not one |
| 46 | IPD test-runner false green (IPD) | `ACCEPTED` | Guarded runner executed and printed its count: `924` tests, guard `OK`. | **count moved** 875 → 924 |
| 47 | Operator runbook + server start path (IRR) | `ACCEPTED` + follow-up | Start path works; runbook figures now reproduce exactly at head (106 files / 1,350 tests; 1,609.84 kB). | **stale-figure defect resolved** |
| 48 | Program documentation + tracker integrity (IRR + IPD) | `ACCEPTED` + follow-up | Tracker through §16.149, overlay practice intact; three stale §18 cells and one drifted pin anchor remain (§C). | **degraded then improved**: new sections published, three cells still stale |
| 49 | v1.2.0 release state (IRR) | `ACCEPTED` | Tag + GitHub Release live and consistent. | — |
| 50 | Gate C `P-2` establishment + amended one-artifact deposit (governance) | `ACCEPTED` | Deposit verified; closed for in-scope criteria. | — |
| 51 | F5R disposition and F5 execution decision (governance) | `OOS` | F5R closed out of scope; no residual act. | — |

---

## C. Discrepancies

Each entry states the conflicting records, the authoritative evidence and why, the reconciled status and
the remaining corrective action.

### C-01 — §18 row 35 still says the Reports domain is absent; it is present on `main` and accepted (material)

- **Tracker says:** §18.1 row 35 `Existence` = "**NI — removed by the R4-B act**; fence and its tests
  remain"; anchor cites `reports-transport.ts` blob `98147054…`; row 35 acceptance `NOT SATISFIED`.
- **Repository says:** `frontend/server/reports/` carries **10 files** (`artifact`, `canonical`,
  `composition`, `index`, `np04-adapter`, `persistence-port`, `persistence` + 3 test files) and
  `reports-transport.ts` is blob **`775d282b…`**, an authorized rewrite headed "Implements the authorized
  non-authentication Reports transport under … `R1-OWNERSHIP-DECLARATION…` and `R2-CONTRACT-SHAPE…`".
  The F-7 qualification and capability-acceptance record (`IIPS-V3-REPORTS-NP06-F7-QUALIFICATION-AND-ACCEPTANCE-2026-10-25-01`)
  renders **F-7 `SATISFIED`** and **capability `ACCEPTED` (bounded non-production)**; `CV-51` closes as
  `ACCEPTED/CLOSED` per §16.116.
- **Why the repository is authoritative:** the tracker cell describes the 2026-10-13 R4-B removal; the
  2026-10-25 resumption re-implemented the domain under new acts. Both facts are true at different dates,
  and the tracker overlay (§16.106, §16.112–§16.116) was never carried back into the §18 row.
- **Reconciled:** row 35 = **present on `main`, accepted bounded non-production (backend)**, with the
  durable owner-scoped write path still deferred (`CV-21` A2 reaffirmed). Row 37 = accepted bounded
  read-only UI (already correct in §18).
- **Corrective action:** §18 row 35 (existence, acceptance, anchor) needs a dated overlay; the
  authoritative fix is published by this pass's tracker overlay (§16.150), which adds a correction record
  without editing the prior text.

### C-02 — §18 row 25 reports a "52 real / 2,198 synthetic" split that the executed test refutes

- **Tracker says:** row 25 `Data` = "P — 2,250 canonical entities, **52 real + 2,198 synthetic** (XV-9)".
- **Executed evidence says:** `tests/d05_security_master_integrity_semantics.test.ts:76` (`SMI-01`) —
  "no governed D05 record — of all 2,250 — receives a REAL classification; every record is UNCLASSIFIED
  with UNKNOWN origin" — and its `C2` assertion (a named issuer and a modelled filler resolve to the
  *same* origin state) plus its inline comment record that the aggregate split "is not per-record truth".
- **Why the executed test is authoritative:** it is the only check in either locus that reads every
  record's classification; the tracker figure is an aggregate carried from an earlier record.
- **Reconciled:** the 2,250-entity corpus exists; **no record is `REAL`**; the aggregate is a
  provenance summary, not a classification census. Row 25 remains `ACCEPTED` at non-production scope.
- **Corrective action:** correct the §18 row 25 data phrasing (overlay §16.150) and keep the D05
  classification state visible in any future security-master claim.

### C-03 — §18 row 30 marks acceptance `V`; a data-backed read has never been demonstrated

- **Tracker says:** row 30 `Acceptance` = "V — `G2-UI-CONSUMER-IMPLEMENTATION` + `RECOVERY-REPUBLICATION`
  records"; qualification "VP — still no data-backed run possible".
- **Evidence says:** those records accept the *fail-closed composition*; every executed route returns
  `503 owner-context-unavailable`; `P-1` is unspent and now formally blocked (`P-1-C` `NOT ESTABLISHED`
  per §16.148.3, `P-1-D` `DESIGNATED; NOT VERIFIED`).
- **Reconciled:** acceptance is real but bounded to fail-closed behaviour; **`NOT SATISFIED` for a
  data-backed owner read**. Recorded as `BLOCKED` with the acceptance split shown in-cell (matrix row 30).
- **Corrective action:** none beyond the overlay wording; the blocker itself is §D/O-01.

### C-04 — PIT pin anchors in §18 row 20 and `CV-05` are stale

- **Tracker says:** `CV-05`/§18 row 20 bind the PIT seam to the IPD pin `2e11fa3b` (later noted as
  `2d9130e7` after the 2026-10-23 reconciliation).
- **Evidence says:** `./pit` is exported by `iips-production-market-data` — pinned in
  `frontend/package.json:26` at **`8eec74ae27cda09f3c368b9c299895eae41554db`** — not by the np04
  package (`2e11fa3b`), which exports `./persistence` for the Reports boundary. The live probe answered
  from that package today.
- **Reconciled:** PIT seam pin = `8eec74ae…`; np04 pin = `2e11fa3b…`; broker-import pin = `70b24f02…`.
  Status (admitted, non-production) unchanged; only the anchor was wrong.
- **Corrective action:** overlay the three pins in §18 row 20 / `CV-05` (**done by this pass's §16.150**).

### C-05 — §18 row 45 treats the IPD pin as singular and does not record the unguarded third specifier

- **Tracker says:** "IRR `frontend/package.json` exact SHA pin" (singular).
- **Evidence says:** three specifiers (`8eec74ae…`, `2e11fa3b…`, `70b24f02…`), all resolved by the
  `npm ci` executed today; no in-tree guard asserts `70b24f02…`; the Reports R3-Option B record documents
  the second specifier, but nothing documents the third as a durability risk.
- **Reconciled:** row 45 remains `ACCEPTED` + follow-up (durability criterion met by installation), with
  the heterogeneous pin set and the unguarded third pin recorded as an open item (O-06).
- **Corrective action:** either publish a pin-guard test/record covering all three specifiers or record a
  PA disposition accepting the third pin as unguarded. **Not done here** — it would be an implementation act.

### C-06 — The 2026-10-23 "stale runbook figures" finding (D-03) is now resolved; the tracker still invites the old doubt

- **Prior record says:** three runbook figures no longer reproduce at the then-head (98 files / 1,197
  tests; 1,590.96 kB).
- **Evidence says:** the runbook was re-stamped on `2026-10-25` (§16.119) to "**106 files / 1,350 tests**"
  and "**1,609.84 kB**, gzip **226.69 kB**"; this pass measured exactly those values.
- **Reconciled:** D-03 **closed**; row 47 = `ACCEPTED` + follow-up (Linux-only evidence; Windows is a
  separate domain). No corrective action beyond marking the prior finding closed.

### C-07 — §18 anchor line numbers have drifted

- **Tracker says:** anchors such as `App.tsx:40` (row 3, company intelligence) and `App.tsx:48,52`
  (row 13, evidence).
- **Evidence says:** at head the routes sit at `App.tsx:40` (executive), `:51` (company), `:63`/`:67`
  (evidence), `:68-69` (reports). The cited line numbers now point at different routes.
- **Reconciled:** the anchors are correct as *historical* pointers, wrong as *current* ones; this record
  cites route paths and the file, not line numbers, in §H.
- **Corrective action:** refresh §18 anchors on the next tracker pass (overlay §16.150 records the drift).

### C-08 — Conflicting host facts on the F4 parent directory (unresolved, recorded not reconciled)

- **Record A (§16.146, 2026-10-27):** PF-13's "parent exists" condition is removed at P-1 scope
  (`DISP-01`), reasoning explicitly on the *stated absence* of `C:\iips-data\iips`.
- **Record B (§16.147/§16.148, capture `2026-10-26T20:13Z`):** the published preflight capture shows
  `StoreParentExists=True` on `DESKTOP-NO0NHTP`.
- **Status:** §16.148.2 already records this as a "parent-exists premise delta … recorded, not a blocker":
  creator and timing are unevidenced, the store and its sidecars remain absent (PF-12 intact), and under
  `DISP-01` existence is not a STOP.
- **Reconciled:** not a contradiction to resolve by inference — the creator is **unestablished** and no
  record claims authorship. Recorded here so no later reader treats either statement as the whole truth.
- **Corrective action:** none available from the repository; a host observation at attempt time resolves
  it (O-01).

---

## D. Outstanding work and blockers

| ID | Capability rows | Status and reason | Dependency / authority boundary | Closure condition | Next evidence or decision | Authorized now? |
|---|---|---|---|---|---|---|
| **O-01** | 30, 34 (and CAP-03 `P-1`) | `P-1-C` `NOT ESTABLISHED`; `P-1-D` `DESIGNATED; NOT VERIFIED`. The only preflight capture was **NOT ACCEPTED** (`T-1` wrong pin `8eec74ae…` vs designated `001c3c80…`; `T-2` PF-11 worktree limb; `T-3` instrument bytes unpublished; `T-4` freshness) | Host-only: designated host `desktop-no0nhtp`, non-elevated operator, Node ≥22.13 <23 | Fresh attempt-session capture with the published instrument at `001c3c80…`/`399fa44a…`, then acceptance review | Operator runs `evidence/integration/cap03-p1-f4-parent-preflight-reconciliation-2026-10-27/02-p1c-p1d-readonly-preflight.ps1` | **Deferred to operator** (no agent route to the host) |
| **O-02** | 30, 32, 35 | The single `P-1` provisioning attempt is `UNSPENT`; no store, binding, membership or audit row exists in either locus | Successor act §§8–9: one execution, one path, consumed on completion | `P-1-A…P-1-D` satisfied and evidenced, then the one attempt under §§8–9 | Host preflight acceptance (O-01) | **Blocked** — must not be attempted |
| **O-03** | 30, 32 | Owner-data durable read path unavailable: G24 lineage off-`main`, `CV-52` blocked, fences in force | `CV-52` admission act + a G24 promotion decision (`REG-12`) | Effective promotion/admission act + re-qualification on the designated host | PA decision | **Blocked** — needs a separate decision |
| **O-04** | 35 | Reports durable owner contract not established; `CV-21` deferral reaffirmed (A2) | `D-1` (ownership source) and `D-3` (contract shape) decisions at `REG-11` | `D-1`/`D-3` rendered + admission | PA decision | **Deferred** |
| **O-05** | 28 | IPD durable broker-import leg has no production consumer; admission withheld | `GOV-03`/`BI-08` durable-path admission | Admission act + a runtime qualification | PA decision | **Blocked** |
| **O-06** | 45 | Third IPD specifier (`70b24f02…`) and the heterogeneous pin set have no in-tree guard | Implementation act or explicit PA acceptance of the pin set | A guard test/record, or a disposition naming all three pins | Documentation or code act | **Requires a separate decision** |
| **O-07** | 48 (and C-01…C-05, C-07) | §18.1 rows 20, 25, 30, 35 and several anchors are stale | Documentation overlay under the `CV-CORR` convention | Dated overlay published (this pass publishes §16.150; the *edits* to §18 remain for a later pass) | Tracker pass | **Authorized for documentation only** — overlay published here |
| **O-08** | 19 | Live macro E2E never demonstrated from this environment | Operator host with MoSPI egress | A captured live-source transcript | Operator capture | **Deferred to operator** |
| **O-09** | 27 | Windows visual/offline-shell verification is source-reported only | Host-only | A captured Windows session transcript | Operator capture | **Deferred to operator** |
| **O-10** | 22 | `D115` boundary has zero consumers (retain-unwired) | `CV-43` disposition retained | Nothing, unless the PA commissions wiring | PA decision | **No action authorized** |

---

