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
| A-5 | Obtain authoritative identifiers for the 67 rows | **Operator (Ramki)** | Operator supplies their own `DHAN_DETAILED_HOLDINGS_V1` export locally through the existing browser file path | A detailed export exists and is assessed; rows whose ISIN / exchange-scoped symbol is already an exact governed key resolve; result published row by row | **BLOCKED-EXTERNAL — INPUT SPECIFICATION COMPLETE AND PUBLISHED (§14.3).** No artefact and no acquisition path in either repository; **no Dhan API/login/token anywhere**. The gap is **DATA, not capability** — the parser already supports `DHAN_DETAILED_HOLDINGS_V1` |
| A-6 | Governed D05 deposition of the missing entities | **IPD + PA** | A-5, plus a new IPD authorization act | New IPD authorization act; operator drop with verbatim identifiers and preserved provenance; `d05_security_master_manifest.json` and `tests/d05_security_master_integrity_semantics.test.ts` re-bound; new `masterRevision` | **PREPARED — PREREQUISITES AND VALIDATION PLAN COMPLETE (§14.3); PENDING AUTHORITY.** Provably required: 0 of 67 resolve in the **symbol-space** indices that were probeable — the **ISIN index was structurally unreachable**, so it is **UNTESTED, not tested-and-absent**. Needs a **NEW Wave-2 Security Master Expansion Act**; the `2026-09-22` act is spent. **Master revision UNCHANGED** |
| A-7 | Re-run the 68-row identity assessment after any valid deposition | IRR | A-6 | New assessment evidence published with the new `masterRevision`; resolved/unresolved counts re-measured row by row | **NOT STARTED — blocked by A-6** |
| A-8 | HTTP evidence-retrieval route authority | **PA (Ramki)** | — | Effective additive U1 amendment under DEC-06 R-2/R-5 naming exactly one route, its NP-06-R1-shaped owner carrier and digest binding, the retention period and purge rule, and the reconciled consent statement | **CLOSED — AUTHORITY EFFECTIVE AND REMOTELY VERIFIED (§16.8).** The PA rendered decisions **5, 6, 7** on `2026-11-05`; Act ID **ASSIGNED** (`IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01`); **all three `TBD-PA` sets FILLED**; multi-tenant and production assumptions **removed** clause by clause; U1 act preserved **byte-identical** at `a3ae368d…` and **re-verified from merged `main`**. **EFFECTIVE** — all four conjunctive §8.7(25) / §10 conditions **DISCHARGED**: published by IRR PR **#447** → **`510ffb00…`**; exact-head CI run **`42042751662`** **SUCCESS** *and* post-merge CI run **`42043198126`** **success**; remote read-back **6 / 6 changed paths MATCH** plus **2 / 2 frozen anchors MATCH**. Determination recorded in **act §14** and **tracker §16.254.17**. Blocker `WS-A-EV-ROUTE-1` **CLOSED**. **No route added by the act** |
| A-9 | Implement the evidence route | IRR | A-8 effective, published and remotely read back | U1 §2.2 handler order; the **current** fence baseline byte-stable — **six admitted read-only pairs plus six still-fenced write/context pairs**, the "twelve 503 pairs" baseline having been superseded by the authorized Direct P1 read integration at IRR `9202e7a` (see §14.2 and tracker §16.251.7); import-safety re-asserted; no `companyId` on the wire; merged and remotely verified | **IMPLEMENTED — MERGED AND REMOTELY VERIFIED (§17.10) — retrieval only; live evidence retention NOT composed into the import flow.** *Was* **AUTHORIZED — NOT STARTED** at §16.8, then **IMPLEMENTED — VERIFIED LOCALLY** at §17; A-8's effectiveness **is recorded** in the post-merge receipt (**act §14**; **tracker §16.254.17**), so §12's condition is met: **implementation is authorized and unblocked**. Completion criteria **additionally include** obligations **O-1** (storage-usage visibility) and **O-2** (backup/recovery safeguards) created by the PA's Decision 6, the clause-18 consent-copy reconciliation, and targeted tests for every file actually changed (`405`, `400` on query string, `404` non-enumeration, non-disclosure, tamper fail-closed, fence re-assertion at the six-plus-six baseline, import-safety re-assertion). **NOT performed by §16 or by §16.8** — see §17 for the implementation that followed under this authority. WS-A-DM pillars **3.3** and **6.2** moved to **AUTHORIZED — NOT IMPLEMENTED** at §16.8, to **IMPLEMENTED — VERIFIED LOCALLY** at §17, and to **IMPLEMENTED — VERIFIED, RETENTION NOT COMPOSED** at §17.10. **Retrieval working is not retention working**: no production import calls `retain()`, so the route answers `404` for every `importId` until retention is composed under separate authority — which is **not** one of §12's eleven steps and was **not** done. |
| A-10 | PA-09 final Gate 4 QE/H-12 pin and scope designation | **PA (Ramki)** | — | Effective designation act with exact commit, tree, blob set and purpose | **PREPARED — DECISION PACKAGE COMPLETE (§14.1); BLOCKED ON PA.** `PA DECISION REQUIRED` — **four** decisions rendered; findings **I-1…I-8**; Gate 4 act **§3.2(4)** stop condition **engaged in both repositories**. **No pin designated; no PA act fabricated** |
| A-11 | S2/Limb A native run, H-12 adoption, S3, QE-1…QE-11 | **Operator** | A-10; `P-1` provisioning attempt; `P-1-F` consumption reconciliation | Native transcripts, H-12 adopted at the designated pin, S3 preflight, QE recorded **0/11 → 11/11** with Q11 digest bookends; QE-8 via RV-1 | **NOT STARTED** |
| A-12 | Gate C subset acceptance, then Gate 4 / U4 result acceptance | **PA** | A-11 | Two separate effective acceptance acts with evidence read-back | **NOT RENDERED** |
| A-13 | DQ-4 final QE freeze (criteria 7 and 8) | **PA + Operator** | A-11, A-12 | 10/10 criteria evidenced; effective freeze act; drift rule bound | **NOT ESTABLISHED — 8/10** |
| A-14 | Gate 5 / CV-52 / U5 admission | **PA** | A-13 | Effective admission act naming exact qualified commits and lifted fences | **NOT INITIATED / NOT ADMITTED** |
| A-15 | U6 operational write authorization (`durable:true`, 503 lift, W-1) | **PA** | A-14 | Effective U6 act + qualified durable-write evidence + guard-change authority | **NOT AUTHORIZED — out of scope** |
| A-17 | Publish the IPD-`main`-movement transcript and its accompanying README / R2 / `SHA256SUMS` updates | IRR | A-2 merged | `11-ipd-main-movement-after-pin.txt` published on IRR `main`; pin and IPD ancestry re-verified against live remote state; no pin change; no IPD write; merged and remotely read back | **COMPLETED / VERIFIED** — see §12 |
| A-16 | Additive dated master-tracker section registering the pin advance (next free `§16.249` / `CV-CORR-229` / `CHG-2026-11-02-01` / `V2023`), with the historical DQ-4 pin-reconciliation statements preserved unamended and indexed as superseded-for-currency | IRR | A-2 merged and remotely verified | Tracker section added additively; the protected Revision 7 / P1-F compatibility tokens and the CAP-03 status pointer unchanged; the IRR-only static validator green; merged and remotely read back | **COMPLETED / VERIFIED — see §13.** `§16.249` / `CV-CORR-229` / `CHG-2026-11-02-01` / `V2023`–`V2039` added as **185 insertions, 0 deletions**; static validator **PASS** locally and on hosted CI (exact-head run `42011983627` pass 34s; post-merge `main` run `42012188918` success). Published as PR #440 → **`7e56cc5ec13240c12b13dc064c85035ed3d825da`**, `2026-11-05T10:36:58Z`; **3/3** changed paths byte-matched at the merge SHA (tracker via the Git Blobs API, blob `49cfed76…`, `3,804,970` bytes). `V2039` satisfied by the §16.249.13 dated receipt; its `PENDING` wording preserved as the correct pre-merge state |
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

### 13.4 Dated post-merge receipt for A-16 (`2026-11-05`)

§13.1's statement above is preserved verbatim as the correct **pre-merge** state. The receipt now
follows, additively.

**A-16 is published and independently verified.** IRR PR **#440** merged at `2026-11-05T10:36:58Z` as
**`7e56cc5ec13240c12b13dc064c85035ed3d825da`**, tree **`346a25039421a8333c0c216ac22e222aeeaa5bce`**,
parent order baseline `1afa1fba1fdf8d1567089b94c25c187b202a9d51` then PR head
`92a7e55327fa091bc83307602b8bfe02ef2bf4b3`. `git ls-remote` independently reports IRR
`refs/heads/main` at that merge commit.

| Verification | Result |
| :--- | :--- |
| Exact-head static check (before merge) | run `42011983627`, job `127193003680`, `Python compile · source/evidence/tracker validation` — **pass**, 34s |
| Post-merge `main` push check | run `42012188918`, `CAP-03 Revision 7 IRR-only static checks` on `main@7e56cc5e` — **completed / success** |
| Tracker read-back at the merge SHA | **Git Blobs API** (the tracker at `3,804,970` bytes exceeds the Contents API size limit) — blob `49cfed76095c1d0d97ce459e71ff353ec2c1b764`, SHA-256 `894163f9d754a48378af1e765e99f75eb44d20e09e6886c9963a3701012dc6ee` — **MATCH** |
| `…REPORT-2026-11-05-R2.md` read-back | Contents API, `47,082` bytes, SHA-256 `9a93c203c94798a6…` — **MATCH** |
| `…MILESTONE-DEFINITION-2026-11-05.md` read-back | Contents API, `29,166` bytes, SHA-256 `37494ed6c867f453…` — **MATCH** |
| Changed paths byte-matched | **3 / 3** |
| `frontend/**` paths changed by PR #440 | **0** |
| Pins read back from merged `main` | broker alias `#7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`, primary `#279d1eed184f5e23bbabe5c6411085e120ce9e41`, `iips-np04-governed-persistence#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` — **all unchanged** |

`V2039` is thereby **PASS**; its `PENDING` wording is preserved as the correct pre-merge state,
following the §16.248.7 precedent. The receipt itself is published as **§16.249.13** of the tracker,
because a receipt cannot be part of the commit it verifies.

**A-16 is COMPLETED / VERIFIED.** No gate, pin, fence, authority act or register count was moved by
the section or by its receipt. **Workstream A and milestone WS-A-DM remain NOT COMPLETE** — A-5…A-15
and A-18 outstanding.

---

## 14. Dated addendum — A-10 / A-8 / A-5-A-6 prepared decision packages (`2026-11-05`, second pass)

Authored under the Program Authority's written one-pass commission for Workstream A actions **A-10**,
**A-8** and **A-5/A-6**. This addendum is **additive**: §§1–13 above are preserved, and the only edits
made to §9 are to **live status and completion-criteria cells** for A-5, A-6, A-8, A-9 and A-10. No
narrative statement of past state was rewritten, consistent with the §13.1 / §13.4 additive-discipline
correction already recorded.

**Baselines at authoring.** IRR `main` = **`bcf067061bff42c4b69416dbe33205909cd8ce85`** — re-censused
mid-pass, because IRR `main` moved from `4162a9ea665d0e6c35cc8c5a0560ccb69ec085e5` when **PR #438**
(another session's NP-06 real report persistence work) merged at `2026-11-05T16:39:30+05:30`. IPD
`main` = `6df748d397daf965bd5b6e6e35df5043f7fa8c4d`. **PR #438 is preserved untouched.** Open PRs at
authoring: **0** IRR, **0** IPD. **Pins unchanged** (`frontend/package.json` lines 24–26 verified
byte-identical at `bcf0670`): broker-import `#7bcae35ad18c43cb67a16f30faa55bbdf0fb33fc`, np04
`#2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`, production-market-data
`#279d1eed184f5e23bbabe5c6411085e120ce9e41`. **Zero IPD writes.**

### 14.1 A-10 — Gate 4 QE / H-12 pin designation decision package

Published as **`docs/integration/WS-A-G4-QE-H12-PIN-DESIGNATION-DECISION-PACKAGE-2026-11-05.md`**.
Status: **PREPARED — NOT EFFECTIVE. NOT A PA ACT. NOT A PIN DESIGNATION. NOT A GATE 4 EXECUTION. NOT
AN ACCEPTANCE. No Act ID assigned or claimed.**

| Delivered | Content |
| :--- | :--- |
| Question restated | PA-09's G4P-1 / G4P-2 / G4P-3 / deferred option set, with the packet's unfilled PA wording reproduced verbatim, and PA-01 pass-6's *"(iv) G4P-1: not established; the Gate 4 pin is undesignated"*. |
| Framework read | §4.5 **C-1/C-2/C-3**; §4.6 obligations **1–6**; §3.1 (adopted PA-1); PA-10a **NOT ADVANCED** / PA-10b **DEFERRED** / PA-10c **RESOLVED**; PA-08a/b/c; PA-19/PA-20 (waive Windows and operator evidence, **no Gate 4 decision**); finding **F3**; the G14 *"Do not infer G4P-1…"* rule. |
| **Controlling rule** | Gate 4 act **§3.2**, the four-part commit rule, quoted verbatim from IPD blob `66b56fd1584890525a7250aadd7da449def621e5` — verified **byte-identical at `a891802e`, `7bcae35` and IPD `main`**. |
| Candidate identities | **8** coordinates measured with commit, tree, distance behind IPD `main`, date, subject and first-parent status. No SHA guessed: every identity resolved via `git rev-parse --disambiguate` against a real clone and cross-checked with `git ls-remote`. |
| Obligation roll-up | **1 SATISFIABLE** at `a891802e` / `8eec74ae` / `7bcae35`, **NOT** at `001c3c80`; **2 EXECUTED**; **3 NOT EXECUTED**; **4 PA-only, outstanding**; **5 no artifact**; **6 not executed**. |
| Inconsistencies | **I-1…I-8**, each with the disposition required. |
| Downstream | Consequences for **A-11…A-18** on both adoption and continued non-designation. |

**Two structural findings that reframe PA-09.** First, **§3.2(2) and PA-09 name two different pins**:
§3.2(2) defines the **QE execution pin** as *"the final post-merge Limb A commit"*, and §3.2's
Limitation states *"The IPD QE pin cannot exist until Limb A is implemented and merged"* — which it is
not (Gate 4 `AUTHORIZED — NOT STARTED`, QE **0/11**, Gate C and U4 **NOT RENDERED**, and C-2 needs IPD
implementation authority that is **not granted**). PA-09 asks for the **content pin**. A designation
can therefore validly fix content, and **must not be recorded as producing a QE execution pin**.
Second, **§3.2(4) is engaged in both repositories by measurement** — *"Any non-documentary drift in
either pinned repository between this act and execution is a stop condition requiring explicit PA
re-designation"* — with IPD carrying **34 non-evidence paths** between `a891802e` and `7bcae35` and
**61 commits** to `main`, and IRR carrying **456 commits / 817 paths / 41 `frontend/` paths** between
`ba64b2d5` and `bcf0670`. **PA-09 is thus the re-designation §3.2(4) demands, not merely an open
preference.** None of that drift is improper: every item traces to authorized work.

**A fourth option is flagged, not recommended.** Measured facts make **G4P-4** (`7bcae35`, the live
consumption pin) arguable; the `2026-10-29` packet does not contain it because it predates the pin
advance. Its merits and costs are both tabulated. **Adding an option to a PA ballot is a PA
prerogative**; IRR's role is to ensure the ballot is not stale.

### 14.2 A-8 — Evidence-retrieval route additive U1 amendment package

Published as
**`docs/integration/WS-A-EVIDENCE-RETRIEVAL-ROUTE-U1-S8-AMENDMENT-PACKAGE-2026-11-05.md`**. Status:
**`PROPOSED — NOT EFFECTIVE`. Act ID `PENDING ASSIGNMENT`.** Blocker **`WS-A-EV-ROUTE-1`** remains
**OPEN**. **No route added, exposed, registered or mounted; no listener created; no IPC operation
added.**

The gap record's §4 *minimum required authority* is now rendered as **adoptable instrument text**: a
proposed additive **§8** to the U1 act under **DEC-06 R-2/R-5**, preserving §§1–7 and §7.1 verbatim,
in **25 numbered clauses** — §8.1 transport admission, §8.2 owner-context carrier and digest binding,
§8.3 retention and purge, §8.4 reconciled consent, §8.5 compatibility with the closed two-route
boundary, §8.6 what it does not authorize, §8.7 publication and effectiveness. **Ten prerequisites
P-1…P-10** are verified at current coordinates, following the §7 precedent (which was itself
conditioned on prerequisites verified at a named IPD coordinate).

**Non-expansion validation — the standing requirement — was performed element by element.** Every
proposed element is either **identical** to an existing admitted pattern, **strictly narrower** than
the capability it exposes, or an **additional constraint imposed on the adopting act**. The two
genuinely new powers requested are one named read route and one act-fixed owner carrier, both
requested **expressly** in the instrument the act's own amendment rule designates. **Result: the
proposal does not silently expand existing authority.**

**Three placeholders are deliberately `TBD-PA`** and must not be filled by IRR: the §8.2(7) tenant and
owner literals (NP-06 R1 requires these to be established **by the act**; inventing an owner identity
for a personal-financial-evidence read surface would be fabrication), the §8.3(16) retention period /
purge rule / purge basis (no period exists in code — PF-1 **TD-3** records compaction as explicitly
**NOT** built in v1), and the **Act ID**. **The proposal is not adoptable as published.**

**Compatibility premise verified, not assumed.** `frontend/server/broker-import/brokerImportHttp.ts`
is **byte-identical** from `ba64b2d5` to `bcf0670` — Git blob
**`cd0b42d1c7803f9451586194e42c0357135271d2`**, unchanged across **456 commits** — so the namespace
is still closed at exactly two routes and `matchRoute()` still admits only `holdings` and `revision`.
**No test suite was re-run for this package**: `gh api …/compare/51fdcd95…4162a9ea` shows **7 files
changed, 0 under `frontend/`**, and `4162a9ea…bcf0670` adds **4** NP-06 Reports files, none in the
broker-import or fence surface — so PR #436's validation evidence (`test:ci` **111 files / 1,386 tests
/ 0 failed**; `build` PASS; hosted CI run `42001913262` PASS) **carries forward unchanged**, which is
a stronger and cheaper claim than a re-run.

### 14.3 A-5 / A-6 — External identity-data dependency

Published as
**`docs/integration/WS-A-DHAN-DETAILED-HOLDINGS-EXTERNAL-DEPENDENCY-2026-11-05.md`**. Status:
**`BLOCKED-EXTERNAL`** (A-5) / **`NOT STARTED — PENDING AUTHORITY`** (A-6). **Nothing fabricated,
reconstructed, synthesized, guessed or deposited. Master revision UNCHANGED.**

The exact operator-supplied input is now specified: a genuine Dhan **Detailed Holdings** CSV from the
operator's own account in the governed **`DHAN_DETAILED_HOLDINGS_V1`** format, header signature
`Trading Symbol, ISIN, Exchange, Total Qty, DP Qty, Available Qty, Average Buy Price, Last Traded
Price, Current Value, Profit / Loss, P&L %`, with **ISIN and Exchange PRESENT** — sourced from IPD's
own `evidence/bi04/dhan-web-ui-summary-v1-schema.md` §2.1 and confirmed identically by BLOCK-3L
TASK A. Delivery is browser-local only (`File.text()`, 1 MiB cap, never uploaded); **XLSX remains
blocked** (BI-06); **live providers: 0**.

**Absence verified, not asserted.** No artefact of that variant exists in either repository — the
token appears only in governance, schema and audit **prose**. **No Dhan API, login, token or
credential path exists anywhere in IRR**; the only nearby occurrence is the UI copy that denies it.
**The parser already supports the variant, so the gap is DATA, not capability.**

**Why 67 of 68 failed** is established from IPD's own read-only audit
`BLOCK-3L-BROKER-CSV-FULL-RESOLUTION-AUDIT` (baseline `d6cb663f…`, `READ-ONLY / NO CODE CHANGE / NO
COMMIT / NO PUSH`): the governed 2,250-record master resolves at **100.0% (2250/2250)** while non-D05
equities resolve at **0.0%** with `D05_ABSENT` (P04 fail-closed), and *"the failed securities are
**GENUINELY ABSENT** … There is **ZERO** systematic failure among present securities."* The observed
run used `DHAN_WEB_UI_SUMMARY_V1`, which **omits ISIN and Exchange**, forcing `SYM → NSE → BSE`.

**A precision correction to §4/§5 above.** Those sections record that **0 of 67** entities exist in
the corpus, probed wider than the master by normalized company name, listing symbol, `nseSymbol` and
`bseSymbol`. That is **correct as to the index space actually probed**, but `MappingStore` populates
**four** indices — ISIN, NSE_SYMBOL, BSE_SYMBOL, COMPOSITE_TICKER — and **the ISIN index was
structurally unreachable from this input**, because the variant omits the column. The ISIN space is
therefore **UNTESTED, not tested-and-absent**. The conclusion is unaffected (BLOCK-3L independently
establishes genuine absence, and the composition argument makes near-total absence expected on any
lookup path), but the **evidence class is now stated accurately**: a **symbol-space measurement plus a
composition inference**. The earlier wording is indexed as superseded-for-currency; §4 and §5
themselves are **not** rewritten.

**A-5 → A-6 is a strict sequence, and A-6 is provably required.** A-5 will **not** by itself resolve
the 67 rows — switching variants changes the mapper path from `SYM → NSE → BSE` to the `ISIN` lookup
and does **not** create presence in the master. What A-5 uniquely supplies is **authoritative ISINs**,
the only lawful source of the identifiers a deposition must carry. Without A-5, any deposition would
have to invent ISINs — forbidden by the standing instruction, by schema doc §4 (*"Under NO
circumstances is a `companyId` fabricated from the raw `Name` string"*) and by BLOCK-3L
recommendation 1 (*"do not add ad-hoc un-governed aliases, and do not fabricate raw symbols"*).
**Corollary, so it is not mistaken for progress: obtaining A-5 will most likely NOT raise the resolved
count materially.** Its value is that it makes A-6 possible and non-fabricated.

**A-6 is prepared, IPD-owned, and not performed.** BLOCK-3L recommendation 3 already names the
required instrument: real mid-cap/small-cap equities *"should be formally deposited and governed under
a **future authorized Security Master Expansion Act** (e.g. `AUTH-D05-EXPANSION-ACT-WAVE2`)"*. The
executed precedent is `AUTH-D05-BROAD-UNIVERSE-MASTER-EXPANSION-ACT-2026-09-22-001`, which produced
the current revision `BATCH-D05-TIER2-BROAD-UNIVERSE-2026-09-22-001` / checksum `7f53540b…74b5` /
`recordCount 2250` / `operatorId OPERATOR_ADMIN_GOVERNED_01` — verified unchanged at the live pin.
**That act is spent; a NEW Wave-2 act is required; no Act ID is assigned or claimed.** The package
renders **eight prerequisites PR-1…PR-8** with owners, **eight deposition exclusions**, and a
**ten-stage validation plan V-1…V-10** including a no-regression gate requiring **2,250/2,250 still
resolve at 100%** and a no-collision gate. **IRR has no IPD write authority and deposited nothing.**

### 14.4 Three currency corrections recorded additively

| # | Superseded statement | Current fact | Source of change |
| :--- | :--- | :--- | :--- |
| **C-A** | *"All twelve `/api/user-portfolios*` route-method pairs return HTTP 503 with byte-stable fence blobs."* (gap record §1.3; §9 A-9 criteria) | **Six admitted read-only pairs** (`GET`/`HEAD` on list, detail, revisions — 503 `owner-context-unavailable` only when the binding precondition is absent) **plus six still-fenced write/context pairs** (503 `operation-not-admitted` **even with** a binding assertion). `owner-context-unavailable.ts` blob `cb8db45d668d28cee7e0a52721001d579a872733` still byte-identical; the `user-portfolio-transport.ts` blob assertion `51704c12…` was removed. | **Authorized Direct P1 read integration**, IRR `9202e7a` (`2026-11-01`), preceded by `e9df332`. **Not this workstream's work; preserved, not reopened.** |
| **C-B** | DQ-6b Path A guard **V692**: *"the alias is load-bearing: it supplies the 14 raw sources compiled by `tsconfig.broker-import.json`."* | The 14 raw-source paths are present in the tree at **all three** coordinates (`70b24f02`, `8eec74ae`, `7bcae35` — **14/14** each), but at `7bcae35` only `dist/package` is published, so they are **unreachable by IRR via npm**. Presence holds; the **load-bearing characterization is superseded**. | Authorized WS-A pin advance, IRR PR #436 → `51fdcd95…`. |
| **C-C** | DQ-6b Path A guard **V695**: lineage classification *"preserved as-is: `REAL` at the alias … No reclassification … is authorized or performed."* | The live consumption pin `7bcae35` carries **`'UNCLASSIFIED'` ×3**, not `'REAL'` ×3. All three sites feed `computeLineageHash`, so **recorded DB-C1 lineage digests are not reproducible at the live pin**. Undocumented in this R2 report (**0** occurrences of `sourceClassification`), unrecorded in the package profile, and **unasserted by any IRR test** — it passed PR #436's full validation silently. | Authorized WS-A pin advance. **Recorded, NOT remedied** — remediation is a PA decision (finding **I-6**). |

**Two positive consequences were also measured**, and are recorded so the picture is not only
adverse: guards **V693/V694** are **partly resolved** — `src/identity/security_master.ts`
(`60030e0c…`) and `src/contracts/types.ts` (`a644c833…`) are now **byte-identical at `8eec74ae` and
`7bcae35`**, eliminating two of the four divergences Path A had to guard, so the *"two distinct
`SecurityMaster` byte-sets"* condition no longer holds for those paths. And correction **C-A**
**strengthens** the A-8 premise: Direct P1 supplies an existing, effective precedent for a read-only,
owner-scoped, fail-closed, no-identity-read IPC route on the same host — exactly the shape the
evidence route requests.

**Do not conflate two classification axes.** The mapper's `sourceClassification` classifies the
**provenance of imported holdings data**; the existing finding **C-02** concerns the **origin of D05
master records** (§18.1 row 25's *"52 real + 2,198 synthetic"* is an aggregate, and **no governed D05
record carries a per-record `REAL` classification**). **No inference between them is drawn or
authorized here.**

### 14.5 The exact outstanding authorities

| Decision | Instrument required | Accountable | Blocking |
| :--- | :--- | :--- | :--- |
| **1** | PA-09 **content-pin** designation, extended to name **all three** H-12 R5 coordinates (finding **I-3**), the blob disposition for `4d0e757b…` and `c8ea9d8f…` (**I-5**), non-Limb-A scope acceptance (§4.5 C-1), the QE lineage classification (**I-6**), and the condition-subsequent reading of obligation 5 (**I-2**) | **PA (Ramki)** | A-11 → A-15 |
| **2** | The §4.5 choice **C-1 / C-2 / C-3** — coupled to Decision 1, since **C-2** makes G4P-1, G4P-4 and `001c3c80` all inadmissible | **PA (Ramki)** | A-11 |
| **3** | A fresh **DQ-6b-class alias-coordinate re-render** (**I-4**) — separate from PA-09 and not foldable into it silently, because Path A is an effective act and effective acts are not rewritten | **PA (Ramki)** | H-12 regeneration |
| **4** | The **lineage-classification disposition** (**I-6**); re-declaring `'REAL'` would require an IPD change and is **not available without new IPD implementation authority** | **PA (Ramki)** | DB-C1 / QE criteria |
| **5** | An **additive U1 §8 amendment** under DEC-06 R-2/R-5 with **Act ID assigned** and the three `TBD-PA` sets filled | **PA (Ramki)** | A-8 → A-9; WS-A-DM 3.3 and 6.2 |
| **6** | A **new Wave-2 Security Master Expansion Act** — not renderable meaningfully before A-5 supplies genuine ISINs | **PA (Ramki)**, then **IPD** | A-6 → A-7; WS-A-DM 1.7 |
| **7** | **The operator's own `DHAN_DETAILED_HOLDINGS_V1` export** — the only dependency whose head is **outside the PA and outside both repositories** | **Operator (Ramki)** | A-5 → A-6 → A-7 |

**Not required from the PA, and not to be inferred as required:** Gate 4 execution; any QE item
starting; QE 0/11 → 11/11; Gate C or U4 rendering; result acceptance; Gate 5 initiation or admission;
any `W-1` relaxation; any fence lift; any P04 change; any DP-2 Option 2F change; any real-user durable
save; any production scope; any IPD write; any dependency-pin change; any D05 deposition; any HTTP
route implementation.

### 14.6 Post-merge receipt — **PENDING**

| Item | Value |
| :--- | :--- |
| IRR PR for this addendum and the three packages | **`PENDING`** |
| Merge commit / tree | **`PENDING`** |
| Hosted CI at the exact PR head | **`PENDING`** |
| Post-merge `main` CI run | **`PENDING`** |
| Remote byte read-back of the four changed paths | **`PENDING`** |
| Tracker section carrying the registration | **§16.251** (`CV-CORR-231`, `CHG-2026-11-05-02`, ledger `V2046`–`V2063`) |

This receipt is authored **`PENDING`** deliberately: **a receipt cannot be part of the commit it
verifies.** It is discharged by a follow-up publication, per the §16.248.7 / PR #430 and §13.4 /
PR #441 precedents, and its `PENDING` wording is then **preserved** rather than rewritten.

**A-10, A-8, A-5 and A-6 are NOT closed.** They move from *open and unprepared* to *prepared and
blocked on a named authority*. Tracker **§16.251** registers the packages and the three currency
corrections. **No gate, pin, fence, authority act, register count or master revision was moved by this
addendum. Workstream A and milestone WS-A-DM remain NOT COMPLETE** — the nine-pillar roll-up is
unchanged (**4, 5, 7, 9** IMPLEMENTED-VERIFIED; **3** and **6** partly AWAITING-AUTHORITY; **2**
NOT-QUALIFIED; **1** BLOCKED-EXTERNAL; **8** AWAITING-AUTHORITY), and WS-A-DM has **three independent
outstanding dependencies**, so discharging any one of them would not complete the milestone.

### 14.7 Post-merge receipt — discharge of §14.6 (`2026-11-05`)

§14.6's `PENDING` wording is **preserved verbatim above**; this subsection discharges it, following the
§16.248.7 / PR #430 and §16.249.13 / PR #441 precedents.

| Item | Verified value |
| :--- | :--- |
| IRR PR for this addendum and the three packages | **#442**, head **`5beb77b97efd76ab96cc039b9b81c06c442809e1`** |
| Merge commit / tree | **`b2332d1727e20c71c2c5b776455bc84634169ce2`** / **`68ef57f19907f4f451817e6afbded61dad7b4c45`**, merged `2026-11-05T12:06:45Z`; `git ls-remote` **agrees** |
| Hosted CI at the exact PR head | **SUCCESS** — `Python compile · source/evidence/tracker validation`, run **`42024256428`**, job `127234379294` |
| Post-merge `main` CI run | **`42024392810`** — `push` — **`completed` / `success`** |
| Remote byte read-back of the changed paths | **5 / 5 MATCH** — this R2 report blob `0ad56b5e2c5090de44beff1f5248acb35c406b9d`, **69,906** bytes, SHA-256 `92028c0f5c01abeddaab8729…`; tracker blob `3a3ccda188831cbb6277537cd20bfc7c481da05a`, **3,855,680** bytes; A-10 `d95f31207cfc6dc757706619fc57ba17a460c620` (**54,089**); A-8 `8a6eed7ede30d463728bc02246df9b6e095edb84` (**32,308**); A-5/A-6 `d28c56a4f196e27926c444c77a55902c2387f8a3` (**28,102**) |
| Tracker section carrying the registration | **§16.251** (`CV-CORR-231`, `CHG-2026-11-05-02`, ledger `V2046`–`V2063`), with its own receipt at **§16.251.16** |
| Paths changed by PR #442 | **5** (2 `M`, 3 `A`) — **`frontend/**` = 0**, **`evidence/**` = 0** |
| Pins read back from merged `main` | **UNCHANGED** — broker-import `#7bcae35…`, np04 `#2e11fa3b…`, production-market-data `#279d1eed…` |
| Validator at merged `main` | **exit `0`**; `U-5` remains **NOT RUN** |
| Unrelated work | **PR #438 preserved untouched** (MERGED at `bcf0670`); 0 open IRR PRs, 0 open IPD PRs |
| IPD writes | **ZERO** |

**A-10, A-8, A-5 and A-6 remain NOT closed** — each is *prepared and blocked on a named authority*, per
§14.5. **No gate, pin, fence, authority act, register count or master revision was moved. Workstream A
and milestone WS-A-DM remain NOT COMPLETE.**

## §15 — Plain-English PA decision paper and technical appendix (`2026-11-05`)

The three packages registered at §14 are **authoritative and complete**, but they are written for a
technical reader. This addendum records a further, **additive** layer whose sole purpose is to make the
seven outstanding decisions **decidable by a non-engineering decision-maker**, and to attach a
**recommendation** to each.

| Document | Status |
| :--- | :--- |
| `docs/integration/WS-A-PA-DECISION-PAPER-PLAIN-ENGLISH-2026-11-05.md` | **PREPARED PROPOSAL + RECOMMENDATIONS — NOT AUTHORIZED, NOT EFFECTIVE** |
| `docs/integration/WS-A-PA-DECISION-PAPER-TECHNICAL-APPENDIX-2026-11-05.md` | **PREPARED — NOT EFFECTIVE**; no Act ID assigned, no pin designated, every `TBD-PA` field still blank |

### 15.1 What the paper adds beyond §14

1. **A translation layer.** Git, commits, hashes, repositories and governance terms are rendered into
   ordinary language, with a glossary and a stated six-stage distinction (**prepared proposal →
   recommended decision → PA authorization → effective authority → implementation → verified
   completion**) that is never blurred.
2. **Recommendations, not questions.** Each of the seven decisions carries an issue statement, its
   necessity, the available choices, the consequences of each, **the recommended choice and why**, what
   deferral costs, and **the exact boundary of the authorization sought** (implementation? testing?
   acceptance? production?).
3. **Three newly developed alternatives**, clearly labelled, where the existing documents defined none:
   **G4P-4** (the alias coordinate as a Gate 4 content candidate) for A-10; the **distinct-pair**
   construction with proposed literals for A-8; and an **extended three-coordinate PA-09 form** for the
   H-12 R5 manifest.
4. **A completable PA decision record**, in ordinary language, recorded here as
   **`PENDING — NOT YET RENDERED`**.

### 15.2 The minimum feasible set — a correction to the §14.5 framing

§14.5 listed three **independent** outstanding authorities. That remains true. This pass adds a
**feasibility ranking** the earlier framing did not contain:

| Track | Decisions | Downstream work | Additional requirements beyond a PA decision |
| :--- | :--- | :--- | :--- |
| **Evidence** | **5 + 6 + 7** | **A-9** | **NONE — entirely within existing IRR capability** |
| Gate 4 | 1 + 2 + 3 + 4 | A-11 … A-15 | Host `desktop-no0nhtp` (**unreachable**), separate operator authority, QE **0/11** |
| Identity | none | A-5 → A-6 → A-7 | An **external operator file**, a **new Wave-2 act**, **IPD** work |

**∴ Decisions 5 + 6 + 7 are the minimum set that converts a PA signature directly into completable
work.** All seven are nonetheless recommended in one sitting.

### 15.3 Statuses unchanged

**No action changed status**, because **nothing was authorized**: A-8 remains `PREPARED — BLOCKED ON
PA`; A-10 remains `PREPARED — BLOCKED ON PA`; A-9 remains blocked by A-8; A-11 remains `NOT STARTED`.
§14.5's register, §14.6's `PENDING` cells and §14.7's receipt are **preserved verbatim and not
amended**. The nine pillars are unchanged and **WS-A-DM remains NOT COMPLETE**.

**No gate, pin, fence, authority act, register count or master revision was moved. No owner identity
was established, no retention period set, no Act ID assigned and no PA act fabricated.**

### 15.4 Post-merge receipt — discharge of §15 (`2026-11-05`)

The status wording of §15 and §15.3 is **preserved verbatim above**; this subsection records publication,
following the §14.6 → §14.7 precedent. **A receipt cannot be part of the commit it verifies**, so the
tracker's own receipt was authored `PENDING` at §16.252.15 and discharged by the follow-up PR that
carries this subsection.

| Item | Verified value |
| :--- | :--- |
| IRR PR for §15, the decision paper, the appendix and tracker §16.252 | **#444**, head **`5e73b4fd3fe6505617b320d6aa1ec9e69a48aec1`** — the only open IRR PR at merge time |
| Merge commit / tree | **`c40fcdfda37c8ccd95c926b978c536066a13d67b`** / **`6e556d02905ab728e9cee2de80db53a70410e671`**, merged `2026-11-05T13:21:07Z`; `git ls-remote` **agrees**; merged tree **identical to the PR head's tree** |
| Hosted CI at the exact PR head | **SUCCESS** — `Python compile · source/evidence/tracker validation`, run **`42034850537`**, job `127270215191`, 29 s |
| Post-merge `main` CI run | **`42035004471`** — `push` — **`completed` / `success`** |
| Remote byte read-back | **4 / 4 MATCH** — decision paper blob `fa134b93cf2ad0eeece955ef4bf507aff115043a` (**80,988** B); appendix blob `9d6f8949386ba92d849d92768b2a6eaf0ca849ad` (**33,813** B); this R2 report blob `af4d186f0a11eacde274c7a7dee3140ff9f85305` (**75,456** B); tracker blob `9b6f92fa68cbb5db1c91d7f2a6d8c787de84550f` (**3,892,340** B, read via the Blobs API) |
| Paths changed by PR #444 | **4** (2 `M`, 2 `A`), **all pure insertions** — **`frontend/**` = 0**, **`evidence/**` = 0** |
| Pins read back from merged `main` | **UNCHANGED** — broker-import `#7bcae35…`, np04 `#2e11fa3b…`, production-market-data `#279d1eed…` |
| Validator at merged `main` | **exit `0`**; `U-5` remains **NOT RUN** |
| Unrelated work | **PR #438 preserved untouched** (MERGED at `bcf0670`); Direct P1 integration at `9202e7a` untouched; **0 open IRR PRs, 0 open IPD PRs** |
| IPD writes | **ZERO** |

**The PA decision record remains `PENDING — NOT YET RENDERED`.** A-5, A-6, A-7, A-8, A-9, A-10, A-11,
A-12, A-13, A-14, A-15 and A-18 **remain open and unchanged**; §14.5's register, §14.6's `PENDING`
cells and §14.7's receipt are **unamended**. **No gate, pin, fence, authority act, register count or
master revision was moved. No owner identity was established, no retention period set, no Act ID
assigned and no PA act fabricated. Workstream A and milestone WS-A-DM remain NOT COMPLETE.**

## §16 — The PA rendered A-8 decisions 5, 6 and 7 (`2026-11-05`)

**Additive. §§1–15 above are preserved and NOT rewritten**, including §14.5's register as it stood,
§14.6's `PENDING` cells, §14.7's receipt, §15.3's "statuses unchanged" statement and §15.4's receipt —
each of which was **true when written**. §9's A-8 and A-9 rows are **live status cells** and are updated;
nothing else above is amended.

### 16.1 Instrument of record

| | |
| :--- | :--- |
| **Document** | `docs/integration/IIPS_v3.0_CAP02_U1_AMEND_01_EVIDENCE_RETRIEVAL_ROUTE_PA_DECISION_ACT_2026-11-05.md` |
| **Act ID** | **`IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01`** — assigned under the PA's Decision 7 direction, from the surveyed CAP-02 convention, **collision-checked before assignment** |
| **Authority** | Standing PA grant (F-3 §1.2, blob `c4c9f7d7…`) as construed by **DEC-06 R-1/R-2/R-3/R-5/R-6/R-7**, plus the **PA direction of `2026-11-05`** |
| **Baselines** | IRR `main@d7cd3b658bdcd9e59c7888e8b6a37af7e4646232` (PR #446); IPD `main@07e86a4f2c105651f3097a96cb519f8611945e30` (PR #128); **0** open IRR PRs, **0** open IPD PRs |
| **Status** | **RENDERED — EFFECTIVENESS CONDITIONAL — PUBLICATION VERIFICATION PENDING — NOT YET EFFECTIVE — IMPLEMENTATION NOT AUTHORIZED** |

### 16.2 The three decisions as rendered

| Decision | Marking | Values established |
| :--- | :--- | :--- |
| **5** owner identity | **APPROVED AS AMENDED** | Canonical owner ID **`owner-4dc756b3`**; personal tenant scope **`irr-personal-073dd1c8`**; carrier env var **`IIPS_BROKER_EVIDENCE_OWNER_PATH`** (adopted as proposed); human-readable label **`SAIRAM`** — **excluded from both partition keys**; carrier SHA-256 **`27e70c10be68f42a7dc90e5d07669b2a4201c3b807ee0b9fb14e9247b06f8b2c`**, **367** bytes |
| **6** retention | **APPROVED AS AMENDED** | **Indefinite**; **explicit owner-controlled deletion only**; **no** automatic expiry, deletion, purge or **destructive compaction**; integrity, import history and audit metadata preserved; **50 MB = warning/review only**, never a deletion trigger, **no quota**; **two new obligations O-1 (storage-usage visibility) and O-2 (backup/recovery safeguards)** |
| **7** Act ID | **APPROVED** | The proposed form **assigned**, verified derived-from-convention and unassigned elsewhere |
| **1–4** Gate 4 | **NOT RENDERED — STILL PENDING** | Not treated as approved in any respect |

**PA's binding application context:** personal, single-user application; **no production deployment or
multi-tenant concept**; the personal application principal remains owned by Ramki; **no second-user access
or shared-account authorization is implied.**

### 16.3 Three findings produced by the reconciliation

**Finding R-1 — the amendment form had to change from "appended U1 §8" to "separate instrument".** The A-8
package §6 and the drafted §3 both assumed the text would be appended to the U1 act file. **It cannot be:**
that file's blob **`a3ae368d2a585aae3eea63d5f5e36225b1fcc9d9`** is a **published, remotely-verified
anchor**, cited in the effective composition act's **4/4 remote read-back receipt**
(`IIPS_v3.0_CAP02_BROKER_IMPORT_MODAL_PORT_COMPOSITION_ACT_EFFECTIVE_2026-10-23.md:207`) and in tracker
`CHG-2026-10-23-18` and verification row `V425`. Appending would change the blob and invalidate all three.
**∴ additive, by separate instrument** — the `G3-AMEND-01` model — with the amending instrument's §7
numbered **clause-for-clause identically** to the drafted §8 so every existing cross-reference resolves.
**Both U1 blobs re-verified unchanged at authoring:** effective `a3ae368d…` / 13,357 B; prepared
`966891d4c7016a5e993e609a03488c8719499e3e`.

**Finding R-2 — the PA's identity structure is *required* by an existing conformance rule, not merely
preferable.** `IIPS_v3.0_OWNER_CONTEXT_F1_F2_VALUE_ACT.md` §4.1 requires partition keys to be *"Opaque: no
personal, username, email, or company identity; no `@` or identity token"*. **`SAIRAM` used as
`ownerUserId` would FAIL that check.** A case-insensitive census found `sairam` in **11 IRR** and **2 IPD**
files, and **every occurrence is the repository owner's e-mail address** in commit-author or package-author
metadata (`Ramaki <sairam260573@gmail.com>`; `"author": "Ramki / Sai <sairam260573@gmail.com>"`;
`ramkivs <sairam260573@gmail.com>`) — precisely the excluded identity-token class, and independent
corroboration of the PA's context. **∴ `SAIRAM` is adopted as the label and excluded from both keys.**
Case-sensitive uniqueness was clean regardless (**0 / 0 / 0**), so the exclusion rests on **conformance**,
not collision. The keys are **generated** by a documented deterministic rule — which also satisfies F-3's
recovery property that *"re-materialisation from the governing PA declaration is deterministic"*; a random
value could not be re-materialised after loss. Derivability is **not** a vulnerability: the values are
`EQUALITY_PARTITION_ONLY; NOT_AUTHENTICATION_OR_AUTHORIZATION_CREDENTIALS`.

**Finding R-3 — the tenant key survives as a mechanical necessity, stripped of multi-tenant meaning.**
`brokerImportEvidenceStore.ts` declares `exists(tenantId, ownerUserId, importId)` (l.225),
`read(tenantId, ownerUserId, recordId)` (l.229) and `list(tenantId, ownerUserId)` (l.235), and the record
type carries both as `readonly … : string` (ll. 63–64, 132–133). PF-1 is *"a library authority, not an
HTTP identity or access-control boundary"*, and `ownerContextFromBinding.ts` supplies **no** owner fields.
**∴ the two-key equality partition cannot be removed without changing merged persistence code, which this
act does not authorize.** It is fixed to **one** permanent personal value, with **no** tenant registry,
enumeration, selection, switching, provisioning surface, per-tenant policy, second tenant, directory,
roles, groups, claims, scopes or federated-identity surface.

### 16.4 Multi-tenant and production assumptions removed — with every protection retained

Nine assumptions were removed (act §8). **No protection was weakened by any removal.** Three are worth
recording here because they could be mistaken for relaxations:

| Removed framing | Protection **retained in full** |
| :--- | :--- |
| "foreign … valid-but-unowned `importId`" (presumed multiple owners) | **Full indistinguishability**: any `importId` outside the owner's own scope yields the same opaque **`404`** — never `403`, never a partial record, never an enumeration signal |
| "no route enumerates **another owner's** records" | The **stronger** single-scope statement: **no route enumerates evidence records at all**; no collection endpoint; four-segment `…/evidence` stays **`404`** |
| Precautionary production-deployment framing | **Production scope remains expressly prohibited** — the PA's context confirms there is none, so the prohibition is **strengthened** |

Also **added** to the prohibition clause by Decisions 5 and 6: any automatic deletion, purge or destructive
compaction; any `DELETE` method or destructive HTTP operation in the namespace; any new endpoint for
storage visibility or backup; any second user, shared account, delegated access, role, group, tenant
selection or enterprise identity surface; **any use of the label `SAIRAM` as a partition key, credential or
authorization input**.

### 16.5 Effect on the three independent outstanding dependencies (§14.5, §15.2)

| Track | Before §16 | After §16 |
| :--- | :--- | :--- |
| **Evidence** (`A-8 → A-9`) | `A-8 PREPARED — BLOCKED ON PA` | **`A-8 PA-RENDERED — PUBLICATION VERIFICATION PENDING`; `A-9 NOT STARTED — implementation NOT AUTHORIZED`.** Blocker `WS-A-EV-ROUTE-1` **remains OPEN** until effectiveness is recorded. On discharge, **A-9 becomes executable entirely within IRR** — still the only track with no unreachable host, no external file and no IPD dependency |
| **Gate 4** (`A-10 → A-11…A-15`) | `A-10 PREPARED — BLOCKED ON PA` | **UNCHANGED — decisions 1–4 still PENDING**, and still additionally requiring host `desktop-no0nhtp` (**unreachable**), separate operator authority and QE **0/11** |
| **Identity** (`A-5 → A-6 → A-7`) | `A-5 BLOCKED-EXTERNAL` | **UNCHANGED** — still requires a genuine `DHAN_DETAILED_HOLDINGS_V1` export from the operator, then a new Wave-2 act, then IPD work |

**WS-A-DM pillar effects, still NOT COMPLETE:** pillar **3** criterion 3.3 (retrieval) and pillar **6**
criterion 6.2 (owner carrier) move from *awaiting a PA decision* to *awaiting publication verification and
then implementation* — **neither is satisfied yet**. All other pillars unchanged. **Discharging the
evidence track alone still would not complete WS-A-DM.**

### 16.6 Three genuine remaining items, reported precisely (act §11)

1. **The deletion surface — a PA decision is required if deletion is to exist inside the product.**
   Decision 6 requires explicit owner-controlled deletion; the permission keeps the address **read-only**
   with **no delete operation anywhere**. Both preserved: deletion is authorized **in principle** and
   exercisable **outside** the HTTP surface (an explicit owner action on the local data directory,
   documented in the runbook). **Admitting any deletion endpoint requires a further act.** Not assumed, not
   admitted.
2. **Decision 5's "bind personal holdings" reaches beyond A-8.** The instrument binds the **broker-import
   evidence** scope. **Durable holdings persistence is a different, fenced domain** (F-3 / NP-06 / NP-04;
   `W-1` ON; `WRITE_NOT_AUTHORIZED`; `savedRows` 0). **Extending `owner-4dc756b3` to durable holdings is
   NOT authorized by this instrument** and would need its own governed decision. **Reported, not assumed.**
3. **Decision 3's coordinate moved — a change of fact during this pass.** Concurrent **PR #446** merged at
   `d7cd3b65` (`2026-11-05T13:35:06Z`) and advanced the broker-import pin from **`7bcae35`** to
   **`07e86a4f`** (IPD PR #128). Decision 3's **substance** is unchanged — ratify the alias at the live
   authorized coordinate, moving no pin — but **the coordinate named in §14.2 and in appendix A-1.3 is now
   stale and must be re-censused before the PA signs.** Neither document was rewritten; the correction is
   recorded here and in the act's §11(4).

**Not remaining items, for the avoidance of doubt:** obligations **O-1** and **O-2** and the clause-18
consent-copy reconciliation are **implementation obligations on A-9**, not PA decisions. **No technical
blocker remains to effectiveness** — conditions (ii)–(iv) are ordinary publication and verification steps
executable under the standing grant (DEC-06 R-1).

### 16.7 Boundaries preserved by §16

**No route implemented. No handler, carrier module, test or configuration written. No HTTP surface
changed.** `brokerImportHttp.ts` remains at **exactly two** admitted routes and is **unmodified**. The U1
act and the prepared U1 act are **byte-identical**. **No pin changed by this act** — the broker-import pin
now reads `#07e86a4f…` **because of the separately authorized concurrent PR #446, not because of this
work**; np04 `#2e11fa3b…` and production-market-data `#279d1eed…` are unchanged. **Zero IPD writes.** Gate 4
remains **AUTHORIZED — NOT STARTED**, **QE 0/11**, **PA-09 OPEN**; Gate 5 remains **NOT INITIATED / NOT
ADMITTED**; **DQ-4 8/10**. `W-1` remains **ON**; `evaluatePortSaveGuard()` false; `WRITE_NOT_AUTHORIZED`;
`savedRows` **0**. **P04 IN FORCE. DP-2 Option 2F unchanged. `IIPS_BROKER_IMPORT_EVIDENCE_V1` unchanged.
`U-5` NOT RUN.** No D05 deposition; no fabricated ISIN or D05 row; D05 master revision unchanged. **No
real-user save authorized, implied or advanced. No production scope.** PR #438 and the Direct P1
integration at `9202e7a` **preserved untouched**. A-1…A-4, A-16, A-17 **not reopened**. Decisions 1–4
**not treated as approved**.

**§15.4's closing statement — that no owner identity was established, no retention period set and no Act ID
assigned — was true of PR #445 and is preserved verbatim. It is superseded as current state by this §16:
an owner identity, a retention rule and an Act ID are now established by a PA rendering, in an instrument
that is RENDERED but NOT YET EFFECTIVE. Workstream A and milestone WS-A-DM remain NOT COMPLETE.**

## 16.8 Post-merge receipt — discharge of §16 (`2026-11-05`)

> **Additivity.** §16.8 is appended below §16.7. **§§1–16.7 are preserved byte-for-byte and nothing
> above is modified**, except the two **live status cells** in §9's action register (A-8 and A-9), which
> §16 itself declared to be live and updatable. Every narrative statement above remains as written.

**§16 recorded the PA's rendering of decisions 5, 6 and 7 and stated, correctly at the time, that the
instrument was RENDERED but NOT YET EFFECTIVE, with §10's conditions (ii)–(iv) PENDING.** Those conditions
are now discharged. This receipt records the discharge.

### 16.8.1 Publication coordinates (recorded here, never self-embedded in the act)

Clause 25 of the adopted amendment text requires that publication coordinates be recorded *exclusively* in
the post-merge tracker receipt and *never* self-embedded in the act. Accordingly the act's own §14 cites
**this register entry** for them, and the identifiers below are stated here and in **tracker §16.254.17**.

| Item | Value |
| :--- | :--- |
| Publishing PR | IRR **#447** — rendering of PA decisions 5/6/7 as the U1-AMEND-01 evidence-retrieval authority |
| PR head commit | **`70a5c4a234938492e7b4ce6bf0a278298bc9f398`** |
| Merge | **MERGED** `2026-11-05T14:15:08Z`, method `merge` |
| Resulting IRR `main` | **`510ffb003ebf9c38d328904051ef303be4b96257`** |
| Resulting tree | **`4cfa3df99362a9322be75bcf5f5d42e319b0b3af`** |
| Parents | `d7cd3b658bdcd9e59c7888e8b6a37af7e4646232` + `70a5c4a234938492e7b4ce6bf0a278298bc9f398` |
| Independent confirmation | `git ls-remote origin refs/heads/main` **agrees** with `510ffb00…` |
| Paths changed | **6** — one new act, the tracker, this R2 report, the A-8 package, the PA decision paper, the technical appendix. **`frontend/**` = 0. `evidence/**` = 0.** |

### 16.8.2 The four conjunctive conditions of §8.7(25) / §10 — all DISCHARGED

| Condition | Determination | Evidence |
| :--- | :--- | :--- |
| **(i)** PA adopting act; Act ID assigned; §8.2(7) and §8.3(16) filled | **DISCHARGED** | Instrument §§3, 4, 5 |
| **(ii)** Publication to IRR `main` | **DISCHARGED** | PR **#447** → `510ffb00…`, per §16.8.1 |
| **(iii)** Green exact-head CI **and** green post-merge `main` CI | **DISCHARGED** | Exact head: `CAP-03 Revision 7 IRR-only static checks`, job `Python compile · source/evidence/tracker validation` **SUCCESS** in 1 m 15 s — run **`42042751662`**, job id `127297558147`, event `pull_request`, head_sha `70a5c4a2…`. Post-merge `main`: run **`42043198126`**, event `push`, **`completed` / `success`** |
| **(iv)** Independent remote read-back **including U1 blob byte-identity** | **DISCHARGED** | **6 / 6 changed paths MATCH** and **2 / 2 frozen anchors MATCH** — base64-decoded remotely via the Git Blobs API and **re-hashed to the same Git blob id**, not compared as metadata alone |

**∴ `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` is EFFECTIVE.** The determination is
recorded in the instrument's own **§14** (appended additively, 66,199 → **75,696** bytes, Git blob
`ee272b3b…` → `d39f28bad785f0b342e2bc5a554a497165f5ace1`) and in **tracker §16.254.17**.

### 16.8.3 Finding R-1 vindicated by remote evidence

§16.3's Finding R-1 held that appending §8 to the U1 file was **inadmissible**, because U1's blob
`a3ae368d2a585aae3eea63d5f5e36225b1fcc9d9` is a **published anchor** at three coordinates — tracker
`CHG-2026-10-23-18` (line 8010), tracker row `V425`, and the modal-port composition act's completed 4/4
read-back receipt (line 207). The read-back at merged `main` confirms both U1 blobs are **byte-identical**:

| Frozen anchor | Git blob | Bytes | Result |
| :--- | :--- | :--- | :--- |
| U1 act (EFFECTIVE `2026-10-23`) | `a3ae368d2a585aae3eea63d5f5e36225b1fcc9d9` | 13,357 | **MATCH — BYTE-IDENTICAL** |
| U1 act (PREPARED `2026-10-23`) | `966891d4c7016a5e993e609a03488c8719499e3e` | 15,329 | **MATCH — BYTE-IDENTICAL** |

**No published anchor was invalidated by this amendment.** Also read back unchanged:
`frontend/server/broker-import/brokerImportHttp.ts` blob `cd0b42d1c7803f9451586194e42c0357135271d2`
(12,499 bytes) — the admitted `/api/broker-import/` route set was **still exactly two routes** at that
coordinate.

### 16.8.4 Register consequences — the two live §9 cells updated by this receipt

| Row | Was (as authored by §16) | As at this receipt |
| :--- | :--- | :--- |
| **A-8** | `PA-RENDERED — AMENDMENT ADOPTED AS A SEPARATE INSTRUMENT; PUBLICATION VERIFICATION PENDING`, `NOT YET EFFECTIVE` | **`CLOSED — AUTHORITY EFFECTIVE AND REMOTELY VERIFIED`** |
| **A-9** | `NOT STARTED — implementation NOT AUTHORIZED until A-8's effectiveness is recorded in a post-merge receipt` | **`AUTHORIZED — NOT STARTED`** — unblocked; §12's condition met |
| Blocker `WS-A-EV-ROUTE-1` | **OPEN** (§16.5) | **CLOSED** — the authority it awaited now exists and is verified |
| WS-A-DM pillars **3.3** (retrieval) and **6.2** (owner carrier) | `AWAITING-AUTHORITY` | **`AUTHORIZED — NOT IMPLEMENTED`** — **neither satisfied; WS-A-DM remains NOT COMPLETE** |

§16.5's row stating that the blocker *"remains OPEN until effectiveness is recorded"* and §16.7's closing
statement that the instrument was *"RENDERED but NOT YET EFFECTIVE"* are **preserved verbatim**: both were
true when written. They are superseded **as current state** by this §16.8 only.

> **The A-9 row above states the position AS AT THIS RECEIPT.** Implementation followed under this
> authority and is recorded at **§17**, which supersedes both the A-9 row here and the §9 A-9 cell as
> current state. §16.8 is not rewritten to reflect it.

### 16.8.5 Nothing was implemented by §16 or by this receipt

**No route, handler, carrier module, `matchRoute()` extension, test, consent-copy change, runbook entry or
configuration was written by §16 or by §16.8.** Implementation was deliberately not performed by the
rendering pass: that pass was scoped to reconciliation, documentation, validation, publication and remote
verification. Boundaries re-asserted at merged `main`: write scope **NOT AUTHORIZED** (`W-1` unmet,
`WRITE_NOT_AUTHORIZED`, `savedRows` **0**); fences **UNCHANGED** (six admitted read-only pairs, six
write/context pairs still 503); **pins unchanged by the act** (broker-import `#07e86a4f…` moved only by the
separately authorized concurrent PR #446; np04 `#2e11fa3b…` and production-market-data `#279d1eed…`
unchanged); **zero IPD writes**; Gate 4 still **AUTHORIZED — NOT STARTED**, **QE 0/11**, **PA-09 OPEN**;
Gate 5 **NOT INITIATED**; **DQ-4 8/10**; **P04 IN FORCE**; **DP-2 Option 2F unchanged**; **`U-5` NOT RUN**;
no D05 deposition; no real-user save; no production scope.

### 16.8.6 Remaining items — unchanged by effectiveness

The three genuine items at §16.6 / act §11 **survive** this discharge and are restated precisely:

1. **The deletion surface is a genuine open PA decision.** Decision 6 requires explicit owner-controlled
   deletion; clauses 16(h) and 24 forbid any HTTP `DELETE`. Both are kept: deletion is authorized **in
   principle** but exercisable only **outside** this route or by a **further act**. **Does NOT block A-9** —
   the read route admits no deletion capability at all.
2. **"Bind personal holdings" reaches beyond A-8.** Extending `owner-4dc756b3` to durable holdings touches
   a fenced domain (`W-1` **ON**) and needs its own decision. **Must not be swept into A-9.**
3. **Decisions 1–4 remain PENDING**, and **Decision 3's coordinate has moved** to IPD `07e86a4f…`
   (concurrent PR #446 / IPD PR #128). Substance unchanged; the coordinate must be re-censused before
   signature.

**O-1, O-2 and the clause-18 consent-copy reconciliation are implementation obligations on A-9, not PA
decisions. No technical blocker remains to effectiveness, and none remained to A-9.**

### 16.8.7 Publication of this receipt

| Item | Value |
| :--- | :--- |
| Author | **PENDING** — a receipt cannot be part of the commit it verifies |
| Carried by | The same IRR pull request as the A-9 implementation at **§17**, as a **separate commit**, so that the authorization chain reads in order: discharge of §10 first, then the implementation it authorizes |
| Its own coordinates | Recorded in the **next** receipt; **never self-embedded here** |
| Files changed by this receipt | **3** — the act (§14), this R2 report (§16.8 plus the two live §9 cells), and the master tracker (§16.254.17) |
| Scope guards | `frontend/**` = **0**; `evidence/**` = **0**; U1 acts **byte-identical**; `package*.json` **0**; `.github/**` **0** |
| Validators | `validate_windows10_host_profile.py` → **exit 0**; `py_compile` → **clean**; `git diff --check` → **clean** |

**Workstream A and milestone WS-A-DM remain NOT COMPLETE.** A-8 is **CLOSED**; A-9 became **AUTHORIZED —
NOT STARTED** at this receipt, and is the only outstanding track with no unreachable host, no external file
and no IPD dependency.

## §17 — A-9 implemented: the `AMEND-01` evidence-retrieval route (`2026-11-05`)

**Registered in the master tracker at §16.255** (`CV-CORR-235`, `CHG-2026-11-05-06`, ledger `V2111`–`V2130`). Authority: `IIPS-V3-CAP02-U1-AMEND-01-EVIDENCE-RETRIEVAL-ROUTE-2026-11-05-01` §8, **EFFECTIVE** `2026-11-05` (§16.8, act §14).

This section records the implementation that §16 and §16.8 explicitly did **not** perform, and that §16.8's A-9 cell forward-referenced. It is authored **before** the implementing merge, so its publication coordinates are recorded by a receipt that follows it.

### 17.1 The route admitted — one, and only one

```
GET /api/broker-import/:portfolioId/evidence/:importId
```

The two-route broker-import boundary is expanded by exactly the one authorized route. There is **no** collection endpoint, **no** list or enumerate variant, and **no** `DELETE` anywhere in the namespace. Clause 19's four-segment form `…/:portfolioId/evidence` remains **404**. Clause 3's admission order is preserved exactly — first-party C9 check, then `IIPS_G3_IPC_BINDING_PROVISIONED`, then `validatePortfolioIdParam`, then one scoped journal read. Clause 5's indistinguishability is preserved: absent, malformed, tombstoned and out-of-scope all answer the **byte-identical** `404 {"outcome":"RESOURCE_UNAVAILABLE"}`, never `403`.

### 17.2 Files changed in this pass (IRR only)

| File | Change | Purpose |
|---|---|---|
| `frontend/server/broker-import/brokerImportEvidenceOwnerCarrier.ts` | **NEW** — 157 ln / 8,046 B | Pins the AMEND-01 carrier: 367 B, SHA-256 `27e70c10…`, key order, one trailing LF; refuses any Git working tree |
| `frontend/server/broker-import/brokerImportEvidenceOwnerResolver.ts` | **NEW** — 200 ln / 7,708 B | Per-request, uncached, digest-verified owner resolution; foreign pairs refused, never adapted |
| `frontend/server/broker-import/brokerImportEvidenceStore.ts` | **+105/−0** | `readByImportId()`, `describeStorageUsage()`, `isRecordPayload()`, `canonicalJson` fix, three retention constants |
| `frontend/server/broker-import/brokerImportHttp.ts` | **+274/−12** — now 585 ln / 25,415 B | `MatchedRoute` widened, `isImportIdShape()`, `BrokerImportEvidenceReader`, the EVIDENCE branch, query-string refusal scoped to that branch |
| `frontend/server/broker-import/index.ts` | **+47/−4** | Exports; the stale "route set is closed" comment rewritten to state the admitted five-segment form |
| `frontend/server/broker-import/brokerImportEvidenceRoute.test.ts` | **NEW** — 1,173 ln / 56,445 B | **70** targeted route tests, including a real-composed-host describe |
| `frontend/server/broker-import/brokerImportImportSafety.test.ts` | **+104/−0** | New describe (**5** tests) plus a `codeOnly()` comment-stripper; **10/10** |
| `frontend/server/user-portfolio/fenceUnchanged.test.ts` | **+86/−0** | New §8.5(20); **13/13** |
| `frontend/src/features/broker-holdings/BrokerHoldingsPreview.tsx` | **+32/−1** | Clause 18 consent copy reconciled; retention disclosure section added |
| `frontend/src/features/broker-holdings/BrokerHoldingsPreview.test.tsx` | **+70/−0** | **7** copy tests against **rendered** text; **13/13** |
| `docs/OPERATOR_RUNBOOK.md` | **+149/−0** | New §3.3 (carrier) and new §10 (O-1, O-2, deletion). **No section renumbered** |

**Deliberately unchanged — verified 0 diff lines against `origin/main`:** `frontend/package.json`, `frontend/package-lock.json` (**pins unchanged**: broker-import `07e86a4f…`, np04 `2e11fa3b…`, production-market-data `279d1eed…`); `frontend/server/persistence/**` (**no method added to PF-1**); `brokerImportEvidenceWriter.ts` and `brokerImportEvidenceRecoverer.ts` (both remain **test-only** artefacts); `brokerImportEvidenceRestart.test.ts`; `brokerImportEvidenceStore.test.ts`; `frontend/vite.config.ts` (§12 step 11 — the existing `/api` proxy already covers the new segment); `executive-transport.ts` (clause 23 — `/api/evidence/:id` untouched); `owner-context-unavailable.ts` (clause 21 — blob **`cb8db45d668d28cee7e0a52721001d579a872733`**, byte-identical); both frozen U1 acts (blobs `a3ae368d…` / `966891d4…`, byte-identical). **Zero IPD writes.**

### 17.3 Design determinations the act forced

1. **`importId` could not be derived into a `recordId`.** PF-1 mints `recordId = randomUUID()`, exposes no `readByDedupKey`, and `exists()` is boolean. Resolution therefore runs owner-scoped `listOrdered(tenantId, ownerUserId)`, selects by `importId`, then `verify()`. PF-1 was **not** extended.
2. **Both partition keys are withheld from the response body** (`tenantId`, `ownerUserId`) per §8.1(6) and the existing `503` non-disclosure precedent. So `recordDigest` covers the complete stored record and is **not** recomputable from the projection — disclosed in-band as `retention.recordDigestCoversWithheldScopeKeys: true` rather than left implicit.
3. **`retention` is route-supplied and excluded from the digest.** It is a policy attestation minted per response, not stored evidence — which is what lets the storage counters be live without invalidating retained records.
4. **Tampering is distinguished from corruption.** Digest mismatch on a schema-valid record → `EVIDENCE_TAMPERED`; schema-invalid → `EVIDENCE_INVALID`. Both are `503`, never `404`: reporting a tampered record as merely absent would hide the tampering.
5. **Consent enforcement is disclosure, not a gate.** A request-time consent check would require reading identity from the request, which clause 10 forbids. Clause 18 is discharged through product and UI copy instead.
6. **Query-string refusal is scoped to the evidence branch only**, so no pre-existing preview contract changed.
7. **The store is constructed per request and never cached**, which is why carrier removal fails closed on the very next request with **no restart** — proved against the real composed host.
8. **Clause 14's P04 volatility is carried in the response**, disclosing the limitation without removing it.

### 17.4 Finding R-3 — the evidence journal sits at the data root, alone

`BrokerImportEvidenceStore` is the **only** journal consumer here that writes at `resolveDataDir()` with **no** dedicated subdirectory: watchlists uses `watchlists/`, collaboration `collaboration/`, settings `settings/`, while broker-import evidence writes `$IIPS_DATA_DIR/journal.ndjson` at the root.

The consequence is **favourable**, and is what makes owner-controlled deletion safe to document: that single file contains broker-import evidence and nothing else, so acting on it cannot touch watchlists, collaboration or settings.

The layout is **recorded, not changed**. Relocating the journal would move data Decision 6 requires to be preserved, and the act fixes no directory layout, so a move would require its own decision. Nothing in §17 authorizes one.

### 17.5 Targeted verification

Only tests relevant to this change were run — no unrelated full regression suite.

| Check | Result |
|---|---|
| `npx tsc --noEmit` (whole frontend project) | **exit 0** |
| `brokerImportEvidenceRoute.test.ts` | **70/70 pass** |
| `BrokerHoldingsPreview.test.tsx` | **13/13 pass** |
| `fenceUnchanged.test.ts` | **13/13 pass** |
| `brokerImportImportSafety.test.ts` | **10/10 pass** (was 5) |
| Blast radius — `npx vitest run server/ src/features/broker-holdings/ src/api/` | **75 files / 1,148 tests / 0 failures**, 76.24 s |
| `validate_windows10_host_profile.py` | **exit 0** |
| `py_compile` over all `docs/**/*.py` | **clean** |
| `git diff --check`, CR count, trailing-whitespace lines | **clean / 0 / 0** |

Behavioural coverage includes: correct-owner retrieval `200`; unretained id `404`; malformed `importId` `404` **byte-identical** to absent; cross-owner unreachable; digest-only tamper → `EVIDENCE_TAMPERED`; schema-invalid tamper → `EVIDENCE_INVALID`; carrier absent / unreadable / byte-edited / digest-mismatched → `503 owner-context-unavailable`; carrier removal fails closed **without restart** and re-materialisation succeeds **without restart**; `DELETE` → `405 Allow: GET`; `?…` → `400 invalid-request`; the four-segment collection form → `404`; `…/preview` → `404`; no enumerated route; write fences at the six-admitted-plus-six-fenced baseline; no raw IPD source copied.

Two harness facts were forced by the platform rather than chosen: a bare trailing `?` had to be tested by calling the exported handler directly, because `fetch`/undici normalises it away; and structural source assertions had to run over comment-stripped source, because the route's own documenting prose names `callIpc`, `purge` and `expire` in order to **deny** them. The prose was kept.

### 17.6 Operator obligations O-1 and O-2, and the deletion surface

- **O-1 — storage-usage visibility, with no new endpoint.** Delivered three ways: the response `retention.storage` block (`recordCount`, `approximateBytes`, `reviewThresholdExceeded`); server-side logging at import; and `OPERATOR_RUNBOOK.md` §10.2–§10.3, which records the location and the direct-inspection commands. The **50 MB** figure (52,428,800 B) is a **warning and review point only** — it deletes, blocks, truncates and refuses nothing, and is **not a quota**. The location limb is deliberately **not** served over HTTP, because clause 24 forbids any storage-visibility endpoint.
- **O-2 — owner-operated file-copy backup and recovery** (`OPERATOR_RUNBOOK.md` §10.4): copy `$IIPS_DATA_DIR/journal.ndjson`, verify the digest, and on recovery restore the copy and re-materialise the carrier. Carrier re-materialisation is **deterministic** — the same act always yields the same 367 bytes and digest — so losing the carrier never loses the owner scope. **No automated backup service, no cloud sync, no third-party transmission.** Recovery never reconstructs a record from a digest, and never substitutes a re-import: P04 quarantine ids are per-process, so a re-import is a **different** record with a **different** digest.
- **Owner-controlled deletion lives outside HTTP** (§10.5). Whole-journal deletion works today and is contained by Finding R-3. **Per-record deletion does not exist** — PF-1 is append-only, its only mutations being `append` and `updateReadState`. **No deletion functionality of any kind was added** by A-9.

### 17.7 Limitations and explicit non-claims

1. **Nothing in the live HTTP import path currently retains evidence.** The retention leg is implemented, restart-proven and exercised by the store's tests and the separate-process proof, but no production import composes it. **Composing retention is not one of §12's eleven steps and was therefore not done** — it would add a write path this act does not authorize. Until it is composed under separate authority the route answers `404` for every `importId`, correctly. **A `404` is not evidence that the route is broken.**
2. **The deletion surface remains a genuine open Program Authority decision.** Decision 6 requires explicit owner-controlled deletion; clauses 16(h) and 24 forbid any HTTP `DELETE`. Both are honored, so deletion is authorized in principle and exercisable today only at whole-journal granularity outside HTTP. Per-record deletion requires a **further act** plus a change to the append-only journal authority. **Recorded, not resolved, and not blocking A-9.**
3. **`approximateBytes` is a lower bound** — it sums UTF-8 `canonicalJson(payload)` lengths and excludes the journal's per-line envelope.
4. **Decisions 1–4 remain PENDING**; Decision 3's coordinate moved to IPD `07e86a4f…`. The decision paper's confirmation checklist remains unmarked.
5. **"Bind personal holdings" reaches beyond A-8/A-9** (`W-1` ON) and was **not** swept into this work. `W-1` remains `false` ⇒ `WRITE_NOT_AUTHORIZED`, `storeEffect 'NONE'`, `savedRows 0`. Retrieval authority is **not** save authority.
6. **Gate 4 and Gate 5 are unchanged** — Gate 4 remains AUTHORIZED — NOT STARTED (QE 0/11, PA-09 OPEN, host `desktop-no0nhtp` unreachable), Gate 5 NOT INITIATED. **P04 remains IN FORCE; DP-2 Option 2F unchanged; DQ-4 8/10; U-5 NOT RUN.**
7. **No register count, master revision, gate status or acceptance criterion was moved by §17.**

### 17.8 Register consequences

A-9 moves from **AUTHORIZED — NOT STARTED** to **IMPLEMENTED — VERIFIED LOCALLY; POST-MERGE RECEIPT PENDING**, and the live §9 cell was updated accordingly. WS-A-DM pillars **3.3** and **6.2** move from **AUTHORIZED — NOT IMPLEMENTED** to **IMPLEMENTED — VERIFIED LOCALLY**. Register after this section: **CLOSED** — A-1…A-4, A-8, A-16, A-17; **OPEN** — A-5…A-7, A-9 (post-merge receipt pending), A-10…A-15, A-18.

### 17.9 Post-merge receipt — PENDING

Publication coordinates — PR number, head SHA, merged-main SHA, tree SHA, CI run ids, and the independent remote read-back of every changed path — are **PENDING** and will be recorded by a receipt subsection appended after this one, following the §16.8 and tracker §16.254.17 precedent. Consistent with clause 25, these coordinates are recorded **exclusively** in the tracker receipt and the receipt that follows here; they are **never** self-embedded in the act.

**Workstream A and milestone WS-A-DM remain NOT COMPLETE.**

### 17.10 Post-merge publication and read-back receipt — discharge of §17.9 (`2026-11-05`)

Discharges the `PENDING` cells of **§17.9**, whose wording is **preserved verbatim above**, following the §16.8 and tracker §16.254.17 precedents: **a receipt cannot be part of the commit it verifies.** The full evidentiary table — including the per-path Git blob ids, byte counts and SHA-256 digests for all fourteen changed paths — is recorded **exclusively** in the master tracker at **§16.255.9**, per clause 25. This subsection states the determination and cites that section rather than restating it.

| Item | Verified value |
|---|---|
| IRR PR | **#448** — head **`2bfc934547b003eb318c2d22cd65f4463d4db9c1`**, base `main`, the **only** open IRR PR at merge time |
| Commits, authority order | **`63d5b518…`** the PR #447 effectiveness receipt (3 files, +297/−2, **no code**) → **`2bfc9345…`** the A-9 implementation (13 files, +2,610/−18). The discharge of §10 precedes the implementation it authorizes |
| Merge | **MERGED `2026-11-05T16:32:37Z`** as **`c40b7139ea364673fe2d3dea2ee8f85b8a9bc123`**, tree **`2f50fe254d5f7fbeb39ece02829826a74672b6b4`**, parents **`510ffb00…`** + **`2bfc9345…`**; `git ls-remote origin refs/heads/main` **agrees** |
| Exact-head CI | run **`42063904316`** job **`127372649148`** *Typecheck · Test · Build* **SUCCESS** (all 12 steps, incl. the full Vitest suite and the non-zero fully-passing assertion); static run **`42063904236`** job **`127372648497`** **SUCCESS**. **First attempt — no re-run needed** |
| Post-merge `main` CI | run **`42065524937`** job **`127378421371`** **SUCCESS**; static run **`42065524895`** job **`127378420863`** **SUCCESS** |
| Independent remote byte read-back | **21 / 21 MATCH, 0 MISMATCH** — the 14 changed paths plus 7 frozen anchors, fetched from the Git Trees and Blobs APIs, base64-decoded, **re-hashed to the same Git blob id** and **byte-compared to the local tree**. Remote tree `truncated=false`, **2,466** blobs = local `git ls-tree -r HEAD` exactly. Detail at tracker §16.255.9 |
| Frozen anchors | **7 / 7 byte-identical** — `owner-context-unavailable.ts` **`cb8db45d…`** (cl.21), both U1 acts **`a3ae368d…`** / **`966891d4…`**, `package.json`, `package-lock.json`, `vite.config.ts`, `executive-transport.ts` (cl.23) |
| PF-1 and pins | All **8** `frontend/server/persistence/` blobs byte-identical to `510ffb00` — **no method added to PF-1**. Pins **unchanged**; IPD `main` still **`07e86a4f…`** = the broker-import pin. **Zero IPD writes** |
| Route surface read back | `brokerImportHttp.ts` **`a62dd8f2…`** / 25,415 B: five-segment evidence form matched, one `evidence` literal, `readByImportId(` present, **no `DELETE` literal**, `405`+`Allow` present, **no** purge/expire/`setInterval`/`setTimeout`, `callIpc(` count **0** |
| Consent copy read back | The superseded *"not uploaded or stored"* wording survives **only inside the JSX comment documenting the contradiction removed** and is **absent from comment-stripped source** ⇒ absent from rendered copy; the `Evidence retention` region is present |
| Validators | `validate_windows10_host_profile.py` → **exit 0**; `py_compile` → **clean**; `git diff --check` → **clean**; 0 CR, 0 trailing-whitespace; tracker head-30 byte-identical; ledger `V2000`–`V2130` **131/131** unique |
| Scope of this receipt pass | **2 files** — this report (§17.10 plus its one live §9 cell) and the master tracker (§16.255.9). **`frontend/**` = 0, `evidence/**` = 0, `.github/**` = 0, `package*.json` = 0, the AMEND-01 act = 0.** **No code changed, no A-9 work repeated, no test re-run** — by instruction; §17.5's results stand as **remotely attested** by the green CI runs above |
| Its own coordinates | Recorded in the **next** receipt; **never self-embedded here** |

**§17.9 is thereby discharged.** The distinction it exists to preserve is restated here because every
status record in this report depends on it:

> **A-9 retrieval is IMPLEMENTED, MERGED and REMOTELY VERIFIED. Live evidence retention is NOT composed
> into the import flow.** No production import calls `retain()`, so the route answers **`404`** for every
> `importId` — correctly, because nothing has been retained. Composing retention is **not** one of §12's
> eleven steps and was **not** done; it would add a write path this act does not grant. **A `404` is not
> evidence that the route is broken**, and "A-9 complete" must never be read as "evidence is being
> retained".

Register after this receipt: **CLOSED** — A-1…A-4, A-8, A-16, A-17; **OPEN** — A-5…A-7, **A-9 (retrieval
merged and verified; live retention not composed, per-record deletion still an open PA decision)**,
A-10…A-15, A-18. **No gate, pin, fence, authority act, register count or master revision was moved by
this receipt.** Decisions **1–4 remain PENDING**.

**Workstream A and milestone WS-A-DM remain NOT COMPLETE.**
