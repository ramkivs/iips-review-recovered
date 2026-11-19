# W05 — Scripted Execution Runbook (revision-1 reconciliation and evidence completion)

**Status:** IN PROGRESS — NOT ACCEPTED. Execution support. The Principal retains acceptance
authority; nothing in this runbook accepts W05.
**Date:** 2026-11-18 (same work item as the revision-1 derivations; keys remain 2026-11-18).
**Audience:** the Windows host operator (steps 1–4), the IRR review side (steps 3, 5–7), the
Principal (step 6 and acceptance).
**Companion record:** `docs/integration/W05-F1-F2-DECISION-SUPPORT-2026-11-18.md` (step 6 evidence).

This runbook converts the seven-step execution plan into a script-supported workflow. Every
automatable activity has a script or CLI; every manual activity says exactly what the operator
must do and record. Nothing here invents endpoints, paths or interfaces: the routes, the bundle
shape, the evidence fields and the dataset reader are taken from the repository code and the
established Windows procedures, and each says so where it is used.

---

## 0. Conventions

* **Invocation.** `RepoRoot` is a checkout of `ramkivs/iips-review-recovered`; `BaseUrl` is the
  operator-run transport host (the scripts never assume a port); `AsOf` is `YYYY-MM-DD`.
* **Result objects.** Every PowerShell script emits exactly one result object on the output
  stream (`$r = .\script.ps1 ...; $r.Result`). `Result` is `OK`, `FAILED-VALIDATION`,
  `CAPTURED-UNAVAILABLE` or `FAILED-EXCEPTION`. Nothing writes to the host console and nothing
  exits the session — work, evidence and terminal state are preserved.
* **PowerShell rules.** All new scripts in this work item obey the mandatory rules: no
  `else`/`elseif`/`switch`/`exit`/`return`/`finally`, no aliases, no `Invoke-Expression`, no
  `Write-Host`; explicit named parameters with input validation; the `$OK` success gate;
  bounded timeouts with immediate native-command exit-code inspection (including git). Verified
  by `iips-platform/tests/investment/w05PowerShellRules.test.ts` (in-repo static scan,
  comment/string-aware, non-vacuous) and `tools/windows/W05-SCRIPTS.Tests.ps1` (Pester 5,
  Windows).
* **Evidence.** Host evidence (operator directory) and Arena/Linux evidence (committed
  repository records) stay distinct; agreement is asserted only through shared SHA-256 digests.
  Every script validates before mutating and re-hashes independently.
* **TS layer invocation** follows the established IID-STAGE3 Windows pattern:
  `node node_modules\tsx\dist\cli.mjs <script>.ts` from `iips-platform\`.

Run the in-repo suites at any time (Linux/CI side):

```
cd iips-platform
npm run typecheck
npx tsx --test tests/investment/w05ReconciliationDriver.test.ts tests/investment/w05EvidenceCompleteness.test.ts tests/investment/w05PowerShellRules.test.ts
```

Windows host: `Invoke-Pester -Path tools\windows\W05-SCRIPTS.Tests.ps1 -Output Detailed`.

---

## 1. Step 1 — capture the actual revision-1 identities-route response

**Script:** `tools/windows/W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1`

```powershell
$r = .\W05-STEP1-CAPTURE-REVISION1-IDENTITIES.ps1 `
  -RepoRoot C:\iips\iips-review-recovered `
  -BaseUrl http://<transport-host> `
  -AsOf 2026-09-15 `
  -OutDir C:\iips\w05\bundle
$r.Result
```

What it does: `GET <BaseUrl>/api/investment/coverage?asOf=<AsOf>` (the identities route from
`coverageEndpoint.ts` COVERAGE_ROUTES) and preserves the response verbatim; records the
transport commit (`git rev-parse HEAD` under a bounded timeout, exit code inspected) and tree
state; extracts all rows with their stored security identities; records the listing-map /
corporate-action / roster versions and the roster label from `identitySources`, plus
`asOf`/`generatedAt`; validates the row count and the five-category disposition counts against
the W04 record (64 rows: QUALIFIED 1, AMBIGUOUS 0, MISSING_OR_UNRESOLVED 63,
EXPIRED_OR_INELIGIBLE 0, UNAVAILABLE 0 — tracker record, overridable by
`-Expected*` parameters when the operator holds a different record); and writes the evidence
bundle with digests.

**Categories are never invented.** The five-category census vocabulary is governance-side. A
row's `category` comes from its stored `raw.category` when it is one of the five values, else
from an operator-supplied `-CategoryMapFile` (`holdingId -> category` JSON), else the row is
flagged and the capture fails validation.

**Outputs** (in `-OutDir`): `identities-route-response.json` (verbatim, whatever the status),
`census-rows.json` (the harness rows interface), `provenance.json` (route, asOf, generatedAt,
source versions, roster label, transport commit, counts), `w04-census-expected.json`,
`input-digests.json`, `capture-report.json`.

**Manual notes.** The operator chooses `AsOf` from the intended census as-of date and confirms
the transport host is running the revision-1 identities material. A `CAPTURED-UNAVAILABLE`
result (the documented 503 payload) is preserved as evidence of that state — it is **not** an
input bundle, and the 68-row Dhan CSV must not be substituted for the 64 persisted revision-1
holdings at any point.

## 2. Step 2 — run the reconciliation over the captured bundle

**Driver:** `iips-platform/src/investment/cli/run-census-reconciliation.ts` (PR #600 merge
dependency — it runs `runCensusReconciliation` from `censusReconciliation.ts` verbatim).
**Wrapper:** `tools/windows/W05-STEP2-RUN-RECONCILIATION.ps1`

```powershell
$r = .\W05-STEP2-RUN-RECONCILIATION.ps1 `
  -RepoRoot C:\iips\iips-review-recovered `
  -BundleDir C:\iips\w05\bundle `
  -OutDir C:\iips\w05\reconciliation `
  -ExpectCount 64
$r.Result
```

Direct CLI invocation (equivalent):

```
node node_modules\tsx\dist\cli.mjs src\investment\cli\run-census-reconciliation.ts ^
  C:\iips\w05\bundle --out C:\iips\w05\reconciliation --expect-count 64
```

The wrapper validates the bundle first (files present; every entry of `input-digests.json`
re-hashed independently), invokes the driver with a bounded timeout, records the driver exit
code verbatim (0 ok; 1 validation refusal with nothing written outside `--out`; 2 unreadable
bundle), then re-hashes every published output against `output-digests.json`.

**Driver semantics** (all validated before the harness runs): rows are consumed verbatim
(holdingId unique; every field typed; category in the five-value enum); a file listed in
`input-digests.json` that no longer matches stops the run; `w04-census-expected.json` makes the
census-count comparison strict — a mismatch stops the run and is itself the reconciliation
finding; the installed identity sources are required (fail closed — no fallback roster, no
fallback dataset, no `UNAVAILABLE` qualification); candidate datasets under `datasets/` are read
with the product's own reader (`tryCatalogEntryFromDatasetDir`) and a broken dataset is refused
by name; `eligible-set.json` (basis + exclusions) is applied when present.

**Outputs** (in `-OutDir`): `reconciliation-result.json` (envelope: provenance verbatim +
`CensusReconciliationResult`), `reconciliation-summary.txt`, `holding-level.tsv` (one line per
holding: identifiers, quantity, category, storedSecurityIdentity, disposition, resolutionBasis,
issuerId, states, ratio contribution, agreement), `disagreements.json` (every
census-vs-run disagreement, including the D2 identity-resolution case as a disclosed finding),
`output-digests.json`, `run-report.json`. The harness headline binds: this is a per-holding
reconciliation; no revision-1 coverage figure is asserted (rule (b)).

## 3. Step 3 — inspect, verify and publish the evidence

**Script:** `tools/windows/W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1`

```powershell
$r = .\W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1 `
  -RepoRoot C:\iips\iips-review-recovered `
  -OutDir C:\iips\w05\reconciliation `
  -ExpectedRows 64
$r.Result
```

It independently re-hashes every published output, cross-checks the holding-level table,
disagreement list and summary against the result envelope, and itemises each disagreement.

**Operator inspection (manual, required):** open `holding-level.tsv` and `disagreements.json`
and review every one of the 64 lines and every disagreement, including the D2 case. Record the
review as `disagreements-reviewed.json` in the evidence directory:

```json
{ "reviewed": [ { "holdingId": "...", "disposition": "...", "note": "..." } ] }
```

**Publication and remote verification (IRR side, per the repository-ownership restrictions).**
The IRR review side copies the reviewed evidence record into the committed integration evidence
path on the working branch (the same branch as PR #600; no new PR, existing dependencies
preserved). Then verify the published artifacts:

```powershell
$r = .\W05-STEP3-VERIFY-RECONCILIATION-EVIDENCE.ps1 `
  -RepoRoot C:\iips\iips-review-recovered `
  -OutDir C:\iips\w05\reconciliation -ExpectedRows 64 `
  -PublishedRef origin/arena/9852cfbf-iips-review-recovered `
  -PublishedPath evidence/integration/w05-w04-reconciliation-2026-11-18/actual
$r.Result
```

Remote comparison uses git's own blob hashes (`git rev-parse <ref>:<path>` against
`git hash-object <local>`) — exact and encoding-proof — under bounded timeouts.

## 4. Step 4 — provisioning, D1/entitlement/retention evidence, host coverage

**Manual first (the standing placement constraint):** progressive issuer provisioning is a
sequence of operator actions with the product's own tooling
(`provision-identity.ts` / `install-verified-dataset.ts` per the established procedure), one
issuer at a time, each with its authorization record. The operator must **assess the source
terms for each statement source manually** (no automated or bulk retrieval): read the source's
terms of use, record whether manual local retrieval for personal analysis is permitted, and
record whether local retention is permitted. Record the verdicts explicitly; a source whose
terms cannot be established is `UNKNOWN` — fail closed, never eligible. No redistribution
authorization may be inferred from source availability.

**D1 acquisition evidence + rights verdicts:**
`tools/windows/W05-STEP4-D1-EVIDENCE-CHECK.ps1`

```powershell
$r = .\W05-STEP4-D1-EVIDENCE-CHECK.ps1 `
  -RepoRoot C:\iips\iips-review-recovered `
  -PackageDir C:\iips\w05\d1 `
  [-BundleDir C:\iips\w05\d1\deep-page-bundle]   # optional: the repository checker re-runs on it
$r.Result
```

Input `rights-evidence.json` (array, one record per source; fields fixed by the D1 register):
`sourceId`, `source`, `locator`, `documentIdentity`, `documentPeriod`, `filingDate` and
`approvalDate` (nullable but always present), `retrievalDate`, `retrievalChannel`,
`byteLength`, `pdfPageCount`, `sha256`, `entitlementStatus` + `entitlementBasis`,
`retentionStatus` + `retentionBasis` (statuses: `ELIGIBLE_LOCAL_PERSONAL_USE`, `RESTRICTED`,
`UNKNOWN`). Outputs: `d1-evidence-report.json` (machine-readable verdicts),
`dossier-update-section.md` (the fragment the IRR side folds into
`W05-ACTUAL-DOSSIER-2026-11-18.md`), `output-digests.json`. A source is `VERIFIED` only when
both entitlement and retention are explicit and based; anything else stays `NOT VERIFIED` and
the coverage consequence stands (rule (a)).

**Host coverage captures (both routes, R-2):**
`tools/windows/W05-STEP4-CAPTURE-HOST-COVERAGE.ps1`

```powershell
$r = .\W05-STEP4-CAPTURE-HOST-COVERAGE.ps1 `
  -BaseUrl http://<transport-host> -AsOf 2026-09-15 `
  -OutDir C:\iips\w05\host-coverage
$r.Result
```

Captures `GET /api/investment/coverage/investment?asOf=…` and
`GET /api/investment/coverage?asOf=…` verbatim with status, body SHA-256 and structural shape
validation (report shape or documented error payload). Content expectations are compared
against `coverageEndpoint.ts` on the IRR side; 503/400 payloads are captured as evidence and
recorded as not-a-successful-capture.

## 5. Step 5 — the required-metric set

The required-metric set is established only by W10 (separate work item). Two acceptable states:

1. **Provisional (current).** `PROVISIONAL_PENDING_W10` remains in
   `iips-platform/src/investment/lifecycle/qualification.ts`; the completeness checker
   (step 7) verifies the marker is preserved and records the condition as satisfied-as-provisional.
   No metric is presented as established.
2. **Established.** Once W10 records the set, drop `w10/required-metric-set.json`
   (`{"status":"ESTABLISHED", ...}`) into the evidence root; the checker records the condition
   as satisfied.

Until one of these holds with evidence, the condition stays `PENDING`/`UNRESOLVED` in the
review package — never silently satisfied.

## 6. Step 6 — Principal decision records (F1, F2)

Decision fields (both records; template and evidence in
`W05-F1-F2-DECISION-SUPPORT-2026-11-18.md`):

| field | meaning |
|---|---|
| `id` | `F1` or `F2` |
| `decision` | the decision taken (per-record options listed in the support document) |
| `decidedBy` | the Principal (never inferred) |
| `decidedAt` | date |
| `basis` | the evidence and reasoning the decision rests on |

F1 = repository publication of the not-freely-redistributable W05 source material. F2 =
financial-statement source selection. Both are open; both must be recorded (or explicitly
risk-accepted) before W05 acceptance. Record them as
`decisions/F1-repository-publication.json` and `decisions/F2-statement-source.json` in the
evidence root.

## 7. Step 7 — evidence completeness and the final review package

**CLI:** `iips-platform/src/investment/cli/w05-evidence-completeness.ts`

```
node node_modules\tsx\dist\cli.mjs src\investment\cli\w05-evidence-completeness.ts ^
  C:\iips\w05\evidence-root --out C:\iips\w05\review-package.json --repo-root <checkout>
```

Evidence-root layout (assembled from the steps above):

```
evidence-root/
  reconciliation/     reconciliation-result.json, reconciliation-summary.txt, holding-level.tsv,
                      disagreements.json, disagreements-reviewed.json, output-digests.json
  rights/             expected-sources.json, rights-verdicts.json
  host-coverage/      capture-investment.json (+ body), capture-identity.json (+ body)
  decisions/          F1-repository-publication.json, F2-statement-source.json
  acceptance/         w05-acceptance.json          (Principal only)
  w10/                required-metric-set.json     (only once W10 establishes it)
  theta-f/            observed-evidence.json       (only if θF is asserted)
```

The checker evaluates every W05 acceptance condition from these machine-readable artifacts —
the 64-row reconciliation with reviewed disagreements (a run over any other census can never
satisfy it), entitlement **and** retention verified per source, both host coverage captures,
the required-metric set established or explicitly provisional, θF honestly unset or
observed-evidence-asserted (it gates W20 only), both Principal decisions, the dossier complete,
and the acceptance decision itself. Exit codes: 0 all conditions `SATISFIED`; 1 otherwise; 2
unreadable root. The package shows each condition as satisfied / pending / unresolved / blocked
and states that **the Principal retains acceptance authority** — the checker reports; it never
accepts.

**Final review package.** `review-package.json` (plus the printed table) is the W05 review
package. W05 remains IN PROGRESS — NOT ACCEPTED until every condition is `SATISFIED` and the
Principal records `acceptance/w05-acceptance.json`.

---

## 8. Rule compliance and tests — results

| check | where | result |
|---|---|---|
| PS rules (static, comment/string-aware, non-vacuous) | `w05PowerShellRules.test.ts` | 6/6 passing; all 7 new PS files clean |
| Driver validation/refusals/exit codes/repeatability | `w05ReconciliationDriver.test.ts` | 9/9 passing |
| Completeness checker + anti-substitution + provisional marker | `w05EvidenceCompleteness.test.ts` | 5/5 passing |
| Pester behavioural suite (parameter contracts, refusals, `$OK` gate, bounded timeouts, exit-code inspection, rule scan) | `W05-SCRIPTS.Tests.ps1` | written for the Windows host (no PowerShell engine in the build environment; the in-repo static scan is the machine check available here) |

Known limits: the Windows-host scripts are delivered finished with exact invocations, but their
Pester suite runs on the Windows host only; the actual 64-row run remains operator-supplied
(external to the repository), as do the manual source-term assessments and the Principal
decisions.
