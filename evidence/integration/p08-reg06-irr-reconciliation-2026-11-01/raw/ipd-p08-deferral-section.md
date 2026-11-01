## CAP-02 — `P-08`: Operator Drop / `REG-06` product admission — **continued deferral reaffirmed on verified evidence** (`2026-10-31`)

**Record.** IPD-side evidence reconciliation and disposition record. This section records an
**unchanged** Program Authority disposition (`REG-06`, decided `2026-10-13`) and verifies its
technical prerequisites against IPD `main` at `527f811b…`. **IPD does not decide product
requirements or admission.** PA owns the product requirement and the admission decision; IPD owns
implementation and product integration. Nothing here promotes, exposes, registers or admits
Operator Drop, and nothing here confers production authority.

**Item.** `P-08` — *Operator Drop product admission*, register status **`DEFERRED — REG-06`**,
accountable owner **PA**, execution owner **IPD**, dependency owner **PA**. Required authorization:
**express `REG-06` promotion/admission act**.

### 1. Verified product-requirement status — **NO APPROVED REQUIREMENT EXISTS**

| Question | Verified answer | Basis |
|---|---|---|
| Does an approved **manual-ingestion product requirement** exist? | **NO.** | `git grep -inE 'manual[- ]ingestion'` over IPD `main` → **0 hits**. Over IRR `main` → the only substantive hit is the PA finding itself: *"The existing authoritative evidence does **not** establish an approved manual-ingestion requirement for the IRR product baseline."* |
| Does an **express `REG-06` promotion / admission act** exist? | **NO.** | No such act in IPD (**0** hits) or IRR. Every IRR hit for `REG-06` + promotion/admission is a statement of what a *future* act would have to be, not an act. |
| Is any adjacent authorization a product requirement? | **NO.** | `GOV-REC-2026-NON-PROD-OPERATOR-BYPASS-01` (IPD `evidence/operator_drop/NON_PRODUCTION_SINGLE_OPERATOR_IDENTITY_BYPASS.md`, effective **2026-09-22**) authorizes only an IPD **non-production single-operator identity bypass** for offline visual acceptance. The D114 stage-5 act leaves **`AD-17 / M-2` resolution NOT AUTHORIZED**. |

### 2. Verified admission prerequisites — **ALL FOUR UNSATISFIED**

| # | Required condition | Status | Executed evidence at IPD `main@527f811b…` |
|---|---|---|---|
| 1 | **PIT write integration** | **ABSENT** | **0** occurrences of `persist` / `write` / `store` / `PIT` in `src/operator_drop/*.ts`. `IngestionPipeline.process<T>()` (`src/ingress/pipeline.ts:61`) returns an in-memory `IngestionResult<T>`; **0** persistence references in its 13,199 B. The sole caller `handleOperatorDropFallback` (`src/oq/synthetic_failover.ts:57`–`71`) returns a `FailoverEventReport` and **persists nothing**. |
| 2 | **Series-qualified ISIN resolution** | **ABSENT** | **0** `isin`/`ISIN` occurrences in `src/operator_drop/*.ts`. The only identifier the drop path reads is `record.companyId` (`parser.ts:95`, `:99`), defaulting to the literal `'UNKNOWN'`. Series-qualified identity exists only in `src/d114/non_production_pit_population.ts:98` and is **disjoint** from Operator Drop (**0** cross-references). |
| 3 | **Explicit package-export admission** | **ABSENT** | `package.json` `exports` = `./portfolio-ui`, `./pit`, `./d114-non-production` — **no** `operator_drop` subpath; `main`/`module`/`types` are unset. The published package build **does not even emit the module**: `dist/package/src/` contains `contracts d114 engine_adapters fundamentals identity intelligence normalization pit quality transports ui` — **`operator_drop` count = 0**. `src/index.ts:18` re-exports the internal barrel, which is **not** an export-map admission (per `[E018]`). |
| 4 | **Product runtime callers + end-to-end qualification** | **ABSENT** | Sole runtime caller is `src/oq/synthetic_failover.ts:10`, consumed by `src/oq/oq_suite_runner.ts:294` — the **internal OQ synthetic failover harness**, `Operating Mode: LOCAL_FIXTURE_AND_OFFLINE_DEV`. **0** product-side callers. **0** IRR **code/data** consumers — `git grep -il OperatorDrop` over IRR `main` returns exactly **2** files, both documentation (the `REG-06` tracker rows and the PA decision record), and **0** `.ts`/`.js`/`.json` consumers. No product end-to-end qualification exists. |

### 3. Admission decision — **CONTINUED DEFERRAL** (`REG-06` unchanged)

Operator Drop is **retained as an internal IPD library primitive**. Product admission remains
**`DEFERRED`, fail-closed**. It is **not** promoted, **not** exposed as a product capability,
**not** added to the package export map, and **not** registered on any product runtime path.

The authoritative disposition is IRR's and is **unchanged** by this record:

| Element | Value |
|---|---|
| Instrument | **`REG-06`** (`NP-05`) — *Operator Drop capability disposition* |
| Decided | **`2026-10-13`**, `CHG-2026-10-13-03` |
| Disposition | **"Internal IPD library primitive preserved; product admission `DEFERRED`** (fail-closed)" |
| Bounds recorded | "No runtime callers, package exports, PIT writes, or identifier mappings added; **no IPD code changes**; no approved manual-ingestion product requirement found" |
| Authoritative record | IRR `docs/integration/IIPS_v3.0_GOVERNANCE_RECONCILIATION_PA_DECISION_2026-10-13.md` §§5.2–5.4 — blob `b13b1fc3029f70d61a06d1f2bb0c2b6fce02cc98` |
| Tracker locus | IRR tracker §6 (L445–454); capability row L96; register row L111; matrix row 29 L2697; `DEFERRED / OUT OF SCOPE` census L4802 — blob `712af9cdf4a5a7bc10d2062f262c9f1e922aafcb` |
| Promotion would require | "PIT store write integration, series-qualified ISIN resolution and package export — none of which is authorized here" (PA record §5.4) |
| Scope caution | **`CV-39`** (IRR tracker L1292, L1561): the `DEFERRED` product-admission disposition in `REG-06` governs **Operator Drop**, *not* broker/Dhan ingestion, which `G-2` §2 designates as the baseline to extend. This record must not be read as deferring broker ingestion. |

**Why deferral and not admission:** both governing prerequisites are absent — there is no approved
manual-ingestion product requirement and no express `REG-06` admission act — and all four technical
prerequisites are independently unsatisfied. Implementation presence is **not** product admission,
and no requirement or authorization has been inferred or manufactured here.

### 4. Outstanding dependencies and accountable owners

| Outstanding condition | Owner | State |
|---|---|---|
| Approved **manual-ingestion product requirement** | **PA** | **ABSENT** — blocking prerequisite |
| **Express `REG-06` promotion / admission act** | **PA** | **ABSENT** — blocking prerequisite |
| `AD-17 / M-2` resolution | **PA** | **NOT AUTHORIZED** (D114 stage-5 act) |
| PIT store **write integration** | **IPD** (on admission) | not implemented, not authorized |
| **Series-qualified ISIN** resolution / identifier mapping | **IPD** (on admission) | not implemented, not authorized |
| **Package export** admission | **IPD** (requires PA admission) | absent from `exports` and from `dist/package/src/` |
| **Product runtime callers** + end-to-end qualification | **IPD** (on admission) | absent; only the internal OQ harness |

### 5. Required qualification and acceptance evidence

**For a future admission** (per the `P-08` register: *"PA act + bounded implementation + qualification
+ acceptance"*), the following would be required and does **not** exist today: the PA admission act
itself; PIT write-path tests; series-qualified ISIN binding tests; a package-export consumer test;
product-runtime-caller tests; and product end-to-end qualification with acceptance evidence.

**Executed evidence that does exist — internal primitive qualification only.** Full guarded suite at
IPD `main@527f811b…`: **941 tests executed, 940 passed, 0 failed, 1 skipped** (128 suites), including
the two Operator Drop tests:

| Test | Result |
|---|---|
| `ok 86 — WS-B / OPERATOR_DROP Offline Bootstrap Parser` (`tests/wsb_operator_drop.test.ts`) | **PASS** |
| `ok 37 — Block 3M-A: Non-Production Operator Identity Bypass Architecture` (`tests/non_production_operator_identity_bypass.test.ts`) | **PASS** |

These qualify the **internal primitive**. They are **not** product admission evidence and must not be
cited as such.

### 6. Repository, branch, commit and artifact references

| Reference | Value |
|---|---|
| IPD `main` (verified) | `527f811b17edb02caa665b345d9f36102435e1e8` — note the `P-08` register's cited `main@4e275ec9` is **now stale** |
| IPD `src/` tree | `6dc098d210f3aefa5ed27c9c4cd645a3674ca944` — **unchanged by this record** |
| `src/operator_drop/parser.ts` | `c9950cd08f9cf9acc0b7e6a44789e76c57b1c971` — **byte-identical to the blob cited by `REG-06` on `2026-10-13`** |
| `src/operator_drop/index.ts` | `e263a8553a23be0fb27e7f4de3d83660b56e9c98` |
| `package.json` | `51796e63280c1abb368c27bf8811cc6bad46e132` |
| `src/index.ts` | `dfae33954e033a8730ff4c59bcba1ed987d9e7e1` |
| `src/oq/synthetic_failover.ts` | `89a3ac6be71f7a75390120a62213ec93ffaf4671` |
| IRR `main` (read-only) | `ad7d2362532c146aa023229bae48342eeab646fb` |
| Evidence refs | `[E018]` IRR tracker `REG-06` + IPD `src/operator_drop/**` and `package.json`; `[E026]` `src/index.ts`, `src/oq/synthetic_failover.ts`, `package.json` — both **independently re-verified and corroborated** |
| Not resolved by the `2026-10-31` consolidated pass | IRR §16.234 / `CV-CORR-214` / `CHG-2026-10-31-13` (`IIPS-V3-CONSOLIDATED-OUTSTANDING-RESOLUTION-2026-10-31-01`) resolved `P-11`, `P-18`, `P-19`, `P-20`, `P-33` — **`P-08` was not among them** |

### 7. Two IRR-side staleness findings recorded for a separate IRR work item

Recorded here because IPD may not write to IRR. Neither changes the `REG-06` conclusion:

1. **Packaging observation is stale.** The PA record §5.2 (`2026-10-13`) states IPD `main`
   `package.json` has **"no `exports` and no `main` field"**. At IPD `main@527f811b…` an `exports` map
   **does** exist (three subpaths). The conclusion is unchanged and now rests on stronger evidence:
   `operator_drop` is absent from the `exports` map **and** absent from `dist/package/src/`.
2. **`RawMarketRecord` no longer exists in IPD.** IRR tracker L96 describes the drop path's identity
   as unqualified `symbol` / `isin` (`RawMarketRecord`). `RawMarketRecord` appears in **0 IPD files**
   at `main@527f811b…`; the current path reads `record.companyId` (`parser.ts:95`). The substantive
   finding — no series-qualified ISIN binding — is unchanged.

### Validation

Documentation-only. No executable path, dependency, pin, guard, export map or configuration changed.

| Command | Outcome |
|---|---|
| `npx tsc --noEmit` | exit **`0`** |
| `npm run build` | exit **`0`** (incl. `build:portfolio-ui-package`, `build:pit-package`) |
| `npm test` (guarded runner, CV-35) | **`941` executed, `940` passed, `0` failed, `1` skipped** — matches CI at `527f811b…` |
| `git diff --numstat` | this tracker file only; **zero** changes under `src/`, `tests/`, `scripts/`, `frontend/` |
| `git rev-parse HEAD:src` | `6dc098d210f3aefa5ed27c9c4cd645a3674ca944` — **unchanged** |
| IRR write | **none attempted** — IRR opened read-only |

**Operator Drop remains an INTERNAL IPD LIBRARY PRIMITIVE. `REG-06` product admission remains
`DEFERRED`, fail-closed. No approved manual-ingestion product requirement exists; no express `REG-06`
admission act exists; all four technical prerequisites are unsatisfied. This record is NOT product
admission, NOT implementation completion, and confers no production authority.**
