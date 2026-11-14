# IID Stage 3 — Windows Pester suite: Pester 5 lifecycle correction

**Date:** 2026-11-14
**Branch:** `arena/94a53bb3-iips-review-recovered`
**Subject:** `tools/windows/IID-STAGE3-WINDOWS-VERIFY.Tests.ps1`
**Trigger:** the operator executed the published regression suite on a real Windows host and it failed almost completely.
**Predecessor record:** `IID-STAGE3-WINDOWS-VERIFY-LAYER1-CORRECTION-2026-11-14.md` (the Layer 1 product correction, commit `2c491bc5`)

---

## 0. Status

| Item | State |
|---|---|
| Host report | Pester **5.7.1**, Windows PowerShell **5.1.26100.9818**: **30 discovered, 29 FAILED, 1 skipped** |
| Root cause | **Two**, both established and reproduced: a Pester 5 lifecycle/scope defect (28 tests) and one genuinely wrong expectation (1 test) |
| Product code | **Not at fault.** `IID-STAGE3-WINDOWS-VERIFY.ps1` and `IID-STAGE3-WINDOWS-INSTALL.ps1` are **byte-identical to `2c491bc5`** — not one byte changed |
| Tests preserved | **30 of 30**, all five Contexts, the same 7/5/6/9/3 distribution, the same nine `-Skip:` conditions verbatim, and 65 of 69 original assertion values surviving verbatim in the same test |
| Tests weakened | **None.** Assertion count rose 69 → 90; no `Should` operator was removed |
| Arena validation | Lifecycle validator PASS, host-run reproduction EXACT, 24/24 TS tests, R1–R8 PASS ×3, Layer 1 mirror 24/24, `test:iid` 973/973, `npm test` 678/678, typecheck 0 errors, frontend CI parity (2828 tests, guard OK, build ✓) |
| **Windows-host Pester execution** | **NOT PERFORMED IN ARENA.** No PowerShell engine exists in this environment. Acceptance remains outstanding — see §8 |

This record does **not** claim the suite passes on Windows. It claims the defect that made it fail is identified, reproduced exactly, and removed, and that the corrected file is validated by every means available here.

---

## 1. The host evidence

The operator ran the suite as delivered in `2c491bc5`:

```
Windows PowerShell 5.1.26100.9818
Pester 5.7.1
Tests discovered 30 — Failed 29 — Skipped 1
```

The reported errors fell into five distinct texts:

| Error text reported by the host | Tests |
|---|---|
| `ConvertFrom-Json : Cannot bind argument to parameter 'InputObject' because it is null` | **16** |
| `Cannot bind argument to parameter 'LiteralPath' because it is null` — `Test-Path` (line 242) | **1** |
| … same — `Get-Content` (lines 251, 280, 298) | **3** |
| … same — `Get-ChildItem` (line 341) | **1** |
| `The term 'Read-ScriptCode' is not recognised as the name of a cmdlet, function, script file…` (lines 246, 259, 266, 273, 303) | **5** |
| invalid command reference following `&` (lines 312, 328) | **2** |
| `$malformed.Count` — **expected 2, received 3** (line 190) | **1** |
| | **29** |

Two observations frame everything that follows.

**First**, every failing line touches something the file defined at its top level: a fixture string, a path, or the one helper function. Nothing that failed was a product assertion about the dataset.

**Second**, exactly one test was skipped, and it was `on PowerShell 7 the same construct enumerates, which is why the defect is invisible there`, whose condition is `-Skip:($script:IsWindowsPowerShell)`. For that skip to have been decided correctly, `$script:IsWindowsPowerShell` had to be **true when the expression was evaluated** — so the top-level assignment *had* executed. Yet five tests whose condition was `-Skip:(-not $script:IsWindowsPowerShell)` were **not** skipped, and the three dataset tests were **not** skipped either, so `-Skip:` saw correct values throughout. The skip logic worked. The test bodies did not.

That combination — discovery sees the state, run does not — is the signature of one specific Pester 5 defect.

---

## 2. Root cause A: the Pester 5 discovery/run split (28 of 29 failures)

Pester 5 executes a test file in **two phases**, in **different scopes**:

1. **DISCOVERY.** The file is executed top to bottom to find `Describe`, `Context` and `It` blocks. `It` parameters — including `-Skip:` — are evaluated here, before any test body exists as a running thing.
2. **RUN.** `BeforeAll`, then the `It` bodies, then `AfterAll`, execute in the container's run scope. **Nothing assigned at the top level of the file during discovery is visible here.**

The delivered file assigned everything at the top level, inside `try { … }` but outside any Pester container:

```powershell
try {
  $script:Here = Split-Path -Parent $MyInvocation.MyCommand.Path     # discovery only
  $script:ScriptPath = Join-Path $script:Here 'IID-STAGE3-WINDOWS-VERIFY.ps1'
  $script:ThreeIssuers = '[' + …                                     # discovery only
  function Read-ScriptCode { … }                                     # discovery only
  Describe '…' {
    Context '…' {
      It '…' { $parsed = $script:ThreeIssuers | ConvertFrom-Json }   # RUN: $script:ThreeIssuers is $null
    }
  }
}
```

The file contained **zero** `BeforeAll` blocks. So at run time:

- `$script:ThreeIssuers`, `$script:NineAnnual`, `$script:EmptyIssues`, `$script:OneIssuer`, `$script:OneIssue`, `$script:TwoIssuers`, `$script:OneAnnual` were `$null` → `ConvertFrom-Json` refused a null `InputObject` (**16 tests**).
- `$script:ScriptPath` and `$script:DatasetDir` were `$null` → `Test-Path`, `Get-Content` and `Get-ChildItem` refused a null `LiteralPath` (**5 tests**).
- `Read-ScriptCode` did not exist → *not recognised* (**5 tests**).
- `& $script:ScriptPath` had a null target → *invalid command reference* (**2 tests**).

**This was reproduced, not inferred.** A static model of the two-phase split (`/tmp/pscheck/predict-host-run.py`) was written that takes the defective file, evaluates each `-Skip:` against discovery state for a Windows PowerShell 5.1 host with the dataset installed, and predicts for each remaining test the first statement that throws and with which error. Its output:

```
PREDICTED TOTALS
  discovered : 30
  failed     : 29
  skipped    : 1  (test [18])

PREDICTED FAILURE CATEGORIES (per test)
  InputObject null (ConvertFrom-Json)                        16
  LiteralPath null (Test-Path/Get-Content/Get-ChildItem)      5
  Read-ScriptCode not recognised                              5
  invalid command reference after &                           2
  wrong expectation (assertion value)                         1

HOST REPORTED (operator, Pester 5.7.1 / Windows PowerShell 5.1.26100.9818)
  discovered : 30     failed : 29     skipped : 1
  InputObject null (ConvertFrom-Json)                        16   [MATCH predicted 16]
  LiteralPath null (Test-Path/Get-Content/Get-ChildItem)      5   [MATCH predicted 5]
  Read-ScriptCode not recognised                              5   [MATCH predicted 5]
  invalid command reference after &                           2   [MATCH predicted 2]
  wrong expectation (assertion value)                         1   [MATCH predicted 1]

REPRODUCTION OF THE HOST RUN: EXACT - totals and every failure category agree
```

The one skipped test is predicted as **test 18** — the PowerShell 7 test — which is the one the host skipped. Every failure category agrees in count, and the per-test line attribution agrees with the host's reported line numbers (for example the model predicts the throw at the statement on line 245 of the defective file for `Read-ScriptCode`, and the host reported line 246, the executing line).

The same model run against the **corrected** file predicts:

```
discovered : 30   failed : 0   skipped : 1  (test [18])
no scope failure, executed against real run-phase state : 29
PREDICTION FOR THIS FILE: no scope failure in any of the 29 executed tests
```

This is a prediction about **scope** only. Whether the 29 executed tests pass their assertions is the host's acceptance condition (§8) and is not decided here.

---

## 3. Root cause B: one genuinely wrong expectation (the 29th failure)

Line 190 of the delivered file asserted:

```powershell
$pairs = @('Infosys Limited', ' -> ', 'Technology')
$malformed = @($pairs | Where-Object { $_ -notmatch '^.+ -> .+$' })
$malformed.Count | Should -Be 2          # host: expected 2, received 3
```

**The host was right and the test was wrong.** `^.+ -> .+$` requires at least one character, then the four-character separator `' -> '`, then at least one more character — six characters minimum. The element `' -> '` is **four** characters long, so it cannot match, so it *is* malformed, exactly like `'Infosys Limited'` and `'Technology'`, neither of which contains a separator at all. All three elements are malformed; none of them is a name-to-sector pair. The expected value is **3**.

This defect is independent of scope: `$pairs` is a local literal, so this was the one test that reached its own assertion, and the one test that would still have failed after the lifecycle fix. It is corrected to `-Be 3`, and the test now *also* pins the real seven-element string the Layer 1 defect produced on the host, so the correction is tested against evidence rather than against an invented list:

```powershell
$defectMalformed = @($script:DefectPairs | Where-Object { $_ -notmatch '^.+ -> .+$' })
$defectMalformed.Count | Should -Be 7
($script:DefectPairs -join '; ') | Should -Be 'Infosys Limited; Marico Limited; KEC International Limited;  -> ; Technology; Consumer; Industrials'
$wrappedIssuerCount = 1
($wrappedIssuerCount -gt 0 -and $script:DefectPairs.Count -eq $wrappedIssuerCount -and $defectMalformed.Count -eq 0) | Should -BeFalse
```

The last line is the point of the test: the *strengthened* `issuer-sector-assignment` condition must reject the defect's real output, not merely assert that an invented list is malformed.

---

## 4. The correction

### 4.1 The two phases are now separated explicitly

```
DISCOVERY (file top level, before the Describe)     RUN (BeforeAll, inside the Describe)
  $script:DiscoveryDirectory                          $script:TestDirectory      (4 fallbacks)
  $script:DiscoveryDataRoot                           $script:ScriptPath
  $script:DiscoveryDatasetDir                         $script:DataRoot, $script:DatasetDir, $script:AsOf
  $script:IsWindowsPowerShell   <- -Skip: reads these  $script:ThreeIssuers, OneIssuer, TwoIssuers
  $script:DatasetPresent                               $script:NineAnnual, OneAnnual, EmptyIssues, OneIssue
  $script:NodeAvailable                                $script:DefectPairs
                                                       $script:ScriptRaw, ScriptWithoutBlockComments,
                                                       $script:ScriptCodeLines, $script:ScriptCode
```

`-Skip:` **must** read discovery state, because it is decided before any `It` body runs; it cannot read `BeforeAll` state, which does not exist yet. Everything an `It` body reads **must** be in `BeforeAll`. The two sets are therefore disjoint by name — the discovery copies are `Discovery*`-prefixed — so no reader and no future edit can mistake one phase for the other. The path and dataset values are computed twice, once per phase, identically. **That duplication is required, not accidental**, and removing either copy reintroduces the failure.

### 4.2 No helper function

`Read-ScriptCode` is gone. Function visibility across Pester's phase boundary is the same open question as variable visibility, and five tests depended on it. The strings it produced are now computed once in `BeforeAll` (`$script:ScriptRaw`, `$script:ScriptWithoutBlockComments`, `$script:ScriptCodeLines`, `$script:ScriptCode`), so every test depends only on **variable** flow, which is Pester's documented guarantee. The file now defines **zero** functions. The comment-aware behaviour the helper provided is preserved exactly: block comments `<# … #>` are stripped, then any line whose first non-space character is `#`, so the script's own prose explanation of the defect is not reported as the defect.

### 4.3 Path resolution with four independent fallbacks

Which automatic variable Pester populates inside `BeforeAll` is an implementation detail, not a guarantee. `$script:TestDirectory` is therefore resolved by trying, in order: `$PSCommandPath`, `$PSScriptRoot`, `$MyInvocation.MyCommand.ScriptBlock.File`, and finally a walk of up to eight levels up from `(Get-Location).Path`, testing both the directory itself and its `tools/windows` subdirectory at each level and keeping the first (lowest) match.

The first test in `THE PUBLISHED SCRIPT` now asserts the resolution succeeded:

```powershell
It 'exists beside this test file' {
  $script:TestDirectory | Should -Not -BeNullOrEmpty -Because 'the test directory must resolve in the Run phase; see the four fallbacks in BeforeAll'
  $script:ScriptPath | Should -Not -BeNullOrEmpty
  Test-Path -LiteralPath $script:ScriptPath | Should -BeTrue
  …
```

A null path must produce **one clear failure naming the cause**, not nine cryptic parameter-binding errors.

### 4.4 Non-vacuity guards

Thirteen `Should -Not -BeNullOrEmpty` guards were added at the head of the tests that consume fixtures or paths, each with a `-Because` naming the Pester scope contract. Their purpose is diagnostic precision: if the lifecycle ever regresses, the failure says *"the BeforeAll fixtures must be visible in the Run phase (Pester 5 scope)"* instead of `InputObject is null`.

The read-only dataset test gained the guard the original lacked:

```powershell
$fingerprint.Count | Should -BeGreaterThan 0 -Because 'the dataset must hold files for this comparison to mean anything'
```

Without it, comparing two empty fingerprints would pass and mean nothing — the difference between *"the dataset is unchanged"* and *"we looked at nothing"*. Both of the original's comparisons are kept (file count **and** the joined per-file fingerprints).

### 4.5 Invocation of the published verifier, checked against its actual contract

The three invocations were verified against the script's real `param()` block rather than assumed:

| Passed by the suite | Declared in `IID-STAGE3-WINDOWS-VERIFY.ps1` | Kind |
|---|---|---|
| `-DataRoot $script:DataRoot` | `[string]$DataRoot = 'C:\iips-data'` | value |
| `-AsOf $script:AsOf` | `[string]$AsOf = ''` | value |
| `-SkipProductHarness` | `[switch]$SkipProductHarness` | switch |

No undeclared parameter is passed. The properties the tests read were likewise verified against the script's result object: `Add-Check` emits `[pscustomobject]@{Id; Ok; Layer; Detail}` with `$Layer` defaulting to `'ps'` and Layer 2 checks passing `-Layer 'product'`, so `Layer -ceq 'ps'` / `-ceq 'product'` are the correct discriminators; `Result` is `'PASS'` whenever no check fails — including with `-SkipProductHarness`, because that path records `product-harness` with `-Ok $true` — so asserting `PASS` for the Layer-1-only invocation is right; and `Failed = $failed.Count` does exist on the success path (line 506), so `Failed | Should -Be 0` is a real property, not an invented one.

The script writes only through `Write-Host` (47 occurrences) and emits **nothing** on the error, warning, verbose or output streams, so `& $script:ScriptPath … 6>$null | Out-Null` silences all of its output without suppressing a genuine failure — and cannot trip `$ErrorActionPreference`.

---

## 5. Fidelity: what was preserved

Measured by comparing the delivered file (`4eb0dee4494e887b`) with the corrected one (`9f9ebe4ed8adb487`):

| Property | Delivered | Corrected | Verdict |
|---|---|---|---|
| `It` blocks | 30 | **30** | preserved |
| `It` names | — | — | **identical, in the same order**; none dropped, none renamed |
| `Context` blocks | 5 | **5** | preserved |
| `It` distribution | 7/5/6/9/3 | **7/5/6/9/3** | preserved |
| `-Skip:` conditions | 9 | **9, byte-identical** | preserved |
| `Should` assertions | 69 | **90** | none removed, 21 added |
| Original assertion *values* surviving verbatim in the same test | — | **65 of 69** | 4 changed, all justified below |
| Helper functions | 1 | **0** | replaced by `BeforeAll` state (§4.2) |
| `BeforeAll` blocks | **0** | **1** | the correction |

`Should`-operator census, old → new: `-Be` 36→38, `-BeFalse` 7→8, `-BeTrue` 6→6, `-Match` 15→15, `-BeLike` 4→4, `-BeGreaterOrEqual` 1→1, `-BeGreaterThan` 0→3, `-BeLessThan` 0→1, `-Not -BeNullOrEmpty` 0→13. **No operator count decreased.**

The four changed assertion values:

1. `$malformed.Count | Should -Be 2` → **`-Be 3`** — the host-rejected expectation, corrected to PowerShell `-match` semantics (§3). Three assertions were added alongside it.
2. `Should -Match [regex]::Escape('…')` → `Should -Match ([regex]::Escape('…'))` — the identical string, parenthesised. Not a semantic change.
3. and 4. `leaves the dataset exactly as it found it` — the original compared `$before.Count` to `$after.Count` and the joined fingerprints. The corrected test keeps **both** comparisons and adds the non-vacuity guard, capturing `$afterFingerprint` as an array so the count comparison survives verbatim (§4.4).

---

## 6. Validation performed in Arena

### 6.1 Windows-host execution: NOT PERFORMED

**No PowerShell engine exists in this environment**, so neither the corrected Pester suite nor the corrected verification script was executed by a real PowerShell. Every attempt to obtain one is recorded in the predecessor record and remains closed: the GitHub release asset host is unreachable from this sandbox (HTTP 000 after a 302), the npm `pwsh` package is a downloader shim that prints *"Installation should have replaced this file with a real PowerShell binary"* and exits 1, `@dsh-ops/pwsh-linux-*` and `pwsh-linux-x64` do not exist in the registry, `tree-sitter-wasms` ships no PowerShell grammar, the PyPI `pwsh` package is a wrapper, and there is no dotnet, wine or mono. **Pester 5.7.1 / Windows PowerShell 5.1 acceptance is therefore NOT claimed here.** It is the outstanding requirement in §8.

What follows is static and behavioural validation available in Arena, and each item says what it does and does not prove.

### 6.2 Lifecycle validation

`/tmp/pscheck/pester-lifecycle.py` checks the phase discipline statically:

```
discovery-phase assignments (top level) : 6
run-phase assignments (BeforeAll)       : 18
BeforeAll at line 116, Describe at line 114, 79 lines of run-phase setup
It blocks discovered: 30      -Skip: expressions checked: 9

LIFECYCLE RESULT: PASS
  L1 every $script: variable read in an It body is assigned in BeforeAll
  L2 every $script: variable in a -Skip: expression is assigned at discovery top level
  L3 no It body calls an unknown function; the file defines no functions at all
  L4 exactly one BeforeAll, inside the Describe
  L5 30 It blocks preserved, 9 of them conditionally skipped
  L6 no It body reads discovery-only state, and no It invokes an unresolved command reference
```

Run against the **delivered** file, the same validator reports the defect precisely:

```
run-phase assignments (BeforeAll) : 0
BeforeAll: ABSENT — Describe at line 89, no run-phase setup at all
LIFECYCLE RESULT: FAIL
  - L4 NO BeforeAll block exists anywhere inside the Describe …
  - L6 It bodies read DISCOVERY-only state: line 93:$script:ThreeIssuers, line 100:$script:NineAnnual, … (33 findings)
  - L3 It bodies call something that is neither a known cmdlet nor a Pester keyword: line 245:Read-ScriptCode,
       line 258:Read-ScriptCode, line 265:Read-ScriptCode, line 272:Read-ScriptCode, line 302:Read-ScriptCode
  - L3 the file defines function(s) at line(s) [72]
  - L6 line 311/327/340 invokes & $script:ScriptPath, which is not assigned in BeforeAll
```

Two validator defects were found and fixed while building it, and are recorded so they are not reintroduced: a `$script:X` inside a **single-quoted** string or behind a **backtick-escaped** `` `$ `` is literal text in PowerShell and must not be counted as a variable read (three assertions quote the tested script's own `$script:TargetFull`); and a command call written as `$x = Read-ScriptCode …` sits after `=`, a position a naive call-site pattern misses — which is why the first version found 2 of the 5 helper-function failures.

### 6.3 The discipline is now enforced in CI

Seven tests were added to `iips-platform/tests/investment/windowsVerifyScript.test.ts` under `describe('Windows verify Pester suite — Pester 5 lifecycle discipline')`, so the defect cannot return silently:

```
ok 1 - run-phase state is established inside BeforeAll, which is the only place an It body can see it
ok 2 - every -Skip: condition is decided from discovery state, because Pester evaluates it before any It runs
ok 3 - no It body depends on a helper function crossing the Pester phase boundary
ok 4 - all 30 test cases and all five contexts are preserved, with none renamed away
ok 5 - the malformed issuer-sector expectation is 3, which is what PowerShell -match semantics requires
ok 6 - the Pester suite's Layer 1 census is exactly the script's own checks, in both directions
ok 7 - the defect construct appears in the suite only where it is being pinned, never in a check that must be right
```

Test 4 pins all **30 test names verbatim**, so a case cannot be dropped or quietly renamed away. Test 6 extracts the `Add-Check -Id '…'` ids from the published script's Layer 1 region and asserts set equality, **in both directions**, with the census the Pester suite demands — so adding or removing a Layer 1 check without updating the suite fails CI. Test 7 asserts the wrapping construct appears in the Pester file **only** inside `THE DEFECT ITSELF`, where it is deliberately pinned, and never in a context that must be correct.

**Non-vacuity, proven rather than claimed.** Every detector was run against the construct it exists to catch:

- the whole lifecycle `describe` was re-pointed at the delivered file and executed: **3 of the 7 tests FAIL on it** (`run-phase state…`, `no It body depends on a helper function…`, `the malformed issuer-sector expectation…`) while all 17 pre-existing product tests still pass — exactly the right discrimination, since the product was never at fault. Evidence: `/tmp/pscheck/e11-probe-defective.out`.
- the command detector reports `Read-ScriptCode` as unrecognised in **both** the `$x = Read-ScriptCode …` and the `(Read-ScriptCode) | Should …` positions, asserted inside test 3 itself.
- test 5 recomputes the PowerShell pattern `^.+ -> .+$` and asserts all three elements of the list are malformed, with the length argument (`' -> '`.length is 4, below the 6 the pattern requires) asserted explicitly, and asserts `Should -Be 2` is gone from the file.
- test 7 asserts the detector still finds the construct where it legitimately lives (≥2 occurrences inside the defect context).

### 6.4 One further defect found and fixed in the committed TS suite

`iips-platform/tests/investment/windowsVerifyScript.test.ts` contained a **vacuous** assertion:

```ts
const layer1 = text.slice(0, text.indexOf("Add-Check -Id 'product-harness'"));
assert.ok(layer1.indexOf > 0 === false || layer1.length > 0, 'the Layer 1 region was located');
```

`indexOf` is a function; comparing a function with `0` is `false`; `false === false` is `true`; the expression was **always true**. A vacuous guard is worse than none, because it hides the case it exists for: if the marker were missing, `indexOf` would return `-1`, `slice(0, -1)` would hand back essentially the whole script, and every *"Layer 1 never consults the harness report"* assertion below it would inspect the wrong region. It is now:

```ts
const boundary = text.indexOf("Add-Check -Id 'product-harness'");
assert.ok(boundary > 0, `the Layer 1 region was located (marker at offset ${boundary})`);
const layer1 = text.slice(0, boundary);
assert.ok(layer1.length > 0 && layer1.length < text.length, 'and the region is a real prefix of the script, not all of it');
```

### 6.5 Suites, typechecks and build

| Check | Command | Result |
|---|---|---|
| Windows verify suite | `npx tsx --test tests/investment/windowsVerifyScript.test.ts` | **24 tests, 24 pass, 0 fail** (17 pre-existing + 7 new) |
| IID suites | `npm run test:iid` | **973 tests, 973 pass, 0 fail, 0 skipped** (was 966; +7) |
| Platform suites | `npm test` | **678 tests, 678 pass, 0 fail** (unchanged) |
| Platform typecheck | `npm run typecheck` | **0 errors** |
| Frontend typecheck (CI step) | `npm run typecheck` | **0 errors** |
| Frontend replay-server strict typecheck (CI step) | `npm run typecheck:replay-server` | **0 errors** |
| Frontend Vitest (CI step) | `npm run test:ci` | **197 files passed, 1 skipped; 2827 tests passed, 1 skipped** |
| Zero-test / false-green guard (CI step) | `node .ci/assert-tests.js .vitest-report.json` | **OK — 198 files, 2828 tests, 0 failed** |
| Production build (CI step) | `npm run build` | **✓ built in 8.22s** |

The frontend Vitest run rewrites two committed evidence files as a known side effect (`evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/zero-socket-{control,test}.json`); both were restored with `git checkout -- evidence/` and the final tree contains **only** the two intended files.

### 6.6 PowerShell safety rules R1–R8

Re-run over all three PowerShell files after every edit:

```
IID-STAGE3-WINDOWS-VERIFY.ps1        R1 PASS ERROR=0 MISSING=0 nodes=14259   … R8 PASS   (165 invocations)
IID-STAGE3-WINDOWS-INSTALL.ps1       R1 PASS ERROR=0 MISSING=0 nodes=8852    … R8 PASS   (140 invocations)
IID-STAGE3-WINDOWS-VERIFY.Tests.ps1  R1 PASS ERROR=0 MISSING=0 nodes=10920   … R8 PASS   (209 invocations)

CONFORMANCE RESULT: PASS  (0 rule failure(s) across 3 file(s))
```

The corrected Pester file parses with **zero ERROR and zero MISSING** nodes, has exactly **one** top-level `try`/`catch` with no nested `try`, **no** `else`/`elseif`/`finally`, **no** `exit` statement, **no** git invocation, **no** database access, **no** filesystem mutation, and ends by returning control to the session. Its 209 command invocations span 21 distinct commands, all read-only.

### 6.7 Layer 1 and the installed-dataset fixture

The corrected 24-check Layer 1 mirror was re-run over the digest-identical fixture extracted from the operator's host evidence:

```
LAYER-1 MIRROR RESULT: PASS - 24 passed, 0 failed (of 24)
  [PASS] [ps] issuer-count
  [PASS] [ps] nine-annual-periods
  [PASS] [ps] dataset-issues-empty
  [PASS] [ps] parsed-collection-shape
  [PASS] [ps] issuer-sector-assignment
  [PASS] [ps] derived-coverage-agrees
           report sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83
       vs manifest sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83
  [PASS] [ps] layer1-read-only-mirror
           nothing created, removed or modified under /tmp/pscheck/host/investment by this mirror
```

The dataset version matches the host's reported `sha256:3ad82918f1ca22317ef7e34e4b48b9356268b4a18028a0750f94d37676de2d83`, and the mirror's own before/after snapshot proves it wrote nothing. **The 24 Layer 1 checks are intact and the 32 Layer 2 checks were not touched** — `verify-installed-dataset.ts` and `verifyInstalledDataset.test.ts` are byte-identical to `2c491bc5`.

---

## 7. Boundary compliance

| Boundary | Status |
|---|---|
| `IID-STAGE3-WINDOWS-VERIFY.ps1` (published verifier) | **UNCHANGED**, byte-identical to `2c491bc5`. No product-code defect was found, so none was changed |
| `IID-STAGE3-WINDOWS-INSTALL.ps1` | **UNCHANGED**, byte-identical |
| `verify-installed-dataset.ts` (Layer 2 harness, 32 checks) | **UNCHANGED**, byte-identical |
| `verifyInstalledDataset.test.ts` (29 tests) | **UNCHANGED**, byte-identical |
| `constraints.test.ts` (SQLite-vocabulary ban) | **UNCHANGED**, byte-identical — not weakened |
| Protected governance records (`IID-STAGE-3-READINESS-REASSESSMENT`, `IID-STAGE-3-INVESTMENT-DATASET-READINESS`, `IID-O3-DATASET-ADMISSION-PA-DECISION`, both evidence records) | **UNTOUCHED**, byte-identical |
| The installed Windows dataset | **Not modified, not reinstalled, not accessed.** No write reached `C:\iips-data`; the fixture used here is a `/tmp` copy, and the mirror proved it wrote nothing |
| Personal Portfolio SQLite database | **Never contacted.** No `.ps1` in this change references it; R6 confirms 0 database commands |
| The user's local Windows checkout and worktrees | **Not fetched, not synced, not altered.** No git command appears in any changed file (R5: 0 invocations) |
| IPD (`iips-production-market-data`) | **Zero writes** |

Files changed by this correction — exactly two:

```
 M iips-platform/tests/investment/windowsVerifyScript.test.ts   | 367 ++++++++++++++++++++-
 M tools/windows/IID-STAGE3-WINDOWS-VERIFY.Tests.ps1            | 327 +++++++++++++-----
```

plus this record.

---

## 8. Remaining IID Stage 3 acceptance requirements

1. **Run the corrected Pester suite on the Windows host** — Pester 5.7.1, Windows PowerShell 5.1:
   ```powershell
   cd <checkout>\tools\windows
   Invoke-Pester -Path .\IID-STAGE3-WINDOWS-VERIFY.Tests.ps1 -Output Detailed
   ```
   Expected on that host: **30 discovered, 29 passed, 1 skipped** (the PowerShell 7 test), **0 failed**. This is the acceptance condition for the correction in this record and it **cannot be performed from Arena**. If any test fails, the failure text will now name its cause: a scope guard says *"the BeforeAll fixtures must be visible in the Run phase"*, a path guard says *"the test directory must resolve in the Run phase"*.
2. **Run the corrected verification script on the host** (unchanged from the predecessor record) — expected `RESULT PASS`, Layer 1 **24/24**, Layer 2 **32/32**, harness exit code 0, dataset version `sha256:3ad82918…`.
3. **Blocker `S3-B3` remains OPEN** until an assessor records host verification. Nothing in this record closes it.
4. `identitySourcesAvailable` stays `false` — a disclosure, never a gate.
5. **3 of 13 sector coverage is expected** for this deliberately limited three-bundle dataset, not an installation failure; the 10 unmeasured sectors are listed explicitly by the verifier.
6. Task 11 status stands: **CONDITIONALLY READY** — implementation READY, dataset READY as artefact, runtime NOT READY (`ready:false` in all six diagnostics); criteria B/C/E MET, A and D share one outstanding limb; `L-041`/`L-042` OPEN.

---

## 9. Artefacts

| Path | What it is |
|---|---|
| `tools/windows/IID-STAGE3-WINDOWS-VERIFY.Tests.ps1` | **corrected**, 511 lines / 32 986 bytes / `sha256:9f9ebe4ed8adb487…` (was 358 / 20 520 / `4eb0dee4494e887b…`) |
| `iips-platform/tests/investment/windowsVerifyScript.test.ts` | **extended**, 680 lines / 39 517 bytes / `sha256:da9fa35bf09d61b6…` (was 313 / 18 318 / `7bb16bfadb95a87c…`), 24 tests |
| `/tmp/pscheck/predict-host-run.py` | static model of the Pester 5 phase split; reproduces the host run exactly and predicts the corrected file |
| `/tmp/pscheck/pester-lifecycle.py` | L1–L6 lifecycle validator |
| `/tmp/pscheck/tests-previous.ps1` | the delivered (defective) suite, extracted from `2c491bc5`, used as the negative control |
| `/tmp/pscheck/e11-probe-defective.out` | the CI detectors failing 3/7 against the defective file |
| `/tmp/pscheck/e12-mirror-final.out` | Layer 1 mirror, 24/24 PASS with its read-only proof |
| `/tmp/pscheck/e13…e24` | `test:iid` 973, `npm test` 678, typechecks, frontend CI steps, final suite runs |

**Scratch artefacts live in `/tmp` and are not committed.**
