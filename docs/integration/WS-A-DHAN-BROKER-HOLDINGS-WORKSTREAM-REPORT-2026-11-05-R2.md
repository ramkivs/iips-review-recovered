# Workstream A — Dhan Broker Holdings Import, Identity Resolution and Durable Persistence
## Consolidated report R2 (2026-11-05) — after the IPD PR #127 merge and the IRR pin advance

**Repositories:** `ramkivs/iips-review-recovered` (IRR) and `ramkivs/iips-production-market-data`
(IPD). **Ownership respected: every write in this pass landed in IRR only. Zero IPD writes.**
**IRR baseline:** `main@182580b33f9107f94d619cbfaf628fb88b67bd21` (PR #435 merged).
**Session branch (IRR):** `arena/0497f3e4-iips-review-recovered`.
**Predecessor:** `WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05.md` (R1), whose §14
blockers 1 and 2 are closed here and whose blockers 3, 4 and 5 are re-determined below.

> **Workstream A is NOT complete.** PR #127 merging and the pin advancing close the *identity
> evidence* line. Three requirements remain open and none of them is closable by IRR
> implementation: 67 authoritative identifiers, an HTTP evidence-route authority act, and Gate 4 /
> Gate 5. §9 lists them with owners and completion criteria.

---

## 1. Exact merged IPD commit from PR #127 — **VERIFIED**

| Item | Value |
| :--- | :--- |
| PR | [#127 — Fix Dhan broker holdings per-row identity assessment](https://github.com/ramkivs/iips-production-market-data/pull/127), `MERGED` at `2026-11-05T08:43:30Z` |
| Source branch | `arena/ws-a-dhan-68-row-identity-20261105` |
| Source (head) commit | `beb362d4ca8fb0a4f86e383d1893d031df2638a8` |
| **Merged commit** | **`7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`** |
| Merge parents | `b605a61458a655bb555c6f340332fcf77a85c870` (base) + `beb362d4ca8fb0a4f86e383d1893d031df2638a8` (head) |
| Merge tree | `37d3b4f3a567368df785ddf454740fae4a173446` |
| **IPD `origin/main` tip, resolved remotely** | **`7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`** — the merge commit *is* the tip |

The source commit is **not** the merge commit and was not assumed to be: `git ls-remote` and a
blobless clone were both used. Content verified remotely: PR #127 is 10 files / +6,806 −43 and adds
IPD's `broker-identity-assessment.ts` and `tests/ws_a_dhan_broker_holdings_identity.test.ts`.
Transcript: `evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/00-authoritative-remote-state.txt`.

> **Dated addendum (A-17, re-measured 2026-11-05) — the table above is preserved unamended.**
> It records the authoritative state **as resolved during the pin-advance pass**, and was correct
> then. IPD `origin/main` has since moved: IPD PR #126, *"Add Windows setup and validation bundle
> with native PowerShell corrections"*, merged at `2026-11-05T08:49:54Z` — about six minutes after
> PR #127 — putting the IPD tip at **`6df748d397daf965bd5b6e6e35df5043f7fa8c4d`**, whose **first
> parent is the pinned `7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`**. The pin target is *defined* as
> the merged commit of PR #127, so it does not move with IPD's tip, and the movement was measured to
> be immaterial: `7bcae35` remains an ancestor of IPD `main`; the 5 intervening commits add exactly
> 16 new files (all status `A`, +4,740/−0, all Windows-setup content) and change **nothing** in
> `package.json`, `frontend/src/features/portfolio/import`, `src/identity` or `src/contracts`; the
> publish profile is still `files: ["dist/package"]` with the same four exports at both commits; and
> `broker-identity-assessment.ts` plus every other consumed module have **identical blob ids** at
> both. Windows setup, host operations and production acceptance are expressly out of Workstream A
> scope, so advancing to `6df748d` would import out-of-scope content for zero identity benefit.
> **No pin change was made and none is required.** Transcript:
> `evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/11-ipd-main-movement-after-pin.txt`.

## 2. IRR dependency-pin change — **COMPLETED, PUBLISHED, REMOTELY VERIFIED**

`iips-broker-import`: `70b24f029842a7e9b7f615e4d9df7376fd4ff817` (2026-10-16, ancestor, **290
commits behind**) → **`7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`**, in `frontend/package.json` and
in `frontend/package-lock.json` (root specifier, `resolved`, `integrity`). The two sibling pins
(`iips-production-market-data#279d1eed…`, `iips-np04-governed-persistence#2e11fa3b…`) are
**unchanged**.

**The pin could not be advanced alone.** The retired pin's IPD manifest had **no `files` field**, so
npm packed the whole repository and IRR compiled the alias's raw TypeScript sources. The merged
commit carries the DB-C1 redesign (`files: ["dist/package"]`), so the raw-source compile lost every
input — measured, not inferred: `error TS18003: No inputs were found`. This is exactly the condition
the CAP-02 B-1R guard already documented. The IRR-owned redesign:

* `frontend/broker-import-package-profile.json` (**new**) — single source of truth for the alias
  consumption profile, read by both the build step and the guard so they cannot drift.
* `frontend/scripts/materialize-broker-import.mjs` (**new**) — fail-closed materializer: verifies
  manifest *and* lockfile pin the exact governed commit, verifies `dist/package` publishes all 18
  required modules as `.js` **and** `.d.ts`, rebuilds `.cache/broker-import` from scratch, writes a
  deterministic per-file SHA-256 manifest. No network, no compilation, no transformation.
* `frontend/tsconfig.broker-import.json` — repurposed to a strict `noEmit` typecheck of IRR's
  consumption surface against the pinned package's own published declarations.
* `build:broker-import` — `node scripts/materialize-broker-import.mjs && tsc -p …`, so all five
  `pre*` hooks still fail closed on a broken pin.
* Guard advanced; raw IPD sources are now asserted **absent** from the installed alias, so IRR
  cannot silently regress to consuming sources it was not given.

**No IPD identity-resolution logic was copied into IRR.** The materializer copies IPD's *published
build artifacts* byte-for-byte (SHA-256 equality proven in `02-materialization-receipt.txt`).

| Publication | Value |
| :--- | :--- |
| IRR PR | [#436 — WS-A: advance the broker-import pin to IPD PR #127 and consume per-row identity evidence](https://github.com/ramkivs/iips-review-recovered/pull/436) |
| PR head commit | `a3407fbf9582d2ea16d277d4a546ef0849a405a5` (tree `9c322e3c3967e77a8bdee932b6ae7ea1e392da36`) |
| **IRR merged commit** | **`51fdcd9567407db88626b3d5ae87e642f869205a`**, `MERGED` at `2026-11-05T09:25:46Z`, base `main` |
| Hosted CI on the exact merged head | **PASS** — `Typecheck · Test · Build`, 1m54s. This is independent of the sandbox: a hosted runner resolved the advanced pin anonymously via `npm ci` against the committed lockfile and ran V2 + the full Vitest suite + the CV-35 guard + the V4 build |
| Remote verification | `git ls-remote` reports `refs/heads/main` at `51fdcd9567407db88626b3d5ae87e642f869205a`; **33 / 33** changed paths byte-matched at that SHA through the GitHub Contents API; the published `frontend/package.json` pin and `frontend/broker-import-package-profile.json` were read back from `main` and confirmed. Transcript: `evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/10-postmerge-readback.txt` |

## 3. End-to-end 68-row identity assessment — **COMPLETED AND VERIFIED**

Measured through the **real** IRR preview against the **real** 68-row fixture using the **newly
pinned** IPD implementation. Evidence: `…/03-identity-assessment-68-row.json`; generator
`generate-evidence.mts`.

```text
counts   : nativeRows 68 · identityAssessedRows 68 · identityResolvedRows 1
           · identityUnresolvedRows 67 · savedRows 0
summary  : evaluated 68 · resolved 1 · unresolved 67 · ambiguous 0 · notEvaluated 0 · excluded 0
           identitySource GOVERNED_SECURITY_MASTER · saveable FALSE
           masterRevision BATCH-D05-TIER2-BROAD-UNIVERSE-2026-09-22-001
                          :7f53540b6532e7718e3a03a729766c12c73cc2549e450e3c2f356aa64a2b74b5
           refusalCodes { NO_AUTHORITATIVE_IDENTIFIER_MATCH: 67 }
status   : PARSED_UNRESOLVED · perRowIdentityEvidencePublished TRUE
refusal  : 1 × UNMAPPED_IDENTITY @ NORMALIZE — "P04 Identity Ambiguity Quarantine: Identity
           ambiguity detected for 'ASK AUTOMOTIVE': UNMAPPED_IDENTIFIER (No active mapping found
           for BSE_SYMBOL:ASK AUTOMOTIVE at asOf 2026-11-05T07:50:49.090Z)"
```

| Requirement | Result |
| :--- | :--- |
| All 68 rows individually assessed | **VERIFIED** — `identityAssessedRows = 68`; every row carries a non-null `pipelineIdentityStatus`. Under the retired pin this was an honest **0**. |
| AGI GREENPAC resolves through its governed alias | **VERIFIED** — row 1 `RESOLVED` / `PIPELINE_RESOLVED`, `NSE_SYMBOL:AGI GREENPAC → RESOLVED`, governed alias hit `EQ_AGI_IN`. The BSE namespace is recorded as `Not queried: the row was already resolved by NSE_SYMBOL.` — a resolved identity is not re-derived through a weaker identifier. |
| The other 67 retain `NO_AUTHORITATIVE_IDENTIFIER_MATCH` | **VERIFIED** — rows 2–68, all `UNSCOPED_NAME_OR_SYMBOL` / `UNRESOLVED` / `NO_AUTHORITATIVE_IDENTIFIER_MATCH`, with `refusalCodes { NO_AUTHORITATIVE_IDENTIFIER_MATCH: 67 }`. |
| NSE and BSE lookups remain exchange-scoped | **VERIFIED behaviourally** — `Exchange=BSE` → `['BSE_SYMBOL']` only; `Exchange=NSE` → `['NSE_SYMBOL']` only; an ISIN row → `['ISIN']` only; the unscoped Web UI surface → `['NSE_SYMBOL','BSE_SYMBOL']` verbatim. A BSE row is never resolved or reported through NSE. |
| No speculative BSE fallback masks the per-row results | **VERIFIED** — each unresolved row records **both** namespace attempts with their own outcome, details and P04 quarantine record (134 quarantine records in total). The file-level refusal names only the *last* lookup of the *first* refused row; the complete vector is published alongside it and the UI states that the refusal names one row only. |
| No misleading file-level refusal | **VERIFIED** — `FILE_LEVEL_P04_REFUSAL` is now reachable only when a run publishes no assessment vector; this run publishes one, so every row carries `PIPELINE_RESOLVED` / `PIPELINE_ASSESSED_UNRESOLVED`. |
| Counts, resolved/unresolved counts and refusal details accurate | **VERIFIED** — IRR passes the pipeline's own `identitySummary` through and never recomputes it; `identityAssessedRows`/`identityResolvedRows`/`identityUnresolvedRows` are derived from the published per-row vector. |
| P04 quarantine retains the required evidence | **VERIFIED** — the retained record carries per-row `identityRefusalCode` and `quarantineIds` (2 per unresolved row, 134 unique). Schema `IIPS_BROKER_IMPORT_EVIDENCE_V1` **unchanged**: the fields already existed and were `null`/empty only because the retired pin published nothing. |
| Whole-import refusal remains in force | **VERIFIED** — `identitySummary.saveable = false`, `status = PARSED_UNRESOLVED`, one `UNMAPPED_IDENTITY` refusal at `NORMALIZE`, `savedRows = 0`. DP-2 Option 2F is intact. |
| Gate E W-1 not weakened or bypassed | **VERIFIED** — `evaluatePortSaveGuard()` is IPD-owned and untouched; `canSave: false`, `persisted: false`, `notPerformed.{validation,saveAuthorization,persistence} = NOT_PERFORMED`. |

**Validation (exact).** Install 190 packages (CA-configured, TLS never disabled) ·
`build:broker-import` PASS (152 published files materialized; byte-equal to the pinned package) ·
`npm run typecheck` (V2) exit 0 · `npm run typecheck:replay-server` exit 0 · targeted subset
**11 files / 117 tests PASS** · `npm run test:ci` (V3) **111 files / 1386 tests / 0 failed**
(was 1381; +5 new cases) · `node .ci/assert-tests.js` **OK** · `npm run build` (V4) exit 0,
146 modules.

## 4. Row-level status of the 67 unresolved holdings — **BLOCKED (source data), VERIFIED as unresolved**

| Row | Source name (verbatim) | Identifier class | Lookups recorded | Status | Refusal code | In governed D05 corpus? |
| --: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | AGI GREENPAC | `UNSCOPED_NAME_OR_SYMBOL` | `NSE_SYMBOL → RESOLVED`; `BSE_SYMBOL → not queried` | **RESOLVED** → `EQ_AGI_IN` | — | yes (governed alias) |
| 2–68 | ASK AUTOMOTIVE, AJAX ENGINEERING, ARIHANT CAPITAL MARKETS, ARKADE DEVELOPERS, ARROW GREENTECH, ASHOKA BUILDCON, BANK OF BARODA, BHARAT COKING COAL, BLUE JET HEALTHCARE, CANARA ROBECO ASSET MANAGEMENT COMPANY, CREDO BRANDS MARKETING (MUFTI), DAM CAPITAL ADVISORS, ECOS MOBILITY & HOSPITALITY, EMS, EPACK PREFAB TECHNOLOGIES, ELECON ENGINEERING COMPANY, EMAMI, ENGINEERS INDIA, FINEOTEX CHEMICAL, GHCL, GMR POWER & URBAN INFRA, GATEWAY DISTRIPARKS, GEEKAY WIRES, GENUS POWER INFRASTRUCTURES, GRAUER & WEIL, GUJARAT PIPAVAV PORT, HIMADRI SPECIALITY CHEMICAL, IDFC FIRST BANK, IIFL CAPITAL SERVICES, INDRAPRASTHA MEDICAL CORPORATION, INTERNATIONAL CONVEYORS, INTERNATIONAL GEMOLOGICAL INSTITUTE, J KUMAR INFRAPROJECTS, JAI BALAJI INDUSTRIES, JAMNA AUTO INDUSTRIES, JIO PLATFORMS, KM SUGAR MILLS, KP ENERGY, KROSS, LANDMARK CARS, MATRIMONY.COM, MONARCH NETWORTH CAPITAL, NATIONAL STOCK EXCHANGE OF INDIA, OSWAL PUMPS, PANAMA PETROCHEM, PARADEEP PHOSPHATES, PRECISION WIRES INDIA, PREMIER POLYFILM, PUDUMJEE PAPER PRODUCTS, RADHIKA JEWELTECH, RAJOO ENGINEERS, RATEGAIN TRAVEL, SALASAR TECHNO ENGINEERING, SHAKTI PUMPS, SHARDA MOTOR, SIGMA SOLVE, SIYARAM SILK MILLS, STEELCAST, SUZLON ENERGY, THYROCARE TECHNOLOGIES, TITAGARH RAIL SYSTEMS, UNIVASTU, VARDHMAN SPECIAL STEELS, VISHAL MEGA MART, VISHNU CHEMICALS, WAAREE RENEWABLE TECHNOLOGIES, WEBSOL ENERGY SYSTEM | `UNSCOPED_NAME_OR_SYMBOL` (no ISIN, no exchange supplied) | `NSE_SYMBOL → UNMAPPED_IDENTIFIER` (+ own P04 quarantine record), then `BSE_SYMBOL → UNMAPPED_IDENTIFIER` (+ own P04 quarantine record), identifier value used **verbatim** | **UNRESOLVED** (P04 quarantine) | `NO_AUTHORITATIVE_IDENTIFIER_MATCH` ×67 | **no — 0 of 67** |

Every row also carries the pipeline's exact `missingEvidence`: *"The broker file supplies neither an
ISIN nor an exchange, and the supplied name/symbol is not an exact governed mapping key or governed
alias; the ISIN (preferred) or an exchange-scoped trading symbol must be supplied by the broker
export."* Row-level evidence: `03-identity-assessment-68-row.json` (68 entries) and
`08-d05-coverage-probe.json` (the 67 with the per-row corpus determination). **None of the 67 is
claimed as resolved.**

## 5. Authoritative Dhan detailed identifiers — **NOT OBTAINED, NOT DEPOSITED — BLOCKED**

`WS-A-DHAN-DETAILED-HOLDINGS-SOURCE-INVESTIGATION-2026-11-05.md`; transcript `09-…txt`.

* **Parsing is not the gap.** The pinned IPD adapter governs `DHAN_DETAILED_HOLDINGS_V1`
  (`Trading Symbol, ISIN, Exchange, …`), reads ISIN and Exchange, and the assessment classifies such
  a row as `ISIN` or `EXCHANGE_SCOPED_SYMBOL`.
* **The source is not accessible through any authorized acquisition path.** The only authorized
  acquisition in this product is a human-supplied local file read in the browser (`File.text()`,
  1 MiB cap, no upload). There is **no Dhan HTTP client, no API endpoint, no account login, no token
  acquisition** (recorded 2026-10-16), and the UI states "No broker login or live API connection."
  Sandbox egress cannot reach a Dhan host in any case.
* **No `DHAN_DETAILED_HOLDINGS_V1` artefact exists in either repository.** The exhaustive `.csv`
  inventory at both pinned commits contains only governance registers and the two copies of the
  reconstructed **Web UI summary** fixture.
* **Decisive:** even with a detailed export, **0 of the 67** companies exist in the governed D05
  corpus (2,250 entities / 2,250 distinct ISINs, probed through the corpus the pinned alias
  publishes, using a deliberately *wider* normalized match so the negative is conclusive). An ISIN
  resolves *to an entity*; a corpus with no entity for a company cannot resolve it.
* **Deposition is IPD-owned and was not attempted.** The established process is an operator drop at
  IPD `evidence/operator_drop/d05_security_master_broad_universe.json` under
  `AUTH-D05-BROAD-UNIVERSE-MASTER-EXPANSION-ACT-2026-09-22-001`, bound by
  `d05_security_master_manifest.json` and enforced by
  `tests/d05_security_master_integrity_semantics.test.ts`. A deposition changes the corpus checksum,
  the record count and the `masterRevision` every assessment reports. IRR has no write path and used
  none. No new expansion authorization act exists in either repository.
* **Nothing was invented.** No guessed ISIN, no `INE…` pattern, no name-derived symbol, no fuzzy or
  similarity match, no synthetic mapping, no placeholder deposition. The 68-row assessment was
  **not** re-run against a fabricated corpus, because no valid deposition occurred.

## 6. Evidence-retrieval authority — **PENDING AUTHORITY, NOT IMPLEMENTED**

`WS-A-EVIDENCE-RETRIEVAL-ROUTE-AUTHORITY-GAP-2026-11-05.md`. The journal itself is already
implemented and merged (PR #434) and was **not** recreated.

* **Route inventory:** `/api/broker-import/` is a **closed set of exactly two routes** —
  `POST …/:portfolioId/holdings` (U1 act §1) and `GET …/:portfolioId/revision` (U1 act **§7
  additive amendment under DEC-06 R-2/R-5**). `matchRoute()` returns `null` for everything else →
  `404`; wrong method → `405`. The pre-existing `GET /api/evidence/:id` serves
  `computeCertifiedEvidence(id)` — credential-free **certified reference** evidence with no owner
  scoping — and is *not* this route; reusing or widening it would be a different, larger question.
* **Precise gap:** four things are absent — (1) transport admission for a third route; (2) an
  owner-context carrier, which PF-1 expressly does not supply (*"a library authority, not an HTTP
  identity or access-control boundary"*); (3) a retention period / purge rule (PF-1 compaction is
  explicitly NOT built in v1); (4) a consent statement covering the serving of retained parsed
  personal financial evidence, which today's UI copy ("not uploaded or stored") would contradict.
* **Minimum required authority prepared** (§4 of that record): an additive U1 amendment under DEC-06
  R-2/R-5 naming exactly one `GET` route; an NP-06-R1-shaped owner carrier with fixed literals bound
  by the SHA-256 of its canonical bytes; the U1 §2.2 handler order (C9 → binding precondition →
  opaque id → single scoped read); non-disclosure; no `companyId` on the wire; still no new listener
  and no new IPC operation; all twelve `/api/user-portfolios*` 503 fences re-asserted byte-stable;
  plus the retention policy and the re-declared consent statement. **`PROPOSED — NOT EFFECTIVE`,
  Act ID `PENDING ASSIGNMENT`.**
* **Action taken: none.** No route implemented, exposed, registered or mounted. The journal's local
  durability is intact.

## 7. Durability and restart verification — **VERIFIED (existing evidence preserved and extended)**

Nothing already passing was re-run without reason; the restart, digest, tamper and idempotency
suites were re-run **because the pin change alters the retained record's content** (per-row refusal
codes and quarantine ids are now populated).

| Requirement | Test / measurement | Result |
| :--- | :--- | :--- |
| Journal survives process restart | `brokerImportEvidenceRestart.test.ts` — Process A runs the real preview + real journal and exits; Process B gets only the store address, identity scope and an **independent** digest expectation | **PASS** — 1 record recovered, different PID |
| All 68 row records recovered | same, Process B | **PASS** — 68 rows, ordered `rowIndex` 1…68, first `AGI GREENPAC`, last `WEBSOL ENERGY SYSTEM` |
| Record digest matches | Process A read-back vs Process B recovery vs a **third** process re-import | **PASS** — identical `recordDigest` across all three (`3f519e1c…3b30f4` for the generating run) |
| Tampered / corrupted records fail closed | `brokerImportEvidenceStore.test.ts` "fails closed on a tampered journal record" | **PASS** — `EVIDENCE_TAMPERED`; digest re-verified on **every** read |
| Repeated imports create no duplicate evidence | third process re-imports the same file; store idempotency test | **PASS** — `duplicate: true`, same `recordId`, `duplicateImportIds: false`, 1 record for the scope, journal unchanged |
| Incomplete inventory refused | "rejects an incomplete row inventory before it can be retained" | **PASS** — `EVIDENCE_INVALID` |
| Storage failure never reported as retention | "fails closed when the journal cannot be written" | **PASS** — throws; no retention claimed |
| Owner isolation | "keeps owners isolated" + `foreignScopeInvisible` | **PASS** — another owner's scope returns 0 records |
| Durable holdings persistence (qualification fixture) | **IPD** `tests/q1_broker_import_durability.test.ts` — existing R1 evidence, unchanged by this pass | **PASS (existing evidence reused)** — fixture-scoped only; **not** a real-user save |
| No real-user holdings save while gates are closed | Gate E W-1 hard-false; `persistBrokerImport` → `WRITE_NOT_AUTHORIZED`, `storeEffect: 'NONE'`, zero rows touched; preview `canSave:false`, `persisted:false`, `savedRows:0` | **VERIFIED — unchanged** |

**One property discovered by measurement and recorded rather than papered over:** P04 quarantine
record ids are minted per lookup instance by the IPD-owned pipeline
(`ident-quar-<epochMillis>-<random>`), so they are **process-specific**. The retained record's
digest is therefore not reproducible by *rebuilding* the same import in a new process — but it **is**
stable where it matters, because the journal dedups on
`importId = sha256(broker ‖ contentDigest ‖ readAt)`: the **first** retention is authoritative and a
repeated import is a no-op returning the stored record with its original digest (proven across three
separate OS processes). The separate-process writer harness was corrected accordingly: it still
demands an exact round-trip digest on a **first** retention, and on a **duplicate** retention it
compares against the authoritative retained record *and* proves that every stable field of the
freshly built record still matches what is durably stored. This is recorded as a limitation inside
every evidence record.

## 8. Gate 4 / Gate 5 — **STATUS ONLY, UNCHANGED, NOT BYPASSED**

Determined from the authoritative records (tracker §16.247 G8–G11, the 2026-11-02 outstanding
residuals register `RS-07…RS-11`, and the 2026-10-31 pending register `P-07/P-16/P-21…P-26`).

| Gate | Status | Exact remaining requirement |
| :--- | :--- | :--- |
| **Gate E W-1** | **UNMET — unchanged.** `evaluatePortSaveGuard()` hard-false on W-1(3) and W-1(4) (IPD-owned; untouched) | W-1(3) true only via Gate 4 result acceptance; W-1(4) true only via Gate 5 admission for **named** operations. U6 operational write authorization is a further separate act. |
| **P04 quarantine** | **IN FORCE — unchanged, and now better evidenced** | Nothing to lift. Per-row quarantine evidence (134 records for this run) is now retained. No bypass, no widening, no operator bypass (`allowNonProductionBypass: false`). |
| **Gate 4 qualification** | **`AUTHORIZED — NOT STARTED`; result acceptance `NOT RENDERED`** | `RS-09`/`P-21` **PA-09**: PA must designate the exact final Gate 4 QE/H-12 pin and scope (C-1/C-2/C-3); silent reuse of `a891802e` is expressly prohibited. Then `RS-07`/`P-22`: S2/Limb A native run at that pin, H-12 regeneration/adoption, S3 preflight, and **QE-1…QE-11 executed on the designated host — currently 0/11** (CI, synthetic Unix sockets and documented commands earn no QE credit; QE-8 uses the approved RV-1 disposable-copy procedure). Then `P-23` Gate C subset acceptance for Q1–Q4/Q9–Q11, then `RS-08`/`P-24` the separate Gate 4 / U4 result-acceptance act. Prerequisite chain: `P-1` provisioning `AUTHORIZED — ONE ATTEMPT — UNSPENT`, `P-1-F` consumption `NOT RECONCILED / RETRY_BLOCKED`. |
| **Gate 5 admission** | **`NOT INITIATED / NOT ADMITTED`** | `RS-10`/`P-25`: first establish the **DQ-4 final QE freeze — `NOT ESTABLISHED`, 8/10**, criteria 7 (host sequence S2 → one P-1 → S3) and 8 (canonical native-Windows evidence) unmet; then render the separate Gate 5 / CV-52 / U5 admission act **naming the exact qualified commits and the lifted fences**. `P-26` U6 write authorization (`durable:true`, 503 lift) is a further separate act. |
| **O-05 durable broker-import admission** | **`BLOCKED — admission limb open`** (`RS-11`/`P-07`) | The O5-A code-level limb is satisfied by a refusing-only consumer; the durable leg still cannot persist. Admission requires Gate 4 qualification + acceptance, Gate 5/CV-52 admission and durable-write qualification first. |

**Expressly not treated as authorization:** the merge of PR #127, the dependency-pin advance, the
68-row identity assessment, the per-row evidence now retained, or the fixture-based durability
result. None of them moves W-1(3), W-1(4), QE 0/11, DQ-4 8/10, Gate 4 acceptance, Gate 5 admission,
`P-1`, H-12, PA-09, `durable:true`, any 503 fence or `WRITE_NOT_AUTHORIZED`. **No production scope
is authorized and none was exercised.** No real-user durable save occurred.

## 9. Exact outstanding actions

| # | Action | Owner | Depends on | Completion criteria | Status |
| --: | :--- | :--- | :--- | :--- | :--- |
| A-1 | IPD per-row identity correction published | IPD | — | PR #127 merged at `7bcae35`; remote `origin/main` read-back | **COMPLETED / VERIFIED** |
| A-2 | IRR pin advance + consumption redesign + per-row consumption | IRR | A-1 | Pin `7bcae35` in manifest and lockfile; V2/V3/V4 + guard green; merged IRR PR; remote read-back of the merged blobs | **COMPLETED / VERIFIED** — IRR PR #436 merged as `51fdcd9567407db88626b3d5ae87e642f869205a`; hosted CI PASS; 33/33 paths byte-matched at the merge SHA |
| A-3 | End-to-end 68-row per-row identity verification | IRR | A-2 | 68 assessed / 1 resolved / 67 `NO_AUTHORITATIVE_IDENTIFIER_MATCH`; exchange scoping proven; whole-import refusal in force; reproducible evidence published | **COMPLETED / VERIFIED** |
| A-4 | Restart, digest, tamper, idempotency re-verification at the new pin | IRR | A-2 | Separate-process recovery of 68 rows; identical digest across three processes; tamper fails closed; no duplication | **COMPLETED / VERIFIED** |
| A-5 | Obtain authoritative identifiers for the 67 rows | **Operator (Ramki)** | Operator supplies their own `DHAN_DETAILED_HOLDINGS_V1` export locally through the existing browser file path | A detailed export exists and is assessed; rows whose ISIN / exchange-scoped symbol is already an exact governed key resolve; result published row by row | **BLOCKED — source not accessible; no artefact exists in either repository** |
| A-6 | Governed D05 deposition of the missing entities | **IPD + PA** | A-5, plus a new IPD authorization act | New IPD authorization act; operator drop with verbatim identifiers and preserved provenance; `d05_security_master_manifest.json` and `tests/d05_security_master_integrity_semantics.test.ts` re-bound; new `masterRevision` | **NOT STARTED — PENDING AUTHORITY. Provably required: 0 of 67 entities exist in the corpus today** |
| A-7 | Re-run the 68-row identity assessment after any valid deposition | IRR | A-6 | New assessment evidence published with the new `masterRevision`; resolved/unresolved counts re-measured row by row | **NOT STARTED — blocked by A-6** |
| A-8 | HTTP evidence-retrieval route authority | **PA (Ramki)** | — | Effective additive U1 amendment under DEC-06 R-2/R-5 naming exactly one route, its NP-06-R1-shaped owner carrier and digest binding, the retention period and purge rule, and the reconciled consent statement | **PENDING AUTHORITY — `PROPOSED — NOT EFFECTIVE`, Act ID `PENDING ASSIGNMENT`. Minimum authority prepared in §4 of the gap record** |
| A-9 | Implement the evidence route | IRR | A-8 effective, published and remotely read back | U1 §2.2 handler order; twelve `/api/user-portfolios*` fences byte-stable; import-safety re-asserted; no `companyId` on the wire; merged and remotely verified | **NOT STARTED — blocked by A-8** |
| A-10 | PA-09 final Gate 4 QE/H-12 pin and scope designation | **PA (Ramki)** | — | Effective designation act with exact commit, tree, blob set and purpose | **NOT STARTED — `PA DECISION REQUIRED`** |
| A-11 | S2/Limb A native run, H-12 adoption, S3, QE-1…QE-11 | **Operator** | A-10; `P-1` provisioning attempt; `P-1-F` consumption reconciliation | Native transcripts, H-12 adopted at the designated pin, S3 preflight, QE recorded **0/11 → 11/11** with Q11 digest bookends; QE-8 via RV-1 | **NOT STARTED** |
| A-12 | Gate C subset acceptance, then Gate 4 / U4 result acceptance | **PA** | A-11 | Two separate effective acceptance acts with evidence read-back | **NOT RENDERED** |
| A-13 | DQ-4 final QE freeze (criteria 7 and 8) | **PA + Operator** | A-11, A-12 | 10/10 criteria evidenced; effective freeze act; drift rule bound | **NOT ESTABLISHED — 8/10** |
| A-14 | Gate 5 / CV-52 / U5 admission | **PA** | A-13 | Effective admission act naming exact qualified commits and lifted fences | **NOT INITIATED / NOT ADMITTED** |
| A-15 | U6 operational write authorization (`durable:true`, 503 lift, W-1) | **PA** | A-14 | Effective U6 act + qualified durable-write evidence + guard-change authority | **NOT AUTHORIZED — out of scope** |
| A-17 | Publish the IPD-`main`-movement transcript and its accompanying README / R2 / `SHA256SUMS` updates | IRR | A-2 merged | `11-ipd-main-movement-after-pin.txt` published on IRR `main`; pin and IPD ancestry re-verified against live remote state; no pin change; no IPD write; merged and remotely read back | **COMPLETED / VERIFIED** — see §12 |
| A-16 | Additive dated master-tracker section registering the pin advance (next free `§16.249` / `CV-CORR-229` / `CHG-2026-11-02-01` / `V2023`), with the historical DQ-4 pin-reconciliation statements preserved unamended and indexed as superseded-for-currency | IRR | A-2 merged and remotely verified | Tracker section added additively; the protected Revision 7 / P1-F compatibility tokens and the CAP-03 status pointer unchanged; the IRR-only static validator green; merged and remotely read back | **EXECUTED — see §13.** `§16.249` / `CV-CORR-229` / `CHG-2026-11-02-01` / `V2023`–`V2039` added as **185 insertions, 0 deletions**; static validator **PASS** locally; `V2039` (publication read-back) left honestly `PENDING` for a dated post-merge receipt |
| A-18 | WS-A-DM milestone review at the then-current pin | IRR + PA | A-7, A-9, A-15 | Nine-pillar review published per §3.2 of the milestone definition; all pillars `IMPLEMENTED-VERIFIED`; pillar-8 and pillar-9 authorities effective and read back | **NOT STARTED — milestone defined, NOT COMPLETE** |

## 10. Files changed in this pass (IRR only)

| File | Change |
| :--- | :--- |
| `frontend/package.json` | pin advance; `build:broker-import` now materializes then typechecks |
| `frontend/package-lock.json` | regenerated for the advanced pin (`resolved` + `integrity`) |
| `frontend/broker-import-package-profile.json` | **new** governed alias consumption profile |
| `frontend/scripts/materialize-broker-import.mjs` | **new** fail-closed materializer |
| `frontend/tsconfig.broker-import.json` | raw-source compile → strict consumption-surface typecheck |
| `frontend/src/api/brokerHoldingsPreview.ts` | consumes `identityAssessments` / `identitySummary`; per-row refusal codes, lookups, quarantine ids, missing evidence; `identitySummary` and `perRowIdentityEvidencePublished` |
| `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx` | reports per-row evidence and states that the whole-import refusal names one row only |
| `frontend/server/broker-import/brokerImportEvidenceStore.ts` | populates the existing `identityRefusalCode` / `quarantineIds`; truthful limitations (schema unchanged) |
| `frontend/server/broker-import/brokerImportEvidenceWriter.ts` | duplicate-retention digest comparison corrected (§7) |
| `frontend/server/broker-import/brokerImportPackageConsumer.test.ts` | guard advanced; raw-source requirement retired; 2 new guard cases + 1 per-row-evidence case |
| `frontend/server/reports/reports-persistence-integration.test.ts` | reads the broker pin from the profile |
| `frontend/src/api/brokerHoldingsPreview.test.ts` | per-row identity, exchange scoping and refusal-masking cases |
| `frontend/server/broker-import/brokerImportEvidenceStore.test.ts`, `brokerImportEvidenceRestart.test.ts` | expectations advanced to the measured per-row state |
| `docs/integration/WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-PR127-2026-11-05.md` | **new** implementation record |
| `docs/integration/WS-A-DHAN-DETAILED-HOLDINGS-SOURCE-INVESTIGATION-2026-11-05.md` | **new** §4 investigation |
| `docs/integration/WS-A-EVIDENCE-RETRIEVAL-ROUTE-AUTHORITY-GAP-2026-11-05.md` | **new** §5 authority determination + prepared request |
| `docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md` | **new** this report |
| `evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/*` | **new** evidence set — 13 files published with PR #436 (14 on disk counting `SHA256SUMS.txt`); 15 after PR #437 added `10-postmerge-readback.txt`; **16 after A-17** added `11-ipd-main-movement-after-pin.txt` |
| `evidence/integration/ws-a-dhan-68-row/README.md` | dated addendum: the preserved IPD correction is now published as PR #127 (original text preserved unamended) |

**Not modified:** anything in IPD; `evaluatePortSaveGuard`; the W-1 conjunction; the twelve
`/api/user-portfolios*` fences; `brokerImportHttp.ts`'s route set; the PF-1 journal grammar; the
evidence record schema id; the certified `/api/evidence/:id` read surface.

**Deliberate scope decision — the master tracker was not touched.** Historical pin statements in
`IIPS_V3_E2E_MASTER_TRACKER_AND_IRR_IPD_DECISION_REGISTER_2026-10-13.md` (the CAP-03 DQ-4 pin
reconciliation of 2026-10-25 and its successors) record the broker-import alias as `70b24f0` and as
a raw-source compatibility baseline. Those are **point-in-time records** and DEC-06 preserves them
unamended; editing them would be exactly the historical rewrite the register prohibits. This pass
follows the precedent of the two immediately preceding WS-A merges (IRR PRs #434 and #435, both
2026-11-05, neither of which touched the tracker) and publishes a **new dated record** as the
current pointer instead: `WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-PR127-2026-11-05.md`. That record
supersedes the historical pin statements for currency purposes without altering them. Registering a
new `§16.249` / `CV-CORR-229` / `CHG-2026-11-02-01` / `V2023` tracker section is a separate
documentation act and is listed as outstanding action **A-16** below.

## 11. Status summary

| Line | Status |
| :--- | :--- |
| IPD PR #127 merged commit resolved and verified | **COMPLETED / VERIFIED** |
| IRR dependency-pin advance, published and remotely verified | **COMPLETED / VERIFIED** — PR #436 → `51fdcd9`, CI PASS, 33/33 read-back |
| End-to-end 68-row per-row identity assessment | **COMPLETED / VERIFIED** |
| 67 unresolved identities | **BLOCKED** — no accessible authoritative source; 0 of 67 in the governed corpus; nothing invented |
| Governed D05 deposition | **NOT STARTED — PENDING AUTHORITY** (IPD + PA) |
| HTTP evidence-retrieval route | **PENDING AUTHORITY** — minimum authority prepared, `PROPOSED — NOT EFFECTIVE`; not implemented |
| Restart / digest / tamper / idempotency | **VERIFIED** at the new pin |
| Durable holdings persistence | **VERIFIED on the qualification fixture only** — existing IPD evidence reused; **not** a real-user save |
| Gate E W-1 · P04 · DP-2 Option 2F | **IN FORCE — unchanged, not weakened, not bypassed** |
| Gate 4 qualification | **`AUTHORIZED — NOT STARTED`**, QE **0/11**, acceptance **NOT RENDERED**, PA-09 pin open |
| Gate 5 admission | **`NOT INITIATED / NOT ADMITTED`**, DQ-4 **8/10** |
| IPD `main` movement after the pin, and the pin's continued validity | **VERIFIED** — re-measured at A-17; `7bcae35` is IPD `main`'s first parent, consumed surface byte-identical; **no pin change** |
| Production scope | **NOT AUTHORIZED — none exercised** |
| **Workstream A overall** | **NOT COMPLETE** — A-5…A-15 outstanding |
| Milestone **WS-A-DM** (Durable User Holdings and Evidence Persistence) | **DEFINED, NOT COMPLETE** — pillars 4/5/7/9 `IMPLEMENTED-VERIFIED`; pillar 3 retention verified with retrieval `AWAITING-AUTHORITY`; pillar 6 isolation verified with the owner carrier `AWAITING-AUTHORITY`; pillar 2 `NOT-QUALIFIED`; pillar 1 `BLOCKED-EXTERNAL`; pillar 8 `AWAITING-AUTHORITY` |

---

## 12. Dated addendum — A-17 publication (IRR PR for `11-ipd-main-movement-after-pin.txt`)

**Status: COMPLETED / VERIFIED.** Additive evidence and documentation only. **No dependency pin was
changed, no IPD write was performed, and no completed test or investigation was repeated.**

### 12.1 Why an addendum was required at all

At the close of the pin-advance pass, remote verification discovered that IPD `origin/main` was no
longer the PR #127 merge commit. Because "resolve and record the *exact current authoritative*
commit" is a standing requirement of this workstream, the movement had to be measured and recorded
rather than left as an unstated assumption a later reader would trip over.

### 12.2 Provenance of this transcript — recorded honestly

An earlier draft of `11-ipd-main-movement-after-pin.txt` was captured at `2026-11-05T09:30:21Z` but
was left **uncommitted** in the working tree of branch `arena/0497f3e4-iips-review-recovered`. That
branch was PR-merged (IRR PR #437) and remote access to it closed; the clean A-17 branch
`arena/dbefb63f-iips-review-recovered` was then cut from `origin/main` `bf92fea`, which discarded the
uncommitted draft. **It was never committed and never published.**

The correct response was to re-measure, not to reconstruct. Rebuilding a lost transcript from
recollection would produce a document that *looks* like a measurement but is not one — precisely the
class of unverified claim this workstream prohibits. Every assertion in the published transcript was
therefore **re-measured fresh against live authoritative remote state** in the A-17 pass (fresh
blobless clone of IPD, fresh `git ls-remote` on both repositories, fresh GitHub API reads, fresh blob
and ancestry comparisons). The transcript states this in its own header. The conclusions are
unchanged; the timestamps are this capture's, not the lost draft's.

### 12.3 What was re-measured

| Assertion | Method | Result |
| :--- | :--- | :--- |
| IRR `refs/heads/main` | `git ls-remote` (anonymous) | `bf92fea14b457bece111ecb6f1f78a5c94eeab79` |
| IPD `refs/heads/main` | `git ls-remote` (anonymous) | `6df748d397daf965bd5b6e6e35df5043f7fa8c4d` |
| Identity of the new IPD tip | fresh blobless clone | merge of PR #126, `2026-11-05T14:19:54+05:30` (`08:49:54Z`) |
| IPD PR #126 | `gh pr view` (read-only) | `MERGED` at `2026-11-05T08:49:54Z`, head `arena/b5b0c6e2-iips-production-market-data`, base `main` |
| Pin still an ancestor of IPD `main` | `git merge-base --is-ancestor` | **YES** — and `origin/main^1` **is** `7bcae35`, i.e. the pin is the **first parent** |
| Commits after the pin | `git rev-list --count` | **5** |
| Changes to the consumed surface | `git diff --stat` restricted to `package.json`, `frontend/src/features/portfolio/import`, `src/identity`, `src/contracts` | **empty — zero changes** |
| Full change set | `git diff --name-status` + tally | **16 files, all status `A`, +4,740/−0**; nothing modified, deleted or renamed |
| Publish profile at both commits | `git show <sha>:package.json` | identical: `files: ["dist/package"]`, same four exports |
| Consumed module blobs | `git rev-parse <sha>:<path>` at both commits | `broker-identity-assessment.ts` **`401af803…` IDENTICAL**; also identical: `broker-import-ingress.ts`, `types.ts`, `adapters/dhan-holdings-adapter.ts`, `broker-holdings-mapper.ts`, `src/identity/governed_fixture_master.ts` |
| IRR pin on IRR `main` | `git show origin/main:frontend/package.json` | `#7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc` — **UNCHANGED** |
| IRR consumption profile on IRR `main` | `git show origin/main:frontend/broker-import-package-profile.json` | aliasCommit `7bcae35…`, publishedRoot `dist/package`, materializedRoot `.cache/broker-import`, 18 required modules — **UNCHANGED** |

### 12.4 Determination

The pin is **valid, unaffected and unchanged**. PR #126's content is Windows-setup material that is
expressly out of Workstream A scope, and it does not touch the publish profile or any module IRR
consumes, so advancing the pin to `6df748d` would import out-of-scope content for **zero identity
benefit** while widening the surface the materializer must verify. The pin therefore correctly stays
at the PR #127 merge commit `7bcae35`, exactly as the workstream specified.

### 12.5 Additive files in this addendum

| File | Change |
| :--- | :--- |
| `evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/11-ipd-main-movement-after-pin.txt` | **new** — the re-measured transcript (16 measurements, self-describing provenance header) |
| `evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/README.md` | **additive only** — new file-table row; three new commit-identity rows; a provenance line under "Limitations recorded, not papered over". No existing text amended |
| `evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/SHA256SUMS.txt` | regenerated to cover the new transcript (14 → 15 entries) |
| `docs/integration/WS-A-DHAN-BROKER-HOLDINGS-WORKSTREAM-REPORT-2026-11-05-R2.md` | **additive only** — §1 dated addendum block, §9 row A-17, §10 corrected evidence-set count, §11 status line, and this §12 |

**Not modified:** `frontend/**` in its entirety, both sibling pins, the materializer, the guard, the
preview, the evidence store, the PF-1 journal, any gate, fence or authority act, anything in IPD, and
every previously published evidence artefact `00`–`10` (their `SHA256SUMS` digests are unchanged).

---

## 13. Dated addendum — A-16 tracker registration and the WS-A-DM milestone definition

**Additive documentation only. No code, dependency, pin, gate, fence or authority act changed. No IPD write.**

### 13.1 A-16 executed: `§16.249` / `CV-CORR-229` / `CHG-2026-11-02-01` / `V2023`–`V2039`

The master tracker was deliberately untouched by the pin-advance pass (§10). A-16 discharges that
deferral with a **purely additive** section — `185` insertions, **`0` deletions** — plus one new
change-log row at the top of the §5 additive table. Twelve subsections register: the three
publications and their merge commits; the resolved authoritative commits; the §16.172 `TS18003`
prediction confirmed exactly **and corrected in one attribution** (the remedy was IRR-owned, not
IPD-owned, and the failure was blocking at the moment of the advance, not minor); the measured 68-row
result; the §4 blocked investigation; the §5 authority gap; the PA reconciliation for the `RS-22`
alias-modernization limb; ten stale alias/pin statements indexed as superseded-for-currency; the
unchanged gates and fences; the milestone definition pointer; the outstanding-action register; and a
17-row verification ledger.

**Preservation was proven, not asserted.** Before publication: the diff was confirmed to contain zero
deleted lines; the protected Revision 7 / P1-F compatibility tokens, the `**Latest (`CV-CORR-208``
pointer, the `§16.222` and `§16.246` next-free declarations, the §16.248 next-free declaration and
the single `**Current CAP-03 P-1 / PF-15 status**` row were all confirmed still present; the
first-30-line window the static validator inspects was confirmed unchanged; each of `V2023`–`V2039`
was confirmed to appear exactly once as a ledger row; and the **IRR-only static validator
(`docs/integration/cap03-p1-f9/validate_windows10_host_profile.py`) was run locally and returned exit
`0`**. The workspace clone had to be unshallowed (`git fetch --unshallow --filter=blob:none`, 1,201
commits) because that validator reconciles the tracker against historical commits.

`V2039` (publication and independent remote read-back of this section) is left honestly **`PENDING`
at authoring time**, with a dated post-merge receipt subsection to follow — the §16.248.7 / PR #430
precedent. A pre-merge record cannot truthfully cite its own merge commit.

### 13.2 One governance finding worth stating plainly

`RS-22` of the 2026-11-02 Register D records **"alias modernization is NOT AUTHORIZED and off the
critical path"**, with the remaining action **"PA decides only if it commissions the work."** The
Program Authority did commission exactly this advance in writing in the Workstream A instruction of
2026-11-05. §16.249.7 therefore records that the `RS-22` alias-modernization limb is **discharged
for the `70b24f0` → `7bcae35` advance only, by the PA's own written commission** — not by agent
inference, waiver or steady-state reinterpretation. The other `RS-22` limbs (`CV-24` F6 inventory,
`TD-7b` production profile, `CV-22` universe expansion) remain reserved and untouched. **Register D
was not edited**; it is indexed as superseded-for-currency for that one limb. No PA act ID was
assigned or claimed. And the commission to advance a pin is **not** authorization for real-user
durable saves, gate movement, fence lifts, D05 deposition, an HTTP evidence route or production
scope.

### 13.3 The WS-A-DM milestone definition

`docs/integration/WS-A-DURABLE-USER-HOLDINGS-MILESTONE-DEFINITION-2026-11-05.md` defines durability
as the eventual Workstream A milestone across nine pillars, each with measurable acceptance criteria
and a controlled five-state classification (`IMPLEMENTED-VERIFIED`, `AWAITING-AUTHORITY`,
`BLOCKED-EXTERNAL`, `NOT-IMPLEMENTED`, `NOT-QUALIFIED`). It carries a **normative non-completion
rule**: fixture-based durable persistence plus evidence-journal restart recovery are necessary and
already in hand, and are **not** sufficient — they are fixture-scoped rather than user-scoped, the
write path is closed by design rather than by accident, and 67 of 68 identities are unresolved. It
also fixes the dependency spine (`A-5 → A-6 → A-7` for pillar 1; `A-8 → A-9` for pillars 3 and 6;
`A-10 → A-11 → A-12 → A-13 → A-14 → A-15` for pillars 8 and 2), a mandatory review procedure, the
prohibitions carried forward, and the seven conditions that would legitimately allow a `COMPLETE`
declaration.

**The honest summary of the milestone:** the engineering IRR owns is largely done and verified —
pillars **4, 5, 7 and 9 are `IMPLEMENTED-VERIFIED`**, and pillars **3** and **6** are verified except
for one authority-gated limb each. What remains is *data* IRR cannot obtain (pillar 1) and *authority*
IRR cannot render (pillars 2, 3, 6, 8). **No further IRR implementation moves WS-A-DM forward until
A-5, A-8 or A-10 is discharged by someone else.**
