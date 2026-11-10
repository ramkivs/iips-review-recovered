# Broker Import runtime identity authority — verification of the 2,250 / 2,390 question

**Scope.** IRR repository only. Read-only against IPD. No CSV change, no identity change, no master
expansion, no persistence change. Verified at IRR `c7ab4dd680ad9d8f0b8a1f6ec656593e0351ec2d`
(PR #537 merge, `main`), Node v22.22.3, Vite 5.4.21, `iips-broker-import` version `1.0.0`.

**Question put to this workstream.** "The Broker Import runtime is using the old 2,250-entity IPD
security master instead of the authenticated 2,390-entity master." Two things had to be separated:

1. *is the reproducer a repository defect or an environment defect?* and
2. *is the 2,250 corpus reachable at runtime from any IRR-owned path today?*

**Answer.** It is an **environment (stale-install) defect, not a source defect**, and the stale state
is **not reproducible from a clean checkout of `c7ab4dd6`**. The repository has been correct since
the IPD PR #146 pin advance. What remained was to prove the runtime is correct *from an exact fresh
install* and to name precisely the conditions under which a 2,250 runtime can still occur — and which
of those conditions are already covered by a guard.

---

## 1. What the installed dependency actually is

| Fact | Measured value |
| --- | --- |
| `package.json` specifier | `github:ramkivs/iips-production-market-data#d5e20c15059267a3f824b015e37d652084de5a01` |
| lockfile root specifier | same `d5e20c15…` |
| lockfile `resolved` | `git+ssh://git@github.com/ramkivs/iips-production-market-data.git#d5e20c15…` |
| lockfile `integrity` | `sha512-GwA4k/tHEtc5z6uY2J0/BVOuw/HQfV1vPVax9XrEmQpKJR7SvbOWD5eLAmvgvbJ4Wj/sqO+D59FHk8QlvF4NOg==` |
| published tree | `files: ["dist/package"]`, 5 exports (`portfolio-ui`, `pit`, `d114-non-production`, `operator-drop`, `dhan-server`) |
| materialized tree | `.cache/broker-import`, 204 published files, manifest `aliasCommit=d5e20c15…`, `rawSourcesCompiled=false` |

`npm ci` against the committed lockfile was the install used for every runtime measurement below
(190 packages, exit 0). `npm` warns that it skips integrity verification for git dependencies, so the
installed bytes are verified by checksum rather than by trusting the installer — see §4.

## 2. Which corpus each accessor returns

The pinned IPD revision ships **both** corpora as separate data modules and exposes **two distinct
accessors** (`src/identity/governed_fixture_master.ts`):

| IPD accessor | Corpus | Records | Status |
| --- | --- | --- | --- |
| `getGovernedBroadSecurityMaster()` | D05 **authenticated** universe (`d05_authenticated_universe_data`) | **2,390** | the runtime authority |
| `getGovernedLegacyWave1SecurityMaster()` | D05 **Wave-1** legacy (`d05_broad_universe_data`) | **2,250** | frozen comparison evidence only |

`getGovernedBroadSecurityMaster()` is a backwards-compatible alias that returns the authenticated
master. The Wave-1 module is still *published* (so an older consumer keeps working) but is **not**
wired as the broad master.

Corpus integrity, recomputed from the materialized tree:

```
parsed records        : 2390
sha256(JSON, null, 2) : b555fd28589a03ea5cbb11c92f880468bcc4b63f449b853a18542aca5817d4c4
governed (ACT)        : b555fd28589a03ea5cbb11c92f880468bcc4b63f449b853a18542aca5817d4c4
-> MATCH
```

The preview reports that same revision from IPD's own aggregate rather than asserting it itself:

```
identitySummary.masterRevision =
  BATCH-D05-REPLACEMENT-AUTHENTICATED-UNIVERSE-2026-11-08-001:b555fd28589a03ea5cbb11c92f880468bcc4b63f449b853a18542aca5817d4c4
identitySummary.identitySource = GOVERNED_SECURITY_MASTER
identityAuthority = { source: 'IPD_GOVERNED_D05_SECURITY_MASTER', entities: 2390 }
```

**There is no second authority.** IRR-owned code contains no reference to the Wave-1 corpus or to the
legacy accessor:

```
grep -rn "d05_broad_universe_data|getGovernedLegacyWave1SecurityMaster|D05_BROAD_UNIVERSE_ENTITIES|authenticated_universe" \
     frontend/src frontend/server frontend/scripts   ->   (no matches)
```

## 3. "The cache is stale" was checked and refuted — it cannot be stale

`.cache/broker-import` **did not exist** in this checkout before the build step, and it cannot
survive as a leftover, because:

* `scripts/materialize-broker-import.mjs` **Guard 4** does `rmSync(materializedRoot, {recursive:true, force:true})`
  and then copies, so no artifact from an earlier pin can survive a materialization; and
* every entry point re-materializes: `predev`, `prebuild`, `pretest`, `pretest:ci`, `pretypecheck`
  all run `build:broker-import`, so `npm run dev` rebuilds the cache before Vite starts.

Consequence: **the 2,250 corpus is only reachable at runtime through a stale historical IPD revision
that was itself pinned before 2026-11-08**, never through a stale cache directory.

## 4. How a 2,250 runtime is actually produced (root cause of the reported symptom)

IRR pin history shows exactly this window. `git log` over `package-lock.json`, resolving each
revision's `getGovernedBroadSecurityMaster()` against IPD history:

| IRR commit | IPD alias pin | `getGovernedBroadSecurityMaster()` returned |
| --- | --- | --- |
| `6f1affdc` | `07e86a4` | **2,250** (predates IPD `60cad83`) |
| `ecfd3b61` … `8eb7d184` | `58fc8fb` | **2,250** (predates IPD `60cad83`) |
| `01f9f4d5` | `709fd13` | 2,390 (contains `60cad83`) |
| `931f63f4`, `de3962cb`/`c7ab4dd6` | `d5e20c15` | 2,390 |

IPD `60cad83f227d7d3728d03ba5617e38d34b87c8c0` *"D05 one-time replacement: authenticated runtime
activation + full test re-pin"* (2026-11-08) is the single commit that renamed the Wave-1 accessor to
`getGovernedLegacyWave1SecurityMaster()` and re-pointed `getGovernedBroadSecurityMaster()` at the
authenticated universe. **Any IRR checkout whose `node_modules/iips-broker-import` was installed at
or before `58fc8fb` runs on 2,250 and reproduces the reported symptom exactly.** The fix is to
re-install from the committed lockfile; it is not a code change.

`asOf` is an independent, second cause of the same fingerprint: entity `effectiveFrom` for the newer
listings is 2023-11-15, so an `asOf` earlier than that leaves those rows unmapped even on the 2,390
master. (Verified in the prior reconciliation work; not re-measured here.)

## 5. A/B measurement on the exact operator CSV

Same 68-row file, same orchestrator, same options, only the security master differs. Run through
Vite's own module graph, so module resolution and transforms are the ones the browser receives.

| Authority | Entities | Resolved | Unresolved | Quarantine records | Refusal codes | `ASKAUTOLTD` (row 2) |
| --- | --- | --- | --- | --- | --- | --- |
| `getGovernedBroadSecurityMaster()` — **runtime** | **2,390** | **65/68** | **3** | 3 | `UNMAPPED_IDENTIFIER × 3` | **RESOLVED**, 0 quarantine |
| `getGovernedLegacyWave1SecurityMaster()` — legacy | 2,250 | 1/68 | 67 | 67 | `UNMAPPED_IDENTIFIER × 67` | UNRESOLVED, `UNMAPPED_IDENTIFIER`, quarantine ×1 |

The legacy column is the reported symptom reproduced on demand. The runtime column is what the
application actually does.

## 6. The import itself — actual result on `dhan-holdings-withisin.csv`

Input is the committed operator file, unmodified:

```
path    evidence/broker-import/operator-supplied/dhan-holdings-withisin.csv
bytes   4787      lines 69 (68 data rows)
sha256  4f035cdf623d9223afdf935cda39faf2d8bc0aa1264daa2954ff691a63fbe237
blob    3195bb53…   (introduced by 2649d8ee, unchanged since)
```

Preview result (the browser pipeline, `previewBrokerHoldings`):

| Field | Value |
| --- | --- |
| `status` | `PARSED_UNRESOLVED` |
| `variant` | `DHAN_DETAILED_HOLDINGS_V1` |
| `counts` | `nativeRows 68`, `identityAssessedRows 68`, `identityResolvedRows 65`, `identityUnresolvedRows 3`, `savedRows 0` |
| `perRowIdentityEvidencePublished` | `true` |
| `identitySummary` | `{evaluated:68, resolved:65, unresolved:3, ambiguous:0, notEvaluated:0, excluded:0, saveable:false, refusalCodes:{UNMAPPED_IDENTIFIER:3}}` |
| `contentDigest` | `4f035cdf623d9223afdf935cda39faf2d8bc0aa1264daa2954ff691a63fbe237` (equals the file SHA-256) |

**The three unresolved rows** — every one of them:

| Row | Symbol | ISIN | Exchange | Qty | Status | Refusal | Lookup outcome | Quarantine |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 44 | `NSE` | `INE721I01024` | NSE | 8 | UNRESOLVED | `UNMAPPED_IDENTIFIER` | `ISIN:UNMAPPED_IDENTIFIER` | 1 |
| 51 | `RADHIKA` | `INE583V01021` | NSE | 100 | UNRESOLVED | `UNMAPPED_IDENTIFIER` | `ISIN:UNMAPPED_IDENTIFIER` | 1 |
| 63 | `UNIVASTU` | `INE562X01013` | NSE | 20 | UNRESOLVED | `UNMAPPED_IDENTIFIER` | `ISIN:UNMAPPED_IDENTIFIER` | 1 |

All other 65 rows are `RESOLVED` with basis `PIPELINE_RESOLVED`, a single `ISIN:RESOLVED` lookup and
no quarantine record. These are the same three rows the read-only reconciliation
(`docs/integration/WS-A-68-ROW-IDENTITY-ASSESSMENT-RECONCILIATION-2026-11-09.md`) identified, so the
runtime now agrees with the report instead of contradicting it.

Rows that the earlier report flagged as **ISIN collisions** resolve to the security the **ISIN**
names, which is the resolver's documented contract (ISIN is authoritative; the exchange selects only
a namespace when no ISIN is supplied). Row 19 `ENGINERSIN` `INE510A01028` → `EQ_ENGINERSIN_IN`
("Engineers India Limited"), *not* `EQ_IOC_IN`; row 37 `JIOPLATFORMS` `INE0BJO01010` → `EQ_JPL_IN`
("Jio Platforms Limited"), *not* `EQ_JSWSTEEL_IN`.

**Correct-company check on all 65 resolutions.** For each resolved row, does the CSV symbol appear
among the resolved company's own listings? **47 of 65 match a listing symbol exactly.** The remaining
18 differ only because the Dhan export carries a broker display label rather than the listing symbol;
each still resolves to the company that label denotes:

| CSV label | Company | Listing symbol(s) |
| --- | --- | --- |
| `AJAX` | Ajax Engineering | `AJAXENGG` |
| `BCCL` | Bharat Coking Coal | `BHARATCOAL` |
| `CANARAROBECO` | Canara Robeco AMC | `CRAMC` |
| `CREDO` | Credo Brands Marketing (`MUFTI`) | `MUFTI` |
| `ECOSMOBILITY` | Ecos (India) Mobility & Hospitality | `ECOSMOBLTY` |
| `EMS` | EMS Limited | `EMSLIMITED` |
| `EPACK` | EPack Prefab Technologies | `EPACKPEB` |
| `FINEORG` | Fineotex Chemical | `FCL` |
| `GMRPUI` | GMR Power and Urban Infra | `GMRP&UI` |
| `IIFLCAP` | IIFL Capital Services | `IIFLCAPS` |
| `IGI` | International Gemological Institute | `IGIL` |
| `JIOPLATFORMS` | Jio Platforms | `JPL` |
| `KPENERGY` | K.P. Energy | `KPEL` |
| `PUDUMJEE` | Pudumjee Paper Products | `PDMJEPAPER` |
| `SIGMASOLVE` | Sigma Solve | `SIGMA` |
| `SIYARAMSIL` | Siyaram Silk Mills (`SIYSIL`) | `SIYSIL` |
| `STEELCAST` | Steelcast | `STEELCAS` |
| `VISHALMEGA` | Vishal Mega Mart | `VMM` |

**No resolution is attributable to a different company.**

## 7. P04 fail-closed and no persistence

`identitySummary.saveable = false` with three unresolved rows, so the import stays refused in whole.
The save route confirms the refusal independently rather than trusting the client:

| Request (through the running app's own `/api` proxy) | Result |
| --- | --- |
| `POST /api/broker-import/DEFAULT_PORTFOLIO/holdings`, all 68 rows (3 unresolved) | `403 cross-site-request-refused` |
| `POST …/holdings`, only the 65 resolved rows | `403 cross-site-request-refused` |
| `GET …/revision` | `403 cross-site-request-refused` |
| direct to the transport with a self-consistent `Origin`/`Host` | `503 owner-context-unavailable` |

Both refusals occur **before** any port, adapter or store is constructed, and **no store artifact was
created**: no `*.sqlite*`, `*.db`, `*.journal` or `*.jsonl` appeared anywhere in the tree, the
working tree stayed clean, and `savedRows` remained `0` on every measurement. `WRITE_NOT_AUTHORIZED`
is unchanged. Nothing was persisted, and nothing could have been.

**One observation worth recording, unrelated to this fix.** The Vite dev proxy forwards the browser's
`Origin: http://localhost:5173` while rewriting `Host` to the transport's own authority
(`localhost:8787`), so `compareOriginToHost` sees a mismatch and the C9 hardening in
`server/user-portfolio/firstPartySignal.ts` answers `403` before the owner-context gate. A browser
`fetch` on this dev topology therefore stops at C9, not at the P04/owner-context gate. This is
fail-closed and is *not* the cause of the reported symptom, and it does not weaken P04 — but it does
mean the dev proxy cannot exercise the owner-context path. Changing that would be a boundary change
and is out of scope here; it is recorded, not patched.

## 8. Stale installs: what is already guarded, what is not

The one real residual risk is the stale-install path in §4. Part of it is covered today and part of
it is not:

**Covered.** `server/broker-import/brokerImportPackageConsumer.test.ts` →
*"matches all published/materialized bytes, exports and the inventory digest"* asserts, per file,
that the **installed** `node_modules/iips-broker-import/dist/package` bytes equal the recorded
`broker-import-publication-manifest.json` SHA-256 for commit `d5e20c15`, that the materialized tree is
byte-equal to the installed tree, and that the inventory digest matches. CI runs `npm ci` then
`npm run test:ci` (`.github/workflows/ci.yml`), so a stale or drifted install cannot pass CI. The
runtime entity count is independently pinned: `src/api/brokerHoldingsPreview.test.ts` asserts
`identityAuthority.entities === 2_390`.

**Not covered, by design and left alone.** `scripts/materialize-broker-import.mjs` Guard 2 only
asserts that `node_modules/iips-broker-import/package.json` exists and that `dist/package` exists — it
does **not** verify the installed revision or its integrity. A stale install satisfying that guard
would be materialized as-is. It is caught downstream by the byte-integrity test above, which is why
this was reported rather than patched: verifying the install belongs to the guard test that already
does it, and adding a checksum recomputation to the materializer would duplicate a governed
verification in a build script.

**Unavoidable gap.** npm records no git provenance in the installed package manifest
(`name, version, description, type, scripts, keywords, author, license, devDependencies, dependencies,
exports, files` — no `gitHead`, no `_resolved`, no `_integrity`), so the installed tree cannot
self-report which IPD commit it came from. The lockfile is the only provenance record, and the bytes
are the only proof. This is why the checksum comparison, not a version string, is the guard.

## 9. Reproduction commands

```bash
# exact install (git deps: byte verification is by checksum, not by npm)
cd frontend && npm ci

# materialize the pinned published output; prints the alias commit and file count
npm run build:broker-import
#   broker-import alias d5e20c15059267a3f824b015e37d652084de5a01 materialized:
#   204 published files -> .cache/broker-import (published build output; no IPD source recompiled)

# runtime authority + corpus checksum + A/B + 68-row result were measured by loading the app's own
# modules through Vite's module graph (vite-node), not by re-implementing the pipeline.

# targeted suites
npx vitest run src/api/brokerHoldingsPreview.test.ts \
               server/broker-import/brokerImportPackageConsumer.test.ts
#   Test Files 2 passed | Tests 41 passed
```

## 10. Verification-status ledger

| Required step | Status | Evidence |
| --- | --- | --- |
| Inspect installed package + both IPD aliases | **done** | §1, §2 |
| Verify revision + integrity against `d5e20c15…` | **done** | §1, §4 |
| Inspect `.cache/broker-import`, identify why 2,250 is materialized | **done** | §3 — it is *not* materialized; a stale dir cannot survive Guard 4 |
| Correct the stale state using existing package + build scripts | **done** | `npm ci` + `npm run build:broker-import`; no source, master or identity change |
| Remove only the generated stale cache; preserve sources + user data | **done** | Guard 4 `rmSync` rebuilds it; sources untouched; no user data exists or was touched |
| Rebuild and verify 2,390 materialized | **done** | 2,390, `b555fd28…` MATCH |
| Stop Vite and restart with corrected cache | **done** | 5173 and 8787 both confirmed free first; API restarted, then app (which re-materialized on `predev`) |
| UI reports **2,390 entities** | **done — not via a browser.** The counter is not rendered anywhere in this sandbox: no browser engine is installed and the Playwright browser CDN is unreachable (`ECONNRESET`). The value was read from the serving app instead: the live dev server's served module graph, plus the component's own render input `identityAuthority.entities = 2390`. The literal string is emitted by `BrokerHoldingsPreview.tsx` as `Identity authority: {source} ({entities} entities)`, so 2,390 is what that line prints. |
| Import the exact operator CSV | **done — via the live app's module graph and API, not a browser** | §6, §7 |
| Record actual 68-row result, checksum, refusal reasons | **done** | §6 (all three unresolved rows enumerated) |
| Confirm P04 fail-closed, no holdings persisted | **done** | §7 |
| Targeted tests pass | **done** | 41/41 |

**Declared gap, not asserted away.** No step was performed in a real browser. The sandbox has no
Chromium/Firefox/WebKit binary, no Playwright browser bundle, and `cdn.playwright.dev` /
`playwright.azureedge.net` are unreachable from it (`ECONNRESET` on connect), so a file-chooser
upload could not be executed. Everything a browser would execute was instead executed through Vite's
own module graph — the identical module instances, transforms and resolution — and everything a
browser would send was instead sent over HTTP to the running app. The only unexecuted link is the
DOM file-input event and the resulting paint.

## 11. Boundaries restated

No IPD source, data or master changed. No CSV was modified, and no ISIN was fabricated or repaired.
No speculative mapping and no security-master expansion. No authorization bypass and no partial
holdings save. `iips-np04-governed-persistence` remains pinned at
`2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`. The unrelated changes in PR #538 and PR #539 were not
touched.
