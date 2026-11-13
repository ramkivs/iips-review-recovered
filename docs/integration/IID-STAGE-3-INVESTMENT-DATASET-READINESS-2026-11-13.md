# IID Stage 3 — Investment Coverage Dataset Readiness

**Record type:** operational readiness evidence record for an existing roadmap stage.
**Stage:** Stage 3 — *Investment dataset readiness*, as defined by the IID operationalisation baseline
(`IID-IDENTITY-AND-INVESTMENT-COVERAGE-READINESS-ASSESSMENT-2026-11-11.md` §21, Stage 3). This record
**does not create, rename or redefine** any stage, work item or roadmap.
**Authored:** 2026-11-13 (UTC).
**Repository head when authored:** `7c25bc490c4f415fb97f7d93cba5f8e572a85e62` on branch
`arena/94a53bb3-iips-review-recovered`. Per this repository's self-documenting-record convention, this
document records only what it observed **before** its own commit; its own commit SHA and any
post-publication state are reported in the accompanying session response, not embedded here.
**Scope of authority:** IRR only. **No IPD read or write. No IID Stage 2 work. No production work.**
**Nature of this record:** investigation and verification only. **No implementation, configuration,
dependency or policy change was made.** No dataset was installed at any runtime location. No runtime
data and no source evidence bundle was committed by this work.

---

## 1. Outcome

> ### **BLOCKED** — Stage 3 acceptance is not achieved, and installation was correctly not attempted.
>
> The existing IID implementation **can** consume genuine evidence-derived issuer bundles and produce
> valid, reproducible sector measurements — that capability was verified independently and is
> documented in §7 to §10. But **no dataset was installed**, because the two prerequisites Stage 3
> itself names are both absent, and one of the five acceptance criteria is defeated by a demonstrated
> product defect:
>
> | # | Blocker | Class | Section |
> |---|---|---|---|
> | **S3-B1** | **Operator decision O3 is not recorded.** Stage 3 names O3 as a prerequisite; the baseline's own decision register states a recommendation is "**never a pre-approval**". No admission of these bundles as operational inputs exists anywhere in the repository. | governance — operator act required | §6 |
> | **S3-B2** | **No designated runtime data directory exists or can be determined.** `IIPS_DATA_DIR` is unset, there is no `.env` or `.env.local`, and no `.iips-data` directory exists. Guessing one is prohibited. Criterion A ("exists at the designated runtime location") therefore cannot be evaluated, let alone satisfied. | environment — operator act required | §4 |
> | **S3-D1** | **Demonstrated defect: sector spelling is not validated at runtime.** An out-of-vocabulary sector string is accepted with exit code 0, no `ERROR`, no `WARN`, an empty `issues.json`, and **0 of 13 sectors measured** — a silently misleading zero. This defeats criterion B. | product defect — recorded, **not** corrected | §8 |
> | **S3-D2** | **Structural: the three-issuer / three-sector population is not reachable** from the existing per-issuer bundles through the existing CLI. Each invocation fully replaces the dataset; reaching three sectors would require hand-authoring a combined input that exists in no bundle and carries no recorded digest. | structural finding — recorded, **not** worked around | §9 |
> | **S3-B3** | **Environment mismatch.** This session ran on a Linux sandbox, not the operator's Windows host. The baseline requires host evidence for Stage 3 ("page capture (host)"). Host-only evidence is marked **unavailable**, not inferred. | environment boundary | §4 |
>
> **Correctly not attempted:** installation into any runtime data directory; hand-authoring a combined
> three-issuer input; any change to the implementation to make the criteria pass; any placeholder or
> empty dataset created to satisfy the readiness check.

Criterion-by-criterion assessment: **A — NOT MET**, **B — NOT MET**, **C — MET** (on scratch
reproductions, per-bundle), **D — PARTIALLY MET**, **E — MET**. Detail in §14.

---

## 2. What Stage 3 is — the authoritative definition, quoted

Stage 3 was not invented for this work item. It is taken verbatim from the operationalisation baseline.

**Objective** (baseline §21, Stage 3):

> "at least one real, digest-verified operator dataset installed at `${IIPS_DATA_DIR}/investment/dataset`,
> plus the ingestion habit."

**Prerequisites:**

> "Stage 1; **O3 decision** (which issuer set; accept OPERATOR_SUPPLIED evidence-derived datasets as
> local operational inputs, with all caveats attached)."

**Acceptance** (baseline §21, Stage 3):

> "`/investment/coverage` lists the installed issuers with non-NONE class (`OPERATOR_SUPPLIED`), sector
> measurement reflects measured sectors (Technology, Consumer, Industrials), methods usable > 0 for
> those sectors; `iid:readiness` flips `fundamentals-dataset` to valid; digests recompute."

**The baseline's own caution, quoted:**

> "installing the evidence bundles **does not** make them market truth — single-issuer, transcribed,
> annual-only, no quarterly, corporate-action table empty. Every surface will keep saying so."

Two consequences follow immediately and shaped this work:

1. **O3 is a hard prerequisite, not a formality.** It is listed under *Prerequisites*, and §28 of the
   baseline says of its own recommendations: *"Recommended is this investigation's recommendation,
   **never a pre-approval**."* A bundle's existence does not authorise its ingestion.
2. **The acceptance criterion "measured sectors (Technology, Consumer, Industrials)"** requires three
   sectors in one dataset — which §9 shows the existing CLI cannot produce from these bundles.

Stage 3 is **independent of Stage 2** (baseline: "can run in parallel") and **independent of IPD**.
Both independences were respected: Stage 2 was not started and IPD was not touched (§16).

---

## 3. Bundles inspected

All candidate bundles were **located by search, not guessed**. All live under `evidence/real-issuer/`.

| Bundle | Issuer (from `ingest-input/roster.json`) | Issuer ID | Sector as recorded | Expected sector | Match |
|---|---|---|---|---|---|
| `REL-1-INFOSYS-2026-11-06` | Infosys Limited | `IN:CIN:L85110KA1981PLC013115` | `Technology` | Technology | ✅ |
| `WI7-CONSUMER-MARICO-2026-11-07` | Marico Limited | `IN:CIN:L15140MH1988PLC049208` | `Consumer` | Consumer | ✅ |
| `WI8-INDUSTRIALS-KEC-2026-11-07` | KEC International Limited | `IN:CIN:L45200MH2005PLC152061` | `Industrials` | Industrials | ✅ |
| `WI3-BORROWINGS-NIL-2026-11-06` | Infosys Limited (same issuer; borrowings-nil variant) | `IN:CIN:L85110KA1981PLC013115` | `Technology` | Technology | ✅ |
| `HEAD-REVALIDATION-INFOSYS-2026-11-12` | — (validation bundle, not an issuer dataset) | — | — | — | n/a |

All three sectors named by the work item and by the baseline are **valid members of the closed
13-member `SectorName` union** (`iips-platform/src/investment/contracts/operatingMetrics.ts:11-24`):
`Banking, Insurance, Capital Markets, Healthcare, Hospitality, Energy, Utilities, Consumer,
Industrials, Technology, Telecom, Auto, Materials`. Spelling and capitalisation match the union exactly
in all three rosters. **No sector misclassification was found in the committed bundles.** The
misclassification risk is nonetheless real and demonstrable — see §8.

Seven further bundles also contain an `ingest-input/` directory (`WI2-PRICE-OBSERVATION`,
`WI3-BORROWINGS-NIL`, `WI5-PREFERENCE-CAPITAL`, `WI6A-S2-CONSOLIDATED-PAGE-RECOVERY`,
`WI7-L038-DEBT-COMPLETENESS`, plus the two sector bundles above). Only the three work-item candidates
and `WI3` (used by the head re-validation) were treated as Stage 3 candidates.

### 3.1 Reporting periods and freshness

Every bundle supplies **three consecutive annual consolidated periods**, `AS_FILED`, `INDAS`,
`source_scale=CRORE`. **No bundle supplies quarterly data.** Periods are honest about their own
provenance: a comparative column is labelled as such.

| Bundle | Periods (fiscal year, period end, filing reference, filed at) | `dataAsOf` |
|---|---|---|
| Infosys `REL-1` / `WI3` | FY2024 → 2024-03-31 `INFY-INDAS-CONSOL-FY24` filed 2024-04-18; FY2023 → 2023-03-31 `INFY-INDAS-CONSOL-FY23` filed 2023-04-13; FY2022 → 2022-03-31 **comparative column of** `INFY-INDAS-CONSOL-FY23` filed 2023-04-13 | 2024-03-31 |
| Marico `WI7` | FY2024 → 2024-03-31 `MARICO-INDAS-CONSOL-FY24-AR` filed 2024-05-06; FY2023 → 2024-03-31 comparative of the same filing; FY2022 → 2023-03-31 comparative of `MARICO-INDAS-CONSOL-FY23-AR` filed 2023-05-05 | 2024-03-31 |
| KEC `WI8` | FY2026 → 2026-03-31 `KEC-INDAS-CONSOL-FY26-AR` filed 2026-05-16; FY2025 → comparative of the same filing; FY2024 → 2025-03-31 comparative of `KEC-INDAS-CONSOL-FY25-AR` filed 2025-05-16 | 2026-03-31 |

**Freshness is materially uneven and is reported as such.** As at 2026-11-13 the Infosys and Marico
datasets are keyed to `dataAsOf = 2024-03-31` — roughly **19.5 months** old — while KEC is keyed to
`2026-03-31`. The baseline anticipates exactly this ("dataAsOf FY2024/FY2026 depending on bundle;
**stale-but-real is still honest**"), and Stage 3 *Remaining* item 3 requires the operator to "decide
and document freshness expectations". **That decision is not recorded, and this record does not make
it.** Staleness caps will therefore continue to apply to any assessment minted from the Infosys or
Marico data.

### 3.2 Source provenance

Provenance is strongest for Infosys and is stated in its `README.md`: the sources are the **issuer's own
Ind AS consolidated annual filings**, including the statutory auditor's report (Deloitte Haskins &
Sills LLP, FRN 117366W/W-100018) and board signatures; **nothing** was taken from aggregators, brokers
or estimate services. 33 of 52 closed line items were carried. Valuation, margin of safety, moat
classification and the risk aggregate were **withheld**, and the bundle states plainly: *"No investment
conclusion is stated in this bundle."* Its disposition is **VALIDATED WITH QUALIFICATIONS**.

Marico and KEC carry `determination-wi7.json` / `determination-wi8.json` recording sector and issuer
selection rationale, and `WI7` additionally commits `source/` FY23/FY24 page text extracted from the
annual reports (`pdftotext -layout`, per `runs/commands.txt`). Both state their scope as
*"IRR only; no IPD writes, no policy change, no new persistence mechanism"*.

### 3.3 Bundle integrity — every declared digest independently recomputed

Each bundle's own `digests.json` was recomputed from the bytes actually committed. **All entries match;
there are no mismatches and no missing files.**

| Bundle | Digest entries | Match | Mismatch | Missing |
|---|---|---|---|---|
| `REL-1-INFOSYS-2026-11-06` | 37 | **37** | 0 | 0 |
| `WI7-CONSUMER-MARICO-2026-11-07` | 30 | **30** | 0 | 0 |
| `WI8-INDUSTRIALS-KEC-2026-11-07` | 54 | **54** | 0 | 0 |
| **Total** | **121** | **121** | **0** | **0** |

The two bundles use different `digests.json` shapes (`REL-1` is a chain structure with `schemaVersion`,
`chain`, `files`, `external`, `excluded`; `WI7`/`WI8` are flat `{path: {sha256, bytes}}` maps). Both
were parsed and verified.

---

## 4. Environment as found — the designated data directory could not be determined

### 4.1 Observed environment

| Property | Observed value |
|---|---|
| `uname -a` | `Linux e2b.local 6.1.158+ #1 SMP PREEMPT_DYNAMIC Mon May 11 18:48:24 UTC 2026 x86_64 GNU/Linux` |
| OS release | Debian GNU/Linux 12 (bookworm) |
| `process.platform` / `arch` | `linux` / `x64` |
| Node | v22.22.3; npm 10.9.8 |
| **`IIPS_DATA_DIR`** | **UNSET** (empty) |
| `.env` | **absent** |
| `.env.local` | **absent** |
| `frontend/.env*` | **0 files** |
| `.iips-data` directories in the repository | **0** |
| Windows filesystem mounted (`/mnt/c`, `/c`) | **none** |

**This is not the operator's Windows host.** The work item's premise — inspect the actual Windows
environment and its configured `IIPS_DATA_DIR` — **cannot be satisfied from this session.** In keeping
with the standing rule, no claim is made to have inspected the Windows host; host-only evidence is
recorded as **unavailable** (S3-B3), not inferred.

### 4.2 The only recorded value is a commented-out placeholder

Every committed reference to `IIPS_DATA_DIR` was enumerated. The single value-bearing candidate is a
**comment**:

- `.env.example:49` — `# IIPS_DATA_DIR=/abs/path/iips-data` (placeholder, not a configured value)
- `docs/OPERATOR_RUNBOOK.md:68` — `IIPS_DATA_DIR=~/.iips-data` (a documented *example*)
- `docs/OPERATOR_RUNBOOK.md:76` — default `<cwd>/.iips-data`, which is gitignored (`.gitignore:153`)
- `docs/OPERATOR_RUNBOOK.md:379/403/419` — `${IIPS_DATA_DIR:-$PWD/frontend/.iips-data}` for the journal root
- `docs/OPERATOR_RUNBOOK.md:148-150` — the separate `IIPS_NP04_DATABASE_PATH` rules

**These conflict with one another** (`~/.iips-data` vs `<cwd>/.iips-data` vs
`$PWD/frontend/.iips-data`), which is precisely why none of them may be adopted as *the* designated
directory. Choosing between them is an operator act.

### 4.3 Resolution order in the implementation

`iips-platform/src/investment/port/localSnapshotStore.ts:41-45`:

```ts
/** `<dataRoot>/investment/dataset`, where dataRoot = explicit > IIPS_DATA_DIR > `<cwd>/.iips-data`. */
export function resolveDatasetDir(options: LocalStoreOptions = {}): string {
  if (options.dataDir !== undefined) return resolve(options.dataDir);
  const cwd = options.cwd ?? process.cwd();
  const dataRoot = options.dataRoot ?? process.env[FUNDAMENTALS_BOUNDARY.dataDirEnv] ?? resolve(cwd, '.iips-data');
  return resolve(dataRoot, FUNDAMENTALS_BOUNDARY.defaultSubdir, FUNDAMENTALS_BOUNDARY.datasetSubdir);
}
```

The same fallback appears at `identity/sources.ts:556-558`, and `fundamentalsReadPort.ts:40` names the
environment variable (`dataDirEnv: 'IIPS_DATA_DIR'`).

**Consequence.** With `IIPS_DATA_DIR` unset and no explicit option, the resolver would silently fall
back to `<cwd>/.iips-data` — a path **inside the working tree**, and one whose value depends on which
directory the command happens to be run from (`iips-platform/`, `frontend/`, or the repository root all
yield different paths). Writing there would (a) place runtime data inside the repository tree,
contrary to the standing requirement that runtime data stay outside Git, and (b) make the "designated
runtime location" a function of the current working directory rather than an operator decision.
**It was therefore not written to.** This is S3-B2.

### 4.4 Existing dataset at the runtime location

**None.** There is no `.iips-data` directory anywhere in the repository, and no dataset at any resolved
runtime location. Nothing existed to preserve, overwrite or corrupt.

The only datasets present in the repository are **committed evidence artifacts** inside the bundles
themselves: `REL-1-INFOSYS-2026-11-06/dataset/` and `.../dataset-v1/` (10 JSON files each, including
`manifest.json` and `coverage-report.json`). These are evidence of past runs, not runtime data, and
were **read but never modified** (§10).

---

## 5. The ingestion implementation as it actually is

Read from source at head, not assumed. The work item's reference path `src/investment/cli/ingest.ts`
resolves to **`iips-platform/src/investment/cli/ingest.ts`** (186 lines).

### 5.1 Actual CLI surface

```
tsx src/investment/cli/ingest.ts --input <dir> --dataset-dir <dir> [--now <iso>] [--allow-errors] \
    [--dataset-schema <IIPS_INVESTMENT_FUNDAMENTALS_V1|IIPS_INVESTMENT_FUNDAMENTALS_V2>]
```

- `--input` and `--dataset-dir` are **mandatory**; absence is a usage error (`ingest.ts:60-66`).
- `--dataset-schema` is optional and **defaults to V1**. It is validated by
  `assertSupportedDatasetSchema`, which **fails closed before anything is read**.
- `--now` defaults to `new Date().toISOString()`. **Any reproduction must pass `--now` explicitly** or
  the run is not comparable. All runs in §7 do.
- `--allow-errors` writes a partial dataset recording the errors; without it the CLI **exits 1 and
  writes nothing**.

### 5.2 Input layout the CLI actually reads

`loadInputs` (`ingest.ts:86-127`) reads, **from the top level of `--input` only**:

| File | Required | Read as |
|---|---|---|
| `roster.json` | **required** — throws `roster.json is required in <dir>` if absent | `{issuers[], securities[], listings[]}` |
| `periods.csv` | optional | text file; **this is the statement carrier** — a wide CSV with one line-item column per closed line item, one row per period |
| `operating-metrics.csv` | optional | text file |
| `corporate-actions.json` | optional | `{corporateActions[]}` |
| `prices.json` | optional | `{prices[]}` |
| `xbrl-filings.json` + `xbrl/*.xml` | optional | declared instances; an `xbrl/` dir containing XML **without** `xbrl-filings.json` throws — issuer and period are never inferred |

**Files present in the bundles that the CLI does not read:** `WI7`/`WI8` each place
`data-extraction.json` and `identity/{corporate-actions,listing-map,eligible-roster}.json` inside
`ingest-input/`. None of these is read — `loadInputs` looks only at the top level, so
`identity/corporate-actions.json` is **not** picked up as `corporate-actions.json`. These files are
provenance and identity-staging artifacts, not ingestion input. Their presence is harmless (extra files
are ignored) but it means the **corporate-action table ingests empty**, exactly as the baseline warns.
The recorded commands confirm the identity files were copied to a *separate*
`<data>/investment/identity/` directory by hand, after ingestion.

### 5.3 What the CLI writes, and what it attests

`writeDataset` (`ingestion/writer.ts:81-106`) writes each content file in canonical key-sorted form,
computes a per-file sha256, builds the manifest, and returns. Files are written in canonical form so
that, per the module's own documentation, *"re-running ingestion on identical content produces
byte-identical files, hence an identical `contentDigest`, hence an identical `datasetVersion`. The
import timestamp is written into the manifest but is excluded from identity (Part II §R-7)."*

The CLI writes `provider: 'operator-file-input'`, `licence: 'operator-supplied; not redistributable'`,
`importRunId: run-<now>`, and:

```
sourceRights: {
  state: 'OPERATOR_ASSERTED',
  basis: 'operator-supplied input files read from <inputDir>',
  note:  '…operator attestation …; not an independent verification of any third party's terms'
}
```

**This is the single most important semantic in the ingestion path, and it is frequently misread.**
`OPERATOR_ASSERTED` is an **attestation recorded for audit**, not a verification and not an approval.
The CLI performs **no network call**, reads nothing outside the two given directories, and cannot check
any third party's terms. Running the CLI therefore does **not** discharge O3 — it *records* the
operator's assertion. That is why §6 treats O3 as genuinely outstanding even though the CLI succeeds.

Then `measureCoverage` runs and `coverage-report.json` is written; the CLI prints `datasetSchema`,
`datasetVersion`, `dataset`, `coverage` and `renderCoverageSummary(report)`.

---

## 6. Approval and provenance findings — S3-B1, the primary blocker

### 6.1 The decision Stage 3 depends on

Baseline §28, decision **O3**:

> **Admit evidence-derived OPERATOR_SUPPLIED datasets as operational inputs?** (Infosys REL-1/WI2/WI3;
> Marico WI7; KEC WI8 — single-issuer, transcribed, annual-only, empty CA table)
> *Why it is genuinely the owner's:* "Only the owner can accept 'real but thin' as fit for local
> personal use; the system will forever label it honestly, but acceptance is a judgement."
> *Choices:* admit all three / admit subset / reject. *Recommended:* admit all three for local personal
> use with the caveats attached; re-issue on each restatement. *If deferred:* "nothing to assess or
> measure; INVESTMENT page stays NONE; cohort work (R-16) cannot start on real data."

And the register's own preamble, quoted in full because it is dispositive:

> "Genuine owner decisions only — each one shapes the product or its data, none is engineering's to
> make. **'Recommended' is this investigation's recommendation, never a pre-approval.**"

### 6.2 Search for a recorded O3 admission — negative

| Search | Scope | Result |
|---|---|---|
| `admit all three` | all `*.md` under `docs/`, `governance/`, repository root; all bundle `README.md` and `determination*.json` | **0 hits** |
| `operational input` | same | **0 hits** |
| `initial population` | same | **0 hits** |
| `O3 decision` / `O3 —` / `O3 is` | same | **0 hits** for the IID O3. The only `O3` matches are in `IIPS_v3.0_CAP03_*` documents, where the token is `A-O3` — an unrelated CAP-03 designation identifier. **False positives; not IID O3.** |
| `OPERATOR_SUPPLIED` | same | 5 documents, all of which **describe the classification taxonomy or the L-041 divergence**. None admits a dataset as an operational input. |
| approval / permitted-use / authorisation / rights language | the three candidate `README.md` files | hits **only** in the Infosys README (lines 257, 261, 350) — and those hits are about the `datasetClass` vocabulary, not about authorising ingestion (§6.3). **The Marico and KEC READMEs contain no approval, permission, authorisation or rights language at all.** |
| `governance/` directory | `ARENA_ONBOARDING.md`, `RELEASE_CHECKLIST.md`, `REPOSITORY_INFRASTRUCTURE.md`, `VERSIONING_POLICY.md` | none concerns dataset admission |

**Conclusion: no O3 decision is recorded anywhere in the repository.** The baseline's *recommended*
answer ("admit all three") is a recommendation from the same investigation that explicitly disclaims
pre-approval status. **A recommendation is not a decision, and this record does not convert one into
one.**

This triggers the work item's stop condition *"missing operator approval"* → **stop the affected
ingestion, report the exact evidence and the precise operator decision required.** Installation was
therefore not performed (§16).

### 6.3 The one apparent approval reference is stale vocabulary, not an approval

The Infosys README asserts that the run's snapshot reports `datasetClass = APPROVED_LOCAL_INGESTION`
(lines 257, 261), in the context of documentation defect **D-1** ("a real-data run called its own
dataset synthetic — CORRECTED").

**That class name no longer exists at head.** `iips-platform/src/investment/fundamentals/datasetClass.ts:57`:

```ts
export type DatasetClass = 'SYNTHETIC_REFERENCE' | 'OPERATOR_SUPPLIED' | 'UNKNOWN';
```

The same file documents the removal: *"THE VOCABULARY CHANGED DELIBERATELY. `APPROVED_LOCAL_INGESTION`
is gone. It named an approval that no review produced."* Its remaining three occurrences in the source
tree are all in explanatory comments or in a test's quotation of the repudiated rule
(`datasetClass.ts:13,37`; `frontend/server/investment/cli/w05SourceRightsClassification.test.ts:17`).

So the README's phrase is **not** evidence of an approval — it is evidence of the *opposite*: the
programme deliberately deleted the word "approved" from this taxonomy because **no review had ever
produced an approval**. Reading it as an ingestion authorisation would invert its meaning.

### 6.4 Permitted local use

`ingest.ts` writes `licence: 'operator-supplied; not redistributable'` and records `sourceRights` as an
operator attestation that is explicitly *"not an independent verification of any third party's terms"*
(§5.3). The bundles are transcriptions of issuers' own published statutory filings, which supports
personal local use, but **no bundle records an operator determination that local use is permitted.**
Permitted-use status is therefore **UNESTABLISHED** for all three candidates, and the mechanism that
would record it — O3 — is the same decision that is missing.

---

## 7. Capability verification performed — four scratch reproductions

Because installation was blocked (§6) but the *capability* question was answerable, the existing CLI
was run against the committed bundles into **scratch directories under `/tmp`**, outside Git and
outside every candidate runtime location. This follows the repository's own established convention
exactly: **every recorded ingestion run in these bundles wrote to `/tmp`** — `/tmp/rel1`, `/tmp/wi7`,
`/tmp/wi8`, `/tmp/riv2` (per each bundle's `runs/commands.txt`).

Nothing was installed. No readiness check was satisfied by these runs: the D7/D8 diagnostic resolves
the dataset directory from the environment or an explicit `--data-dir` (§12), and no runtime location
was written. Total scratch footprint 632 KB, entirely under `/tmp`.

### 7.1 Exact commands, all from `iips-platform/`

```bash
# 1 — Infosys REL-1 (Technology)
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/REL-1-INFOSYS-2026-11-06/ingest-input \
  --dataset-dir /tmp/s3/rel1/data/investment/dataset --now 2026-11-06T00:00:00.000Z

# 2 — Marico WI7 (Consumer)
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/ingest-input \
  --dataset-dir /tmp/s3/wi7/data/investment/dataset --now 2026-11-07T07:00:00.000Z

# 3 — KEC WI8 (Industrials)
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/ingest-input \
  --dataset-dir /tmp/s3/wi8/data/investment/dataset --now 2026-11-07T08:30:00.000Z

# 4 — WI3 borrowings-nil (the input the WI-13 head re-validation used)
npx tsx src/investment/cli/ingest.ts \
  --input ../evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/ingest-input \
  --dataset-dir /tmp/s3/riv2/data/investment/dataset --now 2026-11-06T14:05:00.000Z
```

Each `--now` value and each `--input` path were taken from the bundle's own committed
`runs/commands.txt` — not chosen for this session. Run 2 is the one deviation: the recorded command
used a staging copy `/tmp/wi7/in`, which `commands.txt` does not show being populated; the committed
`ingest-input/` was used directly instead. Since `loadInputs` ignores the extra files (§5.2), the input
content is identical — and the reproduced digest confirms it byte-for-byte.

### 7.2 Results — all four exit 0, all four digests reproduce exactly

| # | Bundle | Exit | Reproduced `datasetVersion` | Recorded `datasetVersion` | Match | Sectors measured |
|---|---|---|---|---|---|---|
| 1 | Infosys `REL-1` | **0** | `sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e` | `sha256:ca29c835…` (`runs/commands.txt` §6; `dataset/manifest.json`) | ✅ exact | 1/13 |
| 2 | Marico `WI7` | **0** | `sha256:04c96303e269108803b2a5efef565eae2940ecb649b4f34998d01106a9cc6bd0` | `sha256:04c96303…` (`runs/01-ingest.txt`) | ✅ exact | 1/13 |
| 3 | KEC `WI8` | **0** | `sha256:0df73eadcc3a751572ae03aa6d9711d94650fb2cb0567b990dc4242cf19782ab` | `sha256:0df73ead…` (`runs/01-ingest.txt`) | ✅ exact | 1/13 |
| 4 | Infosys `WI3` | **0** | `sha256:21cf25222fcdf0ac31d8e285c631b272f8d3d5e8567f2ed9594e4fff81725847` | `sha256:21cf2522…` (`HEAD-REVALIDATION…/runs/01-ingest.txt`) | ✅ exact | 1/13 |

**4 of 4 exact.** No `ERROR`, no `WARN`, `issues.json = []` in every case. Reproduction used the
committed inputs unmodified and the recorded `--now` values; no argument, input or code was altered.

### 7.3 Measurement results per bundle

| Bundle | Sector | Stage | Usable methods | Withheld | Statement coverage | Operating-metric coverage |
|---|---|---|---|---|---|---|
| Infosys `REL-1` | Technology | **G2_PARTIAL** | 2 | 2 | 87.5% | 0% |
| Infosys `WI3` | Technology | **G2_PARTIAL** | 2 | 2 | 87.5% | 0% |
| Marico `WI7` | Consumer | **G1_ENABLED** | 3 | 0 | 91.7% | 100% |
| KEC `WI8` | Industrials | **G2_PARTIAL** | 2 | 1 | 100% | 0% |

In every run the other 12 sectors are `UNMEASURED` and are listed explicitly under `outstanding`.
`methods declared 38 across 13 sectors; metric ids in vocabulary 33; line items 53`.

**`measuredSectors > 0` holds for each bundle individually — criterion B's measurement limb is met
per-bundle.** Note the two different reasons a sector can read `0%` on operating metrics: Consumer
reaches `metric 100%` because its three methods declare **no** mandatory operating metric (recorded in
`determination-wi7.json`), whereas Technology and Industrials read `metric 0%` because a mandatory
metric is genuinely absent and the dependent method is **withheld**, not approximated. A `0%` is not
uniformly a gap; the coverage report distinguishes them by withholding reason.

### 7.4 Per-file output digests (run 1)

Written by the CLI into `manifest.json.files`, and independently recomputed by the reader in §10:

```
corporateActions.json   37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570
issuers.json            a5c964c83a3c74b482165000fa0f5d4d5aaa6ee186beba4f27d0d581fa82fa34
issues.json             37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570
listings.json           515bae232bdfbbd7b5637aa1ced8253ea44a4318e2e3d6f9a633e010ca25eaa2
operatingMetrics.json   37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570
periods.json            1580f586ec3d406c902ab9f0a4159e5f8dc48083e01a4a9f1e105fd7e90d808c
prices.json             37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570
securities.json         2722930e81b7c89931409d456bf25182de68aad554004af6ccb4b9b63af1db5c
```

The four identical digests are the four **empty** collections (`[]`) — including `corporateActions.json`
and `prices.json`, confirming §5.2's finding that the corporate-action and price tables ingest empty
from these bundles. A dataset directory holds these eight content files plus `manifest.json` and
`coverage-report.json` (ten files).

---

## 8. S3-D1 — demonstrated defect: sector spelling is not validated at runtime

**Status: demonstrated, recorded, deliberately NOT corrected.** Correcting it would be an
implementation change made to make this work item pass, which is prohibited; and the fix belongs to the
product owner's L-series discipline, not to a readiness work item.

### 8.1 The claim in the code

`IssuerRecord.sector` is typed as the closed union `SectorName`
(`iips-platform/src/investment/fundamentals/types.ts:19`). But a TypeScript type is erased at runtime,
and:

- **There is no runtime guard anywhere.** A search of `iips-platform/src/investment/` for
  `isSectorName`, `assertSectorName` and `SECTOR_NAMES` returns **zero** results. No member list of the
  union exists at runtime to validate against.
- **`loadInputs` casts untrusted JSON without checking it** (`ingest.ts:89`):
  `readJson<{ issuers: IssuerRecord[]; securities: SecurityRecord[]; listings: ListingRecord[] }>(rosterPath)`
  — `readJson` is `JSON.parse(readFileSync(path,'utf8')) as T`. The `as T` is an assertion, not a
  validation. Nothing between the file and the dataset ever tests the sector string.
- **`measureCoverage` selects issuers by string equality** (`coverage/measure.ts:189-192`):
  `content.issuers.filter((issuer) => issuer.sector === sector)` over the 13 known sectors. An issuer
  whose sector string is not exactly one of the 13 matches **no** sector, and simply disappears from
  every measurement.

### 8.2 The demonstration

The Marico bundle's `roster.json` and `periods.csv` were copied to a scratch directory and **one
character-class change** was made to the copy: `"Consumer"` → `"consumer"`. The committed bundle was not
touched. The mutated copy was then ingested with the recorded command shape:

```bash
npx tsx src/investment/cli/ingest.ts --input /tmp/s3/probe/in \
  --dataset-dir /tmp/s3/probe/data/investment/dataset --now 2026-11-07T07:00:00.000Z
```

Observed:

| Observation | Value |
|---|---|
| Exit code | **0** — success |
| `ERROR` lines | **none** |
| `WARN` lines | **none** |
| `issues.json` | **`[]`** — the problem is not recorded as an ingestion issue |
| Sector string stored in `issuers.json` | **`"consumer"`** — the invalid value is persisted verbatim |
| `datasetVersion` | `sha256:56eb02ea1a13aa712a38561efe4259aed93c4840147f15b99a6a7f9f69b35c35` |
| `completedMeasurements` | **`[]`** |
| Sectors measured | **0 of 13** |
| `outstandingSectors` | all 13 |
| Consumer row | `Consumer UNMEASURED usable 0 withheld 3 stmt 0% metric 100%` |

Compare with the unmutated bundle: `Consumer G1_ENABLED usable 3 withheld 0 stmt 91.7%` and 1/13
measured. **A single letter's case destroyed the entire measurement, and the run reported success.**

### 8.3 Why this is a genuine defect and not a curiosity

The resulting `Consumer UNMEASURED … stmt 0%` row is **indistinguishable** from the row produced by a
sector that legitimately has no issuers in the dataset. In the same output above, eleven other sectors
also read `stmt 0%`. A reader — human or machine — cannot tell "no data for this sector" from "the one
issuer that belongs to this sector was silently dropped by a spelling mismatch". There is no issue
record, no warning, and a zero exit code.

This defeats acceptance criterion B directly: *"sector spelling/classification validated, incorrect
sectors cannot silently yield misleading zeros."* It also engages the prohibition on accepting
**zero measurements as successful coverage**: the mutated run is a zero-measurement run that exits 0.

**Exposure.** All rosters in these bundles are hand-authored JSON transcribed from filings. The defect
is not theoretical: it is one keystroke away on any future bundle, and it fails **silently in the
direction that looks like success**. It is recorded here as **S3-D1** and recommended for the
limitation register under the owner's L-series discipline. It is **not** assigned an `L-` identifier by
this record, because register identifiers are the owner's to mint.

---

## 9. S3-D2 — structural finding: the three-issuer population is not reachable

### 9.1 `writeDataset` replaces; it does not merge

`ingestion/writer.ts:81-106` opens with `mkdirSync(dir, {recursive: true})` and then writes **every**
file in `DATASET_FILE_NAMES` unconditionally via `writeFileSync`. There is no read of any pre-existing
dataset, no merge and no append. A search of `ingest.ts`, `builder.ts` and `writer.ts` for
merge/append/accumulate semantics finds only `readDataset` (the verifier, line 118) and an unrelated
comment about nil-versus-number classification.

### 9.2 The demonstration

The three bundles were ingested **sequentially into one dataset directory**:

| Step | Input | `datasetVersion` after | Issuers in `issuers.json` after | Sectors measured |
|---|---|---|---|---|
| 1 | Marico (Consumer) | `sha256:04c96303…` | 1 — `['Marico Limited']` | 1/13 |
| 2 | KEC (Industrials) | `sha256:0df73ead…` | 1 — `['KEC International Limited']` | 1/13 |
| 3 | Infosys (Technology) | `sha256:ca29c835…` | 1 — `['Infosys Limited']` | 1/13 |
| **Final state** | — | `sha256:ca29c835…` | **1 issuer** | **`completedMeasurements: ['Technology']` — 1 of 13** |

**Marico and KEC were silently overwritten.** No warning, exit 0 at every step. The final directory
holds one issuer and one measured sector — indistinguishable from having run only step 3.

This is also an **overwrite hazard**: a second invocation against a populated dataset directory
destroys the first dataset with no diagnostic. Had a real runtime dataset existed at
`${IIPS_DATA_DIR}/investment/dataset`, the reference three-bundle invocation sequence would have
destroyed it twice. That is the specific risk the work item's stop condition *"risk of
overwriting/corrupting existing runtime data"* names.

### 9.3 Why the content model is not the constraint — the CLI is

`DatasetInputs.issuers` is `readonly IssuerRecord[]` (`builder.ts:74`) and `buildDatasetContent`
(`builder.ts:548`) accepts it. **The dataset content model supports N issuers.** The constraint is
narrower and sits in the CLI: `loadInputs(inputDir)` reads exactly **one** `roster.json` from exactly
**one** `--input` directory (`ingest.ts:87-89`), and `run()` calls it once (`ingest.ts:130`). There is
no repeated `--input`, no glob and no merge mode.

### 9.4 Consequence for Stage 3 acceptance, and what was refused

The baseline's Stage 3 acceptance requires *"sector measurement reflects measured sectors (Technology,
Consumer, Industrials)"* — three sectors in one installed dataset. The only two ways to reach that with
the existing code are:

1. **Author a combined input directory** — a merged `roster.json` with three issuers plus a merged
   `periods.csv` with nine period rows. Those files exist in **no** bundle, carry **no** recorded
   digest in any `digests.json`, and would be **hand-authored identity and statement records**. This
   fails criterion A's "input digests recorded and verified", fails the requirement that the schema
   accept the bundle "without transformation", and is prohibited outright ("no hand-authored identity
   records"; "do not force the three-issuer target with unapproved/incomplete data").
2. **Change the implementation** to add a merge or multi-input mode — prohibited ("do not widen or
   change the implementation merely to make this task pass"), and out of scope for a readiness item.

**Both were refused.** The three-sector target is recorded as **not reachable** with the existing CLI
and the existing per-issuer bundles. What *is* verified is that each bundle individually produces a
genuine, reproducible, non-zero measurement of its own sector (§7.3).

Note that the baseline's own Stage 3 *Remaining* item 2 is consistent with one issuer at a time — it
gives a single-bundle invocation and adds "(REL-1: use `REL-1-INFOSYS-2026-11-06/dataset/` directly, or
rebuild from `ingest-input/`)". The three-sector expectation appears only in its *Acceptance* line.
Reconciling those two is an owner decision, recorded here rather than resolved by workaround.

---

## 10. Independent reload, and the classification of the committed datasets

### 10.1 Independent reload of the reproduced datasets

Each scratch dataset was reloaded through the **existing** reader, `readDataset`
(`ingestion/writer.ts:118`), which per its own documentation *"verify[ies] it before returning anything.
A digest mismatch is a hard failure: the caller gets no partially trusted data."* Classification used
the existing `classifyDataset` (`fundamentals/datasetClass.ts`). No new verification code was written.

All four reloads succeeded. For run 1:

```
readDataset            : OK (digests verified by the existing reader)
datasetSchema          : IIPS_INVESTMENT_FUNDAMENTALS_V1
datasetVersion         : sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e
contentDigest          : sha256:ca29c8357fd3ae87889af07b27ffc317f09745caaed870b287d7ca1f8fc6d71e
importRunId            : run-2026-11-06T00:00:00.000Z
sourceRights.state     : OPERATOR_ASSERTED
classifyDataset()      : OPERATOR_SUPPLIED
issuers                : 1 -> IN:CIN:L85110KA1981PLC013115  Infosys Limited  sector="Technology"
```

The same reload pattern held for runs 2–4 (Marico/`Consumer`, KEC/`Industrials`, WI3/`Technology`),
each 1 issuer, each classifying `OPERATOR_SUPPLIED`.

### 10.2 The committed datasets classify `UNKNOWN`, not `OPERATOR_SUPPLIED`

The two **committed** datasets in `REL-1-INFOSYS-2026-11-06/` were also reloaded read-only:

| Committed dataset | `readDataset` | `datasetVersion` | `sourceRights` | `classifyDataset()` | Issuers | Periods | Issues |
|---|---|---|---|---|---|---|---|
| `dataset/` | **OK** | `sha256:ca29c835…` | **absent** | **`UNKNOWN`** | 1 — Infosys Limited / Technology | 3 | 0 |
| `dataset-v1/` | **OK** | `sha256:9be1a83ef198393b97465e104bef9270287bdc01a400c140a9f70927cdfa96e0` | **absent** | **`UNKNOWN`** | 1 — Infosys Limited / Technology | 3 | 0 |

Both are intact and verify. But both were written **before the `sourceRights` field existed**, so their
rights evidence is genuinely absent and the fail-closed classifier answers `UNKNOWN` — *"The dataset may
be real and permitted, or real and not. Nothing here says which."*

### 10.3 Field-level comparison: exactly one manifest field differs

Comparing the reproduction of run 1 against the committed `dataset/`: **all eight content files are
byte-identical** (`diff -rq` reports only `manifest.json`), and the manifests agree on every field
except one.

| Manifest field | Reproduction (2026-11-13) | Committed `dataset/` | |
|---|---|---|---|
| `contentDigest` | `sha256:ca29c835…` | `sha256:ca29c835…` | SAME |
| `datasetVersion` | `sha256:ca29c835…` | `sha256:ca29c835…` | SAME |
| `files` (8 per-file sha256) | identical map | identical map | SAME |
| `datasetSchema` | `IIPS_INVESTMENT_FUNDAMENTALS_V1` | same | SAME |
| `importRunId` | `run-2026-11-06T00:00:00.000Z` | same | SAME |
| `lastImportAt` / `knownAsOf` | `2026-11-06T00:00:00.000Z` | same | SAME |
| `dataAsOf` | `2024-03-31` | same | SAME |
| `completenessPct` / `quality` | `100` / `good` | same | SAME |
| `coverage` | `{annualPeriods: 3, corporateActions: 0, …}` | same | SAME |
| `provider` / `licence` | `operator-file-input` / `operator-supplied; not redistributable` | same | SAME |
| `digestScope.excluded` | `["lastImportAt","importRunId",…]` | same | SAME |
| **`sourceRights`** | `{state: OPERATOR_ASSERTED, basis: …, note: …}` | **`<ABSENT>`** | **DIFFERS** |

**Exactly one field differs**, and it is excluded from the content digest — which is why
`datasetVersion` reproduces despite the manifest differing. Two findings follow:

1. **Reproducibility is exact.** The `--now` value was honoured identically; the reproduction is not
   merely digest-equal but field-equal on every digested and non-excluded manifest field.
2. **Installing the committed dataset directory as-is would install a dataset that classifies
   `UNKNOWN`**, whereas rebuilding from `ingest-input/` at head classifies `OPERATOR_SUPPLIED`. The
   baseline's Stage 3 *Remaining* item 2 offers both routes as alternatives ("use
   `REL-1-INFOSYS-2026-11-06/dataset/` directly, **or** rebuild from `ingest-input/`"), but they are
   **not equivalent**: they yield different dataset classes. Its *Acceptance* line requires
   "non-NONE class (`OPERATOR_SUPPLIED`)". **Only the rebuild route satisfies that.** This is recorded
   because choosing between the two routes is an operator act with a reader-visible consequence.

### 10.4 Bearing on `L-041` (OPEN)

`L-041` is live at head and directly conditions the acceptance line quoted above. Per
`HEAD-REVALIDATION-INFOSYS-2026-11-12/findings/B-DATASET-CLASS-DIVERGENCE.md` and register §17.26, two
classifiers disagree on the same committed manifests:

| Path | File | Rule | Answer for these manifests |
|---|---|---|---|
| Assessment | `fundamentals/datasetClass.ts` → `classifyDataset` | declared rights evidence, fail-closed | **`UNKNOWN`** |
| Investment coverage | `coverage/investmentCoverage.ts` → `financialClass()` | substring test on `provider`/`licence` | **`OPERATOR_SUPPLIED`** |

Verified at head — `coverage/investmentCoverage.ts:165-170`:

```ts
function financialClass(manifest: DatasetManifest | null): 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'NONE' {
  if (manifest === null) return 'NONE';
  return /synthetic|test-fixture|fixture/i.test(`${manifest.provider} ${manifest.licence}`)
    ? 'SYNTHETIC_FIXTURE'
    : 'OPERATOR_SUPPLIED';
}
```

This is the substring test `datasetClass.ts` documents under "WHAT WAS WRONG" and removes; it has **no
fail-closed `UNKNOWN` answer at all**, and it is called at `investmentCoverage.ts:329`.

**Consequence for Stage 3.** The acceptance criterion "`/investment/coverage` lists the installed
issuers with non-NONE class (`OPERATOR_SUPPLIED`)" is evaluated on the coverage path. That path would
report `OPERATOR_SUPPLIED` for **any** dataset — including one whose rights evidence is entirely absent
— simply because its `provider` string does not contain "synthetic". **Satisfying that limb of the
acceptance criterion therefore proves nothing about rights**, and would be satisfied via the code path
WI-13 recorded as the wrong one. This record does not treat that limb as meaningful evidence until
`L-041` is adjudicated. `L-041` and `L-042` both remain **OPEN**.

---

## 11. Targeted test results

Targeted tests only, as required. **No broad or full-suite run was performed.** No test file was added
or modified.

### Run 1 — `iips-platform`: ingestion, dataset, digest, coverage, sector measurement, rights

```bash
cd iips-platform && npx tsx --test \
  tests/investment/ingestion.test.ts \
  tests/investment/dataset-identity.test.ts \
  tests/investment/dataset-schema-v2.test.ts \
  tests/investment/coverage.test.ts \
  tests/investment/investment-coverage.test.ts \
  tests/investment/w05SourceRights.test.ts \
  tests/investment/wi7ConsumerMarico.test.ts \
  tests/investment/wi8IndustrialsKec.test.ts
```

| Metric | Value |
|---|---|
| Exit code | **0** |
| tests | **155** |
| pass | **155** |
| fail | **0** |
| cancelled / skipped / todo | 0 / 0 / 0 |
| duration | 1566.1 ms |

### Run 2 — `frontend`: readiness diagnostics and sourceRights classification

```bash
cd frontend && npx vitest run \
  server/investment/iidP6aRuntimeReadiness.test.ts \
  server/investment/cli/w05SourceRightsClassification.test.ts
```

| Metric | Value |
|---|---|
| Exit code | **0** |
| Test Files | **2 passed (2)** |
| Tests | **38 passed (38)** |
| Duration | 2.11 s |

**Combined: 193 tests, 193 passed, 0 failed, both runs exit 0.**

The full `test:iid` suite comprises 53 files under `iips-platform/tests/investment/`; the eight above
were selected as the Stage 3-relevant subset (ingestion, dataset identity and digests, dataset schema,
coverage, investment coverage, source rights, and the two sector bundles). Working tree was verified
clean after both runs — `git status --porcelain` returned **0** changed files, so no committed evidence
was rewritten.

---

## 12. Readiness diagnostic findings

Run with the existing CLI, `frontend/server/investment/cli/iid-readiness.ts`
(`usage: iid-readiness [--json] [--data-dir <dir>] [--strict]`; exit 1 only when `--strict` and a
read-path dependency is outstanding). The underlying `assessIidReadiness` is documented as pure with
respect to the process: *"it reads files and environment, and returns a report. It never writes, never
opens a database, never connects to a peer, and never mutates `env`."*

### 12.1 Diagnostic A — the environment as it actually stands

`npx tsx server/investment/cli/iid-readiness.ts --json` → exit 0, **`ready: false`**, **8 findings, all
8 outstanding**:

| Finding | `configured` | `readable` | `reason` |
|---|---|---|---|
| `identity-files` | false | false | `IDENTITY_SOURCE_MISSING` (3 of 3 files absent) |
| `reports-owner-context` | false | false | `REPORTS_OWNER_CONTEXT_UNAVAILABLE` (path-not-configured) |
| `np04-assessment-store` | false | null | `DATABASE_PATH_NOT_CONFIGURED` |
| `owner-context-carrier` | false | false | `OWNER_CONTEXT_UNAVAILABLE` (path-not-configured) |
| `ipd-binding-precondition` | false | false | `BINDING_NOT_PROVISIONED` |
| `ipc-endpoint` | false | null | `ENDPOINT_NOT_RESOLVED` (`ENDPOINT_NOT_CONFIGURED`) |
| **`fundamentals-dataset`** | **false** | **false** | **`DATASET_DIRECTORY_ABSENT`** |
| `local-personal-use-enablement` | false | null | `LOCAL_PERSONAL_USE_ABSENT` |

**This is the finding Stage 3 exists to resolve, and in the real environment it remains
`DATASET_DIRECTORY_ABSENT`.** Criterion D's limb "readiness diagnostic no longer reports the
fundamentals dataset absent" is therefore **NOT met**.

### 12.2 Diagnostic B — the same diagnostic against a scratch reproduction

`npx tsx server/investment/cli/iid-readiness.ts --json --data-dir /tmp/s3/rel1/data` → exit 0,
**`ready: false`**. Exactly one finding changed:

| Finding | Diagnostic A | Diagnostic B |
|---|---|---|
| **`fundamentals-dataset`** | `DATASET_DIRECTORY_ABSENT` (`readable: false`) | **`DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED`** (`readable: null`) |
| the other 7 findings | outstanding | **unchanged — still all outstanding** |
| `ready` | false | **false** |
| `--strict` exit code | — | **1** |

Two things this establishes precisely:

1. **The flip is achievable and is a one-finding change.** Pointing the diagnostic at a directory
   containing a genuinely ingested, digest-verified dataset flips `fundamentals-dataset` and nothing
   else. So Stage 3, if authorised, would resolve exactly one of eight findings.
2. **Overall IID readiness must not be read as READY because Stage 3 succeeds.** Even with a valid
   dataset present, `ready` stays `false` and `--strict` exits 1, with **seven** dependencies
   outstanding: identity files, Reports owner context, NP04 assessment store, owner-context carrier,
   IPD binding precondition, IPC endpoint, and local-personal-use enablement. These are separate
   dependencies and are **not** addressed by this work item.

Note also `configured: false` in Diagnostic B even though a data root was supplied: `configured`
reflects the **environment variable** (`settingPresent(env, DATA_DIR_SETTING)`), not the `--data-dir`
override. A `--data-dir` override therefore silences the absence finding without making the setting
configured — a further reason the operator must set `IIPS_DATA_DIR` itself rather than rely on a flag.

### 12.3 The directory check is existence-only — confirmed in the implementation

The work item's concern that a directory-existence check is not dataset readiness is **confirmed by the
check's own text** (`frontend/server/investment/runtimeReadiness.ts`, `datasetFinding`, finding id
`fundamentals-dataset`, labelled D8 in source):

```ts
const dir = root === undefined || root.trim().length === 0 ? null : `${root}/investment/dataset`;
const present = dir !== null && existsSync(dir);
…
reason: present ? 'DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED' : 'DATASET_DIRECTORY_ABSENT',
evidence: present ? 'configured-runtime' : 'static',
requiredAction: present
  ? 'Verify the snapshot with the existing dataset reader before minting; a present directory is not a measured dataset.'
  : 'Import an operator dataset into <IIPS_DATA_DIR>/investment/dataset using the existing IID-0 ingestion path. …',
```

The check is a bare `existsSync`. It never opens the manifest, never verifies a digest and never counts
a measurement — and its own reason string says `CONTENT_UNVERIFIED`, with a `requiredAction` that states
*"a present directory is not a measured dataset."* **An empty directory would flip this finding.**

That is why this record does not treat Diagnostic B as readiness, and why no placeholder or empty
directory was created at any candidate runtime location to make the finding flip. The genuine
verification is the `readDataset` reload in §10.1, which does check digests — and that is exactly what
the finding's own `requiredAction` prescribes.

---

## 13. Reproducibility evidence

An independent party can reproduce every quantitative claim in this record from the committed
repository alone, with no network access and no runtime configuration:

| Claim | Reproduction |
|---|---|
| Bundle integrity, 121/121 digests (§3.3) | recompute sha256 of each path in each bundle's `digests.json` and compare |
| The four `datasetVersion` values (§7.2) | run the four commands in §7.1 verbatim from `iips-platform/` |
| The measurement table (§7.3) | read the `coverage` block of each command's stdout |
| The per-file output digests (§7.4) | read `manifest.json.files` in any reproduced dataset directory |
| Independent reload and classification (§10.1) | `readDataset(dir)` then `classifyDataset(manifest)` |
| Committed datasets classify `UNKNOWN` (§10.2) | `readDataset` on `REL-1-INFOSYS-2026-11-06/dataset/` and `…/dataset-v1/` |
| One-field manifest divergence (§10.3) | `diff -rq` a reproduced dataset against the committed `dataset/`, then compare manifest fields |
| Silent-zero defect (§8.2) | copy `WI7`'s `ingest-input/roster.json` + `periods.csv` to scratch, lowercase the sector string, ingest, inspect `coverage-report.json` and `issues.json` |
| Replace semantics (§9.2) | ingest the three bundles sequentially into one directory, reading `issuers.json` after each step |
| Readiness findings (§12) | `iid-readiness.ts --json` with and without `--data-dir` |
| Test totals (§11) | the two commands in §11 |

Every input used is committed and digest-verified; every `--now` value is quoted from a bundle's own
`runs/commands.txt`. The determinism guarantee is the writer's documented one (§5.3): canonical
key-sorted serialisation, with the import timestamp excluded from identity.

**One irreproducibility is recorded honestly.** `REL-1`'s *first* snapshot digest
`sha256:9be1a83e…` is **not** reproducible from the currently committed `ingest-input/`. Per
`runs/commands.txt` §1 and §6, the input itself changed between those two runs (lease liabilities were
added to the statements), so the same command now yields `sha256:ca29c835…`. The earlier state survives
only as the committed output `dataset-v1/`. **The input was mutated in place and its earlier version was
not preserved**, so `9be1a83e…` can be verified as an artifact but not regenerated. This is a genuine
limitation of the bundle's reproducibility chain, not of the ingestion code.

---

## 14. Acceptance criteria assessment

| Criterion | Verdict | Evidence |
|---|---|---|
| **A. Dataset integrity** — exists at designated runtime location; not `NONE`; readable by the existing implementation; input and output digests recorded and verified; no synthetic evidence | **NOT MET** | No designated runtime location exists or can be determined (S3-B2, §4). Nothing was installed. **The other three limbs are met and verified:** readable via the existing reader (§10.1); 121/121 bundle digests and 4/4 dataset digests verified (§3.3, §7.2); evidence is genuine Ind AS statutory filings, not synthetic (§3.2) — though the committed datasets' *class* is `UNKNOWN` (§10.2) |
| **B. Issuer/sector coverage** — actual issuers; valid issuer→sector assignments; sector spelling validated; incorrect sectors cannot silently yield misleading zeros; actual measurements produced; `measuredSectors > 0` | **NOT MET** | Sector assignments are valid and match expectations in all committed bundles (§3); real measurements are produced and `measuredSectors = 1 > 0` per bundle (§7.3). **But sector spelling is not validated and an incorrect sector does silently yield a misleading zero — demonstrated, S3-D1 (§8).** And the three-issuer population is unreachable, S3-D2 (§9) |
| **C. Measurement quality** — genuine source evidence; missing metrics stay explicitly missing; unsupported measurements reported unavailable; periods/freshness honest; limited annual history and absent quarterly data not disguised as complete; corporate-action limitations documented | **MET** (per bundle, on scratch reproductions) | Sources are issuers' own audited filings (§3.2). Missing metrics stay missing: Technology and Industrials read `metric 0%` with dependent methods **withheld** and reasons recorded, never zero-substituted (§7.3). Every unmeasured sector is listed explicitly under `outstanding` — "never silently green" (`CoverageReport` doc, `coverage/measure.ts:58`). Annual-only, no quarterly, empty corporate-action table all stated (§3.1, §5.2, §7.4). Freshness unevenness reported, not smoothed (§3.1) |
| **D. Reproducibility** — reproducible ingestion method; independent reload; independently checkable digests and measurements; readiness diagnostic no longer reports the fundamentals dataset absent | **PARTIALLY MET** | First three limbs **met**: method reproduced exactly (§7, §13); independent reload through the existing reader (§10.1); digests and measurements independently checkable (§13). **Fourth limb NOT met:** in the real environment the diagnostic still reports `DATASET_DIRECTORY_ABSENT` (§12.1). It flips only against a scratch `--data-dir` (§12.2), which is not installation |
| **E. Readiness diagnostic** — run the existing targeted diagnostic after ingestion; do not read overall IID readiness as READY; report exact remaining findings | **MET** | Existing diagnostic run, no new tooling (§12). Overall readiness explicitly **not** read as READY: `ready: false` and `--strict` exit 1 even with a valid dataset present. **Seven** remaining findings enumerated exactly (§12.2) |

**Summary: 1 of 5 met, 1 partially met, 2 not met, 1 not met.** Stage 3 acceptance is **not achieved**.

---

## 15. Limitations

1. **Nothing was installed.** No dataset exists at any runtime location after this work. The
   `fundamentals-dataset` finding remains `DATASET_DIRECTORY_ABSENT` in the real environment.
2. **No Windows-host evidence.** This session ran on Linux (§4.1). The baseline's Stage 3 evidence list
   includes "page capture (host)", which is **unavailable here and was not simulated or inferred**. No
   claim is made about the state of the operator's host, its `IIPS_DATA_DIR`, or any dataset on it.
3. **Scratch reproductions are not operational data.** All four datasets exist only under `/tmp/s3`
   (632 KB) and will not survive the session. They were never presented to any readiness check as
   satisfying it, and no readiness check was satisfied by them (§7, §12.2).
4. **One bundle digest chain is not fully reproducible** — `REL-1`'s `9be1a83e…` snapshot cannot be
   regenerated because its input was mutated in place (§13).
5. **`L-041` and `L-042` remain OPEN** and condition the acceptance criteria. `L-041` in particular
   means the coverage-side `OPERATOR_SUPPLIED` limb of Stage 3's acceptance line is currently satisfied
   by a repudiated substring test and proves nothing about rights (§10.4).
6. **S3-D1 and S3-D2 are recorded, not fixed.** Both would require implementation changes, which are
   out of scope. Neither is assigned an `L-` identifier; minting register identifiers is the owner's act.
7. **Permitted local use is UNESTABLISHED for all three candidates** (§6.4). No bundle records an
   operator determination, and the mechanism that would record it is the missing O3 decision.
8. **Corporate actions, prices and operating metrics ingest empty** from all three candidate bundles
   (§5.2, §7.4). Stage 3 *Remaining* item 4 (operator entry of operating metrics for target sectors)
   and the baseline's note that "Capital Markets/Telecom/Banking are blocked until someone transcribes
   their metrics" are unaffected by this work and remain outstanding.
9. **Stage 1's eight outstanding findings are not revisited.** Stage 3 addresses dataset readiness
   only; the other seven readiness dependencies are enumerated in §12 but not investigated.
10. **Volatile values are observation-bound.** Every readiness output, exit code, test total and digest
    in this record was observed on 2026-11-13 (UTC) at head `7c25bc49…`. Repository state such as PR
    merge state or CI status is not asserted here as standing fact.

---

## 16. Boundary confirmations

| Boundary | Confirmation |
|---|---|
| **IPD** | **Not accessed, not modified, not contacted.** No IPD read, write, binding or provisioning. No IPC peer configured or contacted. Verified: no IPD remote was invoked; all commands ran against the local IRR checkout and `/tmp`. |
| **IID Stage 2** | **Not started.** No identity readiness work. No identity file created, staged or modified. The `identity-files` finding remains `IDENTITY_SOURCE_MISSING` (§12.1). Stage 3's independence from Stage 2 (baseline §21) was respected in both directions. |
| **Production** | **No production work.** This is a local, single-user, non-production repository; nothing here provisions, deploys or configures a production system. |
| **Implementation** | **Zero changes.** No source, test, configuration, dependency or policy file was created, edited or deleted. `git status --porcelain` returned **0** changed files after every test run and every ingestion. No implementation was widened or altered to make any criterion pass. |
| **Runtime data in Git** | **None committed.** All ingestion output went to `/tmp/s3`, outside the working tree. No `.iips-data` directory was created. No dataset, and no source evidence bundle, is added to Git by this work. |
| **Existing runtime data** | **None existed; none overwritten.** No dataset was present at any resolved runtime location (§4.4). The committed evidence datasets `REL-1/dataset/` and `REL-1/dataset-v1/` were **read only** and verify unchanged (§10.2). The §9.2 overwrite demonstration ran entirely in a fresh `/tmp` directory. |
| **Placeholder datasets** | **None created.** No empty or placeholder dataset was written to any candidate runtime location to make the readiness finding flip (§12.3). |
| **Synthetic data / invented metrics** | **None.** No value was fabricated, substituted or invented. The only mutation performed was the deliberate single-string defect probe in §8, applied to a **scratch copy**, disclosed in full, and producing no accepted result. |
| **Identity records** | **None hand-authored.** No combined three-issuer `roster.json` or merged `periods.csv` was created (§9.4). |
| **Reports owner context / NP04** | **Unchanged.** Neither `reports-owner-context` nor `np04-assessment-store` configuration was touched; both remain unconfigured (§12.1). |
| **Unrelated workstreams** | **Untouched.** No other IIPS workstream, document or evidence bundle was modified. Protected evidence (CPII-01, P6A, the 2026-11-10 separation record, the 2026-11-11 assessment) was not altered. |
| **Branch / PR** | **No new branch, no new PR.** Publication follows existing authority: this record is committed to the existing branch `arena/94a53bb3-iips-review-recovered`. No PR was created, and no PR metadata, title, body, merge state or label was changed. Nothing was merged or closed. |
| **Test scope** | **Targeted only.** 8 platform test files and 2 frontend test files (§11). No broad or full-suite run. No destructive run. |

---

## 17. Operator decisions required

Stage 3 can proceed as soon as these are answered. Each is stated as the precise act required, with the
evidence that makes it necessary.

### S3-B1 — decide O3 (the blocking prerequisite)

**Required act:** record an explicit O3 decision — *admit all three* (Infosys, Marico, KEC) /
*admit a subset* (which) / *reject* — as a dated operator decision in the repository, together with the
permitted-local-use determination that O3 carries (§6.4).

**Why only the operator can do this:** baseline §28 — "Only the owner can accept 'real but thin' as fit
for local personal use; the system will forever label it honestly, but **acceptance is a judgement**",
and "'Recommended' is this investigation's recommendation, **never a pre-approval**."

**If deferred:** baseline §28 — "nothing to assess or measure; INVESTMENT page stays NONE; cohort work
(R-16) cannot start on real data."

**Note:** running the CLI does not discharge O3. It records an `OPERATOR_ASSERTED` attestation, which is
explicitly "not an independent verification of any third party's terms" (§5.3).

### S3-B2 — designate the runtime data directory

**Required act:** set `IIPS_DATA_DIR` to one absolute path, in the environment the IID read path
actually runs in, and record that path.

**Why it is ambiguous today:** the committed references conflict — `~/.iips-data`
(`OPERATOR_RUNBOOK.md:68`), `<cwd>/.iips-data` (`:76`, and the implementation fallback),
`$PWD/frontend/.iips-data` (`:379/403/419`), and the `.env.example:49` placeholder. With the variable
unset, the implementation silently resolves to a **working-directory-relative** path whose value
depends on where the command is run (§4.3).

**If deferred:** criterion A cannot be evaluated; the `fundamentals-dataset` finding stays
`DATASET_DIRECTORY_ABSENT`; and any future ingestion risks writing runtime data inside the repository
tree.

### S3-B3 — decide where Stage 3 is executed

**Required act:** confirm whether Stage 3 installation is to be performed on the operator's Windows host
(as the baseline's evidence list implies: "page capture (host)") or in another environment, and provide
that environment's `IIPS_DATA_DIR`.

**Why:** this session cannot reach the host (§4.1). Host-only evidence is recorded as unavailable, not
inferred.

### S3-D2 — decide the three-issuer question

**Required act:** choose one of —
(a) accept a **single-issuer** dataset as satisfying Stage 3's *Objective* ("at least one real,
digest-verified operator dataset"), and treat the three-sector *Acceptance* line as belonging to Stage 4;
(b) authorise the construction of a **combined three-issuer input bundle** as its own governed work
item, with its own digests recorded before ingestion; or
(c) authorise an **implementation change** adding a merge or multi-input mode, as its own work item.

**Why:** the existing CLI reads one `roster.json` from one `--input` directory and fully replaces the
target dataset (§9.1, §9.3). Options (b) and (c) are both outside this work item's authority. The
baseline's own Stage 3 text is internally inconsistent here — its *Remaining* item 2 describes
single-bundle installation while its *Acceptance* line requires three measured sectors (§9.4).

### S3-D1 — decide the sector-validation defect

**Required act:** decide whether to mint a limitation-register entry for S3-D1 and whether to require a
runtime sector guard in `loadInputs`, under the owner's L-series discipline.

**Why:** it fails silently in the direction that looks like success (§8.3), and it defeats criterion B.
This record deliberately did not fix it.

### Route choice — recorded for completeness

If O3 admits the Infosys data, note that the two installation routes the baseline offers are **not
equivalent**: installing the committed `REL-1/dataset/` yields class `UNKNOWN`, while rebuilding from
`ingest-input/` yields `OPERATOR_SUPPLIED` (§10.3). Only the rebuild satisfies the baseline's
"non-NONE class (`OPERATOR_SUPPLIED`)" acceptance line — and that line is itself conditioned on the
open `L-041` divergence (§10.4).

---

## 18. Next IID roadmap step

**Not started, and not recommended for start by this record.** The next step depends entirely on the
operator's answers to §17:

- **If O3 is admitted and S3-B2/S3-B3 are answered**, Stage 3 can be completed by a single authorised
  invocation per §7.1 into the designated directory, followed by the §10.1 reload verification and the
  §12 diagnostic. That resolves **one** of eight readiness findings. The three-sector question (S3-D2)
  must be answered first if the *Acceptance* line is to be met rather than the *Objective*.
- **If O3 is deferred or rejected**, Stage 3 stays blocked, and per baseline §28 the INVESTMENT surface
  correctly continues to report `NONE`.
- **Stage 4 (Coverage readiness)** depends on Stage 3 and cannot start on installed data until a dataset
  is installed. It is *not* the next step.
- **Stage 2 (Identity readiness)** remains independent of Stage 3 and remains unstarted; it has its own
  prerequisite (O1). Nothing in this record advances it.

The seven readiness dependencies that survive a successful Stage 3 — identity files, Reports owner
context, NP04 assessment store, owner-context carrier, IPD binding precondition, IPC endpoint, and
local-personal-use enablement — are separate dependencies with separate owners and separate decisions
(§12.2). **Overall IID readiness is not READY, and Stage 3 success would not make it so.**

---

*End of record.*
