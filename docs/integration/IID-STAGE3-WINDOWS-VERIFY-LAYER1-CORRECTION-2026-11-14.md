# IID Stage 3 — Windows verification Layer 1: diagnosis and correction of three contradictory checks

**Work item:** diagnose and correct the three failing PowerShell Layer 1 checks in
`tools/windows/IID-STAGE3-WINDOWS-VERIFY.ps1`.
**Branch:** `arena/94a53bb3-iips-review-recovered`
**Corrected commit:** `0a564cdb64a3504f1c62987bfed5233105e7cc46`
**Observed clock:** `2026-11-14T03:17:58Z`
**Operator's Windows run:** `2026-11-14T08:24:53+05:30`, Windows PowerShell `5.1.26100.9818` (Desktop)
**Dataset:** `C:\iips-data\investment\dataset`, `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`
— **not modified, not reinstalled, not repaired by this work item.**

---

## 1. The contradiction as reported

| Check | Layer 1 (PowerShell) | Layer 2 (product reader + coverage API) | Truth |
|---|---:|---:|---:|
| `issuer-count` | 1 | 3 | **3** |
| `nine-annual-periods` | 1 of 1 | 9 | **9** |
| `dataset-issues-empty` | 1 | 0 | **0** |

Layer 2 passed 32/32 and the harness exited 0. Layer 1's *own* neighbouring checks contradicted its counts in
the same run: `issuer-ids` found all three admitted CINs, `three-distinct-sectors` found all three sectors, and
`provenance-entries` counted three `manifest.inputs`. The overall result was `FAIL-LAYER1`, 58 passed / 3 failed.

So the dataset was never in doubt. The question was which layer was lying, and why.

---

## 2. Root cause

**One construct, three manifestations:**

```powershell
$issuers = @(Get-Content -LiteralPath … 'issuers.json' -Raw | ConvertFrom-Json)
$periods = @(Get-Content -LiteralPath … 'periods.json' -Raw | ConvertFrom-Json)
$issues  = @(Get-Content -LiteralPath … 'issues.json'  -Raw | ConvertFrom-Json)
```

Windows PowerShell 5.1's `ConvertFrom-Json` emits a **top-level JSON array as ONE object**. The array
subexpression `@( … )` collects what the pipeline emits, so each variable became a **one-element array whose
single element was the entire collection**. `.Count` therefore reported `1` whatever the document held.

The three documents Layer 1 parses this way are, on the real installed dataset:

| File | Top-level shape | Elements | `.Count` reported |
|---|---|---:|---:|
| `issuers.json` | JSON array | 3 | 1 |
| `periods.json` | JSON array | 9 | 1 |
| `issues.json` | JSON array (`[]`, 3 bytes) | 0 | 1 |

### 2.1 The evidence that pins it, from the operator's own output

The report contains one line that is decisive on its own:

```
[PASS] [ps] issuer-sector-assignment
         Infosys Limited; Marico Limited; KEC International Limited;  -> ; Technology; Consumer; Industrials
```

That check computes `$pairs = @($issuers | ForEach-Object { $_.legalName + ' -> ' + $_.sector })` and joins with
`; `. A correct parse yields three strings. The observed output is **seven** elements joined: three legal names,
then a bare `' -> '`, then three sectors. That is exactly what `$_.legalName + ' -> ' + $_.sector` produces when
`$_` is not one issuer but the **whole collection** — because `+` between two arrays *concatenates* rather than
joining strings, and `$_.legalName` on a collection *member-enumerates* to all three names.

So `ForEach-Object` ran **once**, over one item, and that item was the array of three issuers. Combined with
`$issuers.Count == 1`, `$issuers` is a one-element array wrapping the collection. Everything else follows:

* `issuer-ids` and `three-distinct-sectors` **passed for the wrong reason** — `$_.issuerId` on the wrapped
  collection member-enumerates to all three ids, so the right answer came out of a broken parse.
* `nine-annual-periods` reported "1 of 1": `Where-Object { $_.period.periodType -ceq 'ANNUAL' }` received the
  wrapped collection, `$_.period.periodType` member-enumerated to nine strings, and `-ceq` applied to a
  collection is a **filter**, not a comparison — it returned nine matches, which is truthy, so the one wrapped
  item was kept. Count 1.
* `no-quarterly-periods` **passed for the wrong reason**: the same filter found no `'QUARTER'`, returned an
  empty collection, which is falsy, so the wrapped item was dropped and the count came out `0` — the expected
  answer. A passing check was therefore not evidence of a correct parse.
* `dataset-issues-empty` reported 1 for `issues.json`, whose entire content is `[]`.

### 2.2 Correlation across the whole script, in both directions

Every `@( … )` site in the script was enumerated and classified against the operator's results:

All **51** `@( … )` occurrences in the pre-correction script's executable code (comments stripped) were
classified by what the subexpression wraps:

| `@( … )` wraps | Sites | Result in the operator's run |
|---|---:|---|
| a pipeline ending in **`ConvertFrom-Json`** | **3** (lines 258, 277, 285) | **all three FAILED** |
| a pipeline ending in `Where-Object` | 17 | all correct (`58 passed / 3 failed` split by layer, `$onDisk`, `$extra`, `$missing`, `$foundIds`, …) |
| a pipeline ending in `ForEach-Object` | 4 | all correct |
| a pipeline ending in `Sort-Object` | 2 | all correct (`$foundSectors`, `$wantedSectors`) |
| a variable or property, no pipeline (`@($script:Manifest.inputs)`, `@($coverage.completedMeasurements)`) | 4 | all correct (3 provenance entries, 3 measured sectors) |
| a literal (`@('Technology', …)`, `@()`, the `param` defaults) | 21 | n/a |

Three sites, three failures, no exceptions in either direction: every `@( … )` that wrapped a `ConvertFrom-Json`
pipeline failed, and nothing else did. An AST-exact search (the tree-sitter PowerShell
parser used for the R1–R8 validation, node type `array_expression`) confirms the same count: **3 matching nodes
in `0a564cdb`, 0 in the corrected script.** The search must be AST-based: the corrected script *documents* the
defective construct in a comment, and a textual search reports that prose as a defect.

### 2.3 The `issues.json` case is over-determined — and that matters for the fix

`[]` can yield `1` by **two** distinct 5.1 behaviours, and the operator's output cannot distinguish them:

1. the same wrapping described above — a wrapped empty collection is still one element;
2. `ConvertFrom-Json '[]'` handing back `$null`, and `@($null)` holding **one** element (the classic trap).

The correction therefore had to be right under both. That is why the fix is not `@($parsed)`: that repairs (1)
and **still returns 1** under (2). `foreach` returns 0 under both.

### 2.4 Diagnosis corroborated by construction

No PowerShell engine exists in this environment (§5). To avoid asserting a mechanism I could not run, the
semantics of the eight constructs involved were modelled and then **tested against the operator's real console
output**. The model reproduces **7 of 7** Layer-1 detail strings **exactly** — including all three failures, the
`no-quarterly-periods` string that passed for the wrong reason, and the malformed seven-element
`issuer-sector-assignment` string, character for character. The same model over the corrected expressions yields
3 issuers, 9 annual periods, 0 issues, and a well-formed three-pair detail string.

The model is a diagnostic, held outside the repository (`/tmp/pscheck/ps51-semantics-model.py`,
`ps51-regression-model.py`): it models PowerShell, it is not PowerShell, and committing it could invite mistaking
it for a test of the real thing. Its outputs are quoted here so they can be checked line by line against the
operator's console output.

---

## 3. The correction

### 3.1 The construct

Each of the three sites now assigns the parse result and enumerates the **variable**:

```powershell
$issuerJson = Get-Content -LiteralPath (Join-Path $script:TargetFull 'issuers.json') -Raw | ConvertFrom-Json
$issuers = @()
foreach ($issuer in $issuerJson) { $issuers += $issuer }
```

`foreach` yields **0 iterations for `$null`, 1 for a scalar, N for a collection**, so this is correct under
either pipeline semantics and for `[]` under either 5.1 behaviour (§2.3).

Every construct in the correction is one **this script already used correctly in the very run that exposed the
defect**, which is the strongest available evidence in the absence of an engine:

| Construct | Where the operator's run already proved it |
|---|---|
| plain assignment from a `ConvertFrom-Json` pipeline | `$script:Manifest` parsed; its 8 `files`, 3 `inputs` and `sourceRights` were all read correctly |
| `foreach` over a variable holding a collection | `foreach ($entry in $inputs)` → 3 bundle names; `foreach ($check in $parsed.checks)` → all 32 harness checks re-emitted |
| `@()` plus `+=` accumulation | `$harnessArgs += @('--expect-…', …)` built the 41-element argv printed in the report |
| `.Count` on a plain array | `$onDisk.Count` → 10 files; `$declared.Count` → 8 |
| pipeline enumeration of a collection variable | `@($script:Checks | Where-Object …)` → 58 passed / 3 failed, correctly split by layer |

### 3.2 One check strengthened, because it passed on malformed output

`issuer-sector-assignment` asserted only `$issuers.Count -gt 0`. It reported **PASS** while printing the
seven-element string that proved the parse was broken. It now asserts the pairing itself:

```powershell
$unpaired = @($pairs | Where-Object { $_ -notmatch '^.+ -> .+$' })
Add-Check -Id 'issuer-sector-assignment' `
  -Ok ($issuers.Count -gt 0 -and $pairs.Count -eq $issuers.Count -and $unpaired.Count -eq 0) `
  -Detail (… + '; ' + $pairs.Count.ToString() + ' pair(s), one per issuer, each naming both sides; malformed: ' + …)
```

Under the defect this yields 7 pairs against 1 issuer and 5 malformed entries, so it fails. Corrected, it yields
`Infosys Limited -> Technology; Marico Limited -> Consumer; KEC International Limited -> Industrials; 3 pair(s),
one per issuer, each naming both sides; malformed: 0`.

### 3.3 One check added, so the defect class is named rather than mis-counted

A wrapped collection reports a plausible `.Count` **and** still member-enumerates, which is why this survived
beside passing checks. `parsed-collection-shape` asserts the shape directly — every element of each parsed
collection is a record, never another collection:

```powershell
$wrapped = @()
foreach ($element in $issuers) { if ($element -is [System.Array]) { $wrapped += 'issuers.json' } }
foreach ($element in $periods) { if ($element -is [System.Array]) { $wrapped += 'periods.json' } }
foreach ($element in $issues) { if ($element -is [System.Array]) { $wrapped += 'issues.json' } }
Add-Check -Id 'parsed-collection-shape' -Ok ($wrapped.Count -eq 0) -Detail …
```

Layer 1 therefore goes from **23 checks to 24**. On the real dataset it reports
`elements parsed: issuers=3, periods=9, issues=0; wrapped in another collection:` (none).

### 3.4 What was deliberately NOT changed

* **Layer 2 and the product verifier are untouched.** `verify-installed-dataset.ts` and its 32 checks are
  byte-identical; the defect was entirely in the PowerShell layer. Nothing was weakened to make the layers agree.
* **No check was removed, and no expectation was replaced by a hardcoded result.** All 23 original Layer-1 check
  ids are present, and `issuer-count`, `nine-annual-periods` and `dataset-issues-empty` still compare a measured
  count against `$ExpectedIssuers` / `$ExpectedAnnualPeriods` / `0`. Tests assert this.
* **Digest and file-integrity verification is untouched** — `Get-FileHash` re-hashing of all 8 declared files,
  the `datasetVersion`/`contentDigest` identity, the expected combined digest, exact directory contents. These
  all passed in the operator's run and were correct.
* **The two-layer separation is untouched.** Layer 1 still parses the documents and re-hashes the files itself;
  it never reads `$parsed.checks`, and the only reference to `$script:HarnessReport` before Layer 2 runs is its
  `= $null` initialisation. Tests assert both.
* **`IID-STAGE3-WINDOWS-INSTALL.ps1` is unmodified.** It contains **zero** `ConvertFrom-Json` calls — it parses
  the writer's stdout with `-match` — so the defect cannot occur there. The operator's successful install
  corroborates that.
* **The installed dataset, its manifest and its coverage report were not touched**, and no marker was resolved.

---

## 4. Regression tests

### 4.1 Executed in Arena — `iips-platform/tests/investment/windowsVerifyScript.test.ts` (new, 17 tests, 17 pass)

Runs in `npm run test:iid`, so CI enforces it. Three groups:

* **The document shapes Layer 1's counts depend on** (5 tests). Builds a real dataset with the real writer from
  the real admitted bundles and asserts `issuers.json` is a top-level array of 3 objects each exposing
  `issuerId`/`legalName`/`sector`; `periods.json` a top-level array of 9 each with `period.periodType`
  `ANNUAL`; `issues.json` a top-level array of 0 whose verbatim text is `[]`; `manifest.json` and
  `coverage-report.json` top-level **objects** with `inputs` an array of 3 — which is why they need no
  unwrapping. If the writer's document shapes ever change, this fails here instead of mis-counting on a host.
* **The defect is absent from executable code** (5 tests). A comment-aware detector finds zero defective lines;
  all three sites use assign-then-`foreach`; each assignment stays on one line (which the detector relies on);
  the manifest, coverage report and harness report are still assigned plainly. **Proven non-vacuous**: the
  detector fires on the exact pre-correction line, and does *not* fire on the prose that documents the trap.
* **Checks corrected, not removed or weakened** (7 tests). All 23 original ids plus the new guard are present;
  the three counts still compare against their expectations; none is forced `-Ok $true`;
  `issuer-sector-assignment` carries the strengthened condition and the old too-weak one is gone; Layer 1 never
  consults Layer 2; and no `else`/`elseif`/`finally`/`exit` statement exists. The `exit` check is
  statement-shaped on purpose — a loose word search reports the string `'harness exit code {0}'` inside a
  `Write-Host` argument as an exit statement, the same false positive that made an earlier regex-based
  conformance checker unusable.

### 4.2 Executed in Arena — semantic model, positive and negative

`ps51-regression-model.py` runs the old and corrected patterns over seven documents: the three real installed
ones plus four deliberately wrong ones.

| Document | Truth | OLD | CORRECTED |
|---|---:|---:|---:|
| installed `issuers.json` | 3 | **1** | 3 |
| installed `periods.json` (ANNUAL) | 9 | **1** | 9 |
| installed `issues.json` (`[]`) | 0 | **1** | 0 |
| a single-issuer dataset | 1 | 1 | 1 |
| one ANNUAL period only | 1 | 1 | 1 |
| a non-empty issue collection | 1 | 1 | 1 |
| two issuers where three are expected | 2 | **1** | 2 |

The corrected pattern is wrong on **0 of 7**. Note rows 4–6: for a **one-element** array the old pattern gives
the right answer by luck — which is precisely how this class of defect hides.

Negative cases fail the corrected checks rather than passing vacuously: `issuer-count` 1 vs expected 3 → FAIL;
`nine-annual-periods` 1 vs 9 → FAIL; `dataset-issues-empty` 1 vs 0 → FAIL. **0 vacuous negatives.** The
empty-collection case is shown to yield 0 under *both* 5.1 behaviours, while `@($null)` yields 1.

### 4.3 Executed in Arena — the corrected Layer 1 mirrored over the real dataset

The mirror that executes Layer 1's comparisons was updated to the corrected 24-check Layer 1 (including the
strengthened pairing condition and the new shape guard) and run over the real three-bundle dataset:
**24 / 24 PASS**, exit 0, with the three formerly failing details now reading `3 issuer(s); expected 3`,
`9 ANNUAL period(s) of 9 total; expected 9` and `0 ingestion issue(s) recorded in the dataset`.

Negative mirror runs over **doctored copies in `/tmp`** — the installed dataset was never used as a fixture:

| Doctored copy | Intended check | Result |
|---|---|---|
| `issuers.json` truncated to 1 issuer | `issuer-count` | **FAIL** `1 issuer(s); expected 3` (20/24 — digests also break, correctly) |
| `periods.json` truncated to 1 period | `nine-annual-periods` | **FAIL** `1 ANNUAL period(s) of 1 total; expected 9` (22/24) |
| `issues.json` given one issue | `dataset-issues-empty` | **FAIL** `1 ingestion issue(s) recorded in the dataset` (22/24) |

`parsed-collection-shape` passes in all three, correctly: those documents are wrongly *populated*, not wrongly
*shaped*. The two concerns are separate checks by design.

### 4.4 Delivered for host execution — `tools/windows/IID-STAGE3-WINDOWS-VERIFY.Tests.ps1` (new, 30 `It` blocks)

Pester 5. **Read-only**: the behavioural tests parse JSON held in strings, and the script-level tests invoke the
verification script, which is itself read-only. Nothing creates a dataset — the installed one is evidence, not a
fixture — so those tests are **skipped** when no dataset is present. The file itself satisfies R1–R8.

| Context | `It` blocks | Scope |
|---|---:|---|
| POSITIVE: the corrected pattern counts accurately | 7 | 3 issuers, 9 annual periods, 0 issues, 1 element for a single-item array, 1 for a non-empty issue list, well-formed pairs, no nested collection |
| NEGATIVE: wrong data must fail | 5 | 1 issuer, 2 issuers, 1 annual period, a non-empty issue collection, a malformed pair — each asserts the check condition is **false** |
| THE DEFECT ITSELF, pinned where it occurs | 6 | 5 pinned to Windows PowerShell 5.1 (wrapping, `[]`→1, member enumeration, the exact malformed detail string, the `-ceq` collapse to 1 with the quarterly 0 that passed by luck) and 1 pinned to PowerShell 7, where the same construct enumerates and the defect is invisible |
| THE PUBLISHED SCRIPT | 9 | exists; no defective construct in executable code; the trap still documented in prose; the three corrected sites asserted one per test; every check id retained; expectations still compared; the strengthened condition present; R3/R4 hold |
| THE INSTALLED DATASET (read-only) | 3 | Layer 1 alone reports 3/9/0 and the shape guard passes; **both layers pass, which is the acceptance condition**; the dataset is byte-identical afterwards with no marker created |

Run on the host with:

```powershell
cd <repo>\tools\windows
Invoke-Pester -Path .\IID-STAGE3-WINDOWS-VERIFY.Tests.ps1 -Output Detailed
```

Three of the five version-pinned tests are the ones that will *fail* if run on the wrong PowerShell version, by
design: they document that the defect is a 5.1 behaviour and that PowerShell 7 hides it.

---

## 5. Windows PowerShell 5.1 execution status

**Not performed in Arena, and not claimed.** No PowerShell engine exists in this environment and none could be
obtained; every route was tried and each failure observed, and they are itemised in
`IID-STAGE3-WINDOWS-SCRIPTS-TEST-EVIDENCE-2026-11-13.md` §0. That record's §7 named this as the open blocker —
"the two `.ps1` files have never been executed … a first run on the host is still required" — and this incident
is that prediction being right: the defect was invisible to every static and mirrored check and appeared only
when the script met a real 5.1 host.

Reported separately, as required:

| Category | Status |
|---|---|
| Tests actually executed in Arena | `windowsVerifyScript.test.ts` **17/17**; `test:iid` **966/966** (was 949); `npm test` **678/678**; typecheck **0 errors**; Layer-1 mirror **24/24** positive and 3 negative runs; semantic model **7/7** reproduction and **7/7** documents |
| Static / structural PowerShell validation | tree-sitter-powershell parse: **0 ERROR, 0 MISSING** nodes; R1–R8 **PASS** on all three files; AST-exact `array_expression` search: **3 defective nodes before, 0 after** |
| Windows PowerShell runtime execution | **NOT PERFORMED.** Delivered as `IID-STAGE3-WINDOWS-VERIFY.Tests.ps1` for the host. The correction's semantics are corroborated by a model tested against the operator's real 5.1 output, and every construct it uses is one the operator's run already proved works — but that is corroboration, not execution |

**The acceptance condition — both layers passing against the installed dataset — is therefore NOT yet met by
execution.** It is met by construction and by every check available here, and the host run that will confirm it
is one command (§4.4).

---

## 6. R1–R8 safety validation, re-run against the corrected committed script

AST-exact, with the tree-sitter PowerShell grammar, on the corrected file:

| Rule | Result |
|---|---|
| R1 valid syntax | **PASS** — 0 `ERROR`, 0 `MISSING`, 14 259 nodes |
| R2 one top-level `try/catch` | **PASS** — the single executable body node is a `try_statement`, 5 catch clauses, 4 nested |
| R3 no `else` / `elseif` / `finally` | **PASS** — 0 / 0 / 0 nodes |
| R4 no `exit`, nothing that closes the session | **PASS** — 2 flow-control statements (`return`, `continue`), 0 `exit`, 0 session-killing commands |
| R5 no Git synchronisation | **PASS** — 0 `git` invocations |
| R6 no portfolio database access | **PASS** — 0 database commands, 0 code lines opening the store; the structural target guard still refuses any path inside the store domain |
| R7 no filesystem mutation | **PASS** — 0 mutating commands, 0 .NET write calls. Commands invoked: `Add-Check`, `ConvertFrom-Json`, `ForEach-Object`, `Get-ChildItem`, `Get-Command`, `Get-Content`, `Get-Date`, `Get-FileHash`, `Join-Path`, `New-Object`, `Resolve-Path`, `Sort-Object`, `Split-Path`, `Test-Path`, `Where-Object`, `Write-Host` — none mutating |
| R8 control returns to the session | **PASS** — last line `}`, 165 command invocations, no `exit` |

`IID-STAGE3-WINDOWS-INSTALL.ps1` (unmodified) and the new `IID-STAGE3-WINDOWS-VERIFY.Tests.ps1` were validated
in the same run: **CONFORMANCE RESULT: PASS, 0 rule failures across 3 files.**

---

## 7. Safety boundaries respected

* `C:\iips-data\investment\dataset`, `C:\iips-data\investment` and `C:\iips-data\iips\user-portfolio.sqlite`
  were **not read, written, created, deleted, renamed, moved or repaired** from this environment. Nothing on the
  host was contacted.
* No reinstall, no re-ingest, no rewrite of the manifest or coverage report, no republish, no marker resolved.
  The dataset digest is unchanged and was not recomputed against the host.
* Negative tests used **doctored copies under `/tmp`**; the positive fixture is a scratch dataset published by
  the real writer in this sandbox, not the host's.
* The portfolio database was not touched. No unrelated application changes: the diff is 1 modified PowerShell
  script and 2 new test files plus this record. No protected governance record was modified.
* PR #562 was **not merged**.

---

## 8. Remaining IID Stage 3 acceptance requirements

1. **Run the corrected script on the Windows host** and capture the output. Expected: `RESULT PASS`, Layer 1
   24/24 and Layer 2 32/32, `harness exit code 0`, dataset version
   `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`. This is the acceptance condition
   and it is the one thing that cannot be done from here.
2. **Run the Pester suite on the host** (`Invoke-Pester -Path .\IID-STAGE3-WINDOWS-VERIFY.Tests.ps1`), which
   pins the 5.1 behaviour directly and re-checks the published script's source.
3. **Blocker `S3-B3` remains open until an assessor records the host verification.** The dataset is installed and
   both layers are expected to pass; the evidence for that must come from the host run, not from this record.
4. **`identitySourcesAvailable` remains `false`** — disclosed by both layers as a disclosure, never a gate.
5. **The 3/13 sector coverage is expected** for this deliberately limited three-bundle dataset and is not an
   installation failure; 10 unmeasured sectors are listed explicitly by the coverage read.
