# IID Stage 4 — Windows verification procedure (operator-executed)

**Record type:** procedure — instructions for the owner to run on their own Windows machine
**Date:** 2026-11-16 (UTC)
**Repository:** `ramkivs/iips-review-recovered` (IRR)
**Status:** **PREPARED. NOT EXECUTED.** Nothing in this document has been run on Windows. Arena has no
access to the Windows host.
**Classification:** Local / Single User / Non-Production. Production explicitly out of scope.

---

## 0. What this is, what it is not, and one missing input

### 0.1 What it is

Execution-ordered instructions for the owner to verify, on the running application:

1. IID runtime readiness on the Windows host, using the existing `iid:readiness` diagnostic;
2. company identification — that a company found by name resolves to the roster's own governed identifier;
3. coverage — the identity surface and the investment-dataset surface, each reported separately;
4. one recorded assessment chain, read back through the application and through a separate process;
5. what the installed identity set actually contains, and how that compares to the population `O1` records.

Every command below invokes **something that already exists in this repository**. No script, no tool, no
endpoint and no file is created by this procedure. Nothing in it writes to the identity files, the
dataset, a carrier, a database or the data domain.

### 0.2 What it is not

- It is **not** a Windows verification result. No observation in this document is a host fact.
- It does **not** claim Stage 4, Stage 5, P6-B, browser acceptance or overall IID readiness. Whether any
  of those move depends entirely on what the owner observes when running §2–§8.
- It is **not** an authorization to re-provision identity, reinstall a dataset, mint an assessment, or
  change any configuration. Those are separate ordinary operations under
  `IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md` and are not part of verification.

### 0.3 The report I could not find — stated before anything else

The instruction refers to "the 16 November IID readiness report". **No document with that title exists in
either repository as at this baseline.** Specifically, I searched:

| Search | Result |
|---|---|
| IRR `main` (`064195397dfdb32bf0f34a461b02fd6b9f9a8df0`) file tree for any path containing `2026-11-16` | two files, both DHAN workstream: `DHAN-D7-IRR-ACCEPTANCE-2026-11-16.md`, `DHAN-W11-CAPABILITY-GAPS-IPD-HANDOFF-2026-11-16.md` |
| IRR `main` for any `IID`-named document | **three** (`IID-BOUNDED-VALUATION-AND-LINKAGE-CORRECTIONS-2026-11-09`, `IID-IDENTITY-AND-INVESTMENT-COVERAGE-SEPARATION-2026-11-10`, `IID-P6A-RUNTIME-DEPENDENCY-ASSESSMENT-2026-11-09`), none dated 2026-11-16 |
| Every IRR commit made on 2026-11-16, for an added `docs/integration/IID*` path | none |
| IRR branch `arena/53ff9276-iips-review-recovered` (this branch, head `6187092d`) | one 2026-11-16 IID document: the `O1` decision record |
| IPD `main` (`75db511d2d`) for any path containing `2026-11-16` or named `READINESS` | no IID readiness report; IPD carries W04/W07/D-7 records and its own `src/oq/runtime_readiness.ts` code |

Rather than invent one, this procedure is built from the documents that **do** exist and are authoritative
at this baseline. Each is cited where it is used:

| Document | Used for |
|---|---|
| `docs/OPERATOR_RUNBOOK.md` §3, §3.1, §3.2 (on `main`) | the transport's environment contract, the Reports carrier's byte-exact expectation, and the `owner-context-unavailable` diagnosis table §6.1 quotes |
| `docs/OPERATOR_RUNBOOK.md` §14, §16.1 (this branch) | the assessment read-back CLI and the PowerShell form of the readiness check. §16 was added after `main`; on a `main` checkout use §3 of this procedure instead |
| `IID-P6A-RUNTIME-DEPENDENCY-ASSESSMENT-2026-11-09.md` | the eight readiness findings, their owners, and what each one does and does not prove |
| `IID-STAGE-2-READINESS-REASSESSMENT-2026-11-14.md` | the installed identity set, its provenance and its digests |
| `IID-STAGE2-WINDOWS-HOST-PROVISION-EVIDENCE-2026-11-14.md` | the three-file publication and the predicted canonical digests |
| `IID-STAGE-4-COVERAGE-READINESS-2026-11-14.md` §7, §11 | the register items this procedure supplies captures for (`R-1`, `R-2`) |
| `IID-NP04-FIRST-INFOSYS-PERSISTENCE-COMPLETION-2026-11-15.md` | the stored Infosys chain this procedure reads back |
| `IID-O1-IDENTITY-GOVERNANCE-PA-DECISION-2026-11-16.md` | the three-issuer population §10 compares against |
| IPD `IIPS-W04-IDENTITY-PROVISIONING-HOST-COMPLETION-RECONCILIATION-2026-11-14.md` (read-only) | the 2,388-issuer installed-set figure §10 investigates |

If the report the owner means is a file not in these repositories, the owner should name the path and this
procedure can be reconciled to it. Nothing above is guessed.

### 0.4 Which checkout to run from — and one thing that changes the commands

The owner's Windows checkout is the source of truth for what the host serves; this procedure does not ask
for it to be moved. One verified fact shapes the instructions, and it is worth reading before §10:

**The tree differs between code levels, and the difference decides which of two forms of §10 you can run.**

| | `main` (`064195397`) | this branch from `302e932949` (2026-11-14), and PR #562's head `f98732e1` |
|---|---|---|
| `tools/windows/IID-STAGE2-IDENTITY-PROVISION.ps1` | absent | **present** |
| `iips-platform/src/investment/cli/provision-identity.ts` | absent | **present** |
| `tools/windows/IID-STAGE3-WINDOWS-{INSTALL,VERIFY}.ps1`, `IID-S4-R3-CANDIDATE-LOCAL-BUILD.ps1` | absent | **present** |
| `iips-platform/src/investment/cli/{install-verified-dataset,verify-installed-dataset,build-s4-r3-candidate}.ts` | absent | **present** |
| `directory.issuerCount` / `securityCount` / `listingCount` / `corporateActionCount` in the discovery response | **present** | **absent** (only `rosterVersion`, `rosterDigest`, `rosterDataClass`) |
| `frontend/package.json` `iid:readiness` script | present | present |
| `iid:readiness` CLI itself | present (identical contract) | present |

So the two trees are not one superset of the other: `main` carries a richer discovery disclosure, and the
other level carries the identity/dataset tooling. §10 therefore has two forms and you run the one your
checkout supports — the tooling form first if it exists, because it is the repository's own verifier and
uses the product's own loader:

```powershell
Test-Path .\tools\windows\IID-STAGE2-IDENTITY-PROVISION.ps1
```

`True` → run **§10.2a** (existing script; preferred). `False` → run **§10.2b** (cmdlets only). Both are
read-only and both answer the same question. Do not add files to make one form work.

Record the commit you actually run (§2.1) — every capture is only meaningful against it.

### 0.5 The one-page version

If you read nothing else: (1) `npm run iid:readiness -- --data-dir C:\iips-data` and keep the output;
(2) start `npm run server:dev`, then `npm run dev`; (3) `curl.exe` the nine URLs in §6 and keep the bodies;
(4) in the browser, search Infosys / Marico / KEC on `/investment`, open the Infosys company page, then look
at `/identity-coverage` and `/investment/coverage`; screenshot each; (5) run `show-investment-chain.ts` and
keep its output; (6) run the identity check (§10.2a if the script exists, else §10.2b) and record the issuer
count. Everything is read-only. Send the `C:\iips-evidence\IID-STAGE4-<date>\` folder back; §12 says what
each outcome means, and §10.5 is the only item that needs a decision rather than a recording.

---

## 1. Preconditions, and what to do if one is missing

Run only what is already installed. **Do not** run `npm ci`, `npm install`, `git pull`, `git
checkout`, or any installer as part of this procedure.

| Precondition | Check | If missing |
|---|---|---|
| Repository at the path you normally run | `Test-Path .\frontend\package.json` → `True` | stop; this is not the right directory |
| Dependencies already installed | `Test-Path .\frontend\node_modules\.bin\tsx.cmd` → `True` | stop. Installing is a separate operation, not part of verification |
| Node version recorded | `node --version` | record whatever it prints; the readiness report prints its own |
| The transport is **not** already running | `curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:8787/api/health` → `000` | if it prints `200`, a server is already running: stop it yourself or reuse it and say so in the evidence |
| The UI is **not** already running | same check on `http://127.0.0.1:5173/` | as above |

`IIPS_DATA_DIR` on the designated host is recorded as `C:\iips-data` (`IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md` §11, `IID-STAGE-2-READINESS-REASSESSMENT-2026-11-14.md` §3). **Confirm it, do not
assume it** — §2.2 records whether the variable is defined, and §10.2a/§10.2b measure the directory it names, both without printing a value.

---

## 2. Step 1 — record the state you are verifying (read-only, ~1 minute)

Open **Windows PowerShell 5.1**. Create the evidence directory **outside** the repository and outside the
data domain, so nothing this procedure does can dirty a checkout or touch `C:\iips-data`:

```powershell
$Ev = 'C:\iips-evidence\IID-STAGE4-20261116'
New-Item -ItemType Directory -Force -Path $Ev | Out-Null
$Utf8 = New-Object System.Text.UTF8Encoding($false)
```

`$Utf8` is reused below so every file is written UTF-8 **without** a BOM, and no file is re-encoded.

### 2.1 Checkout identity

```powershell
cd C:\path\to\iips-review-recovered    # your own checkout; substitute it
$Repo = (Get-Location).Path
[IO.File]::WriteAllText("$Ev\01-checkout.txt", "$Repo`r`n" + (git rev-parse HEAD) + "`r`n" + (git status --porcelain), $Utf8)
git rev-parse --short HEAD
node --version
```

### 2.2 Process environment, names only

```powershell
$Names = 'IIPS_DATA_DIR','IIPS_NP04_DATABASE_PATH','IIPS_REPORTS_OWNER_PATH','IIPS_OWNER_CONTEXT_PATH','IIPS_G2_IPC_ENDPOINT','IIPS_G3_IPC_BINDING_PROVISIONED','IIPS_LOCAL_PERSONAL_USE','EXEC_TRANSPORT_PORT'
$Lines = foreach ($n in $Names) { $v = [Environment]::GetEnvironmentVariable($n); "$n`t" + $($null -ne $v -and $v.Trim().Length -gt 0) }
[IO.File]::WriteAllText("$Ev\02-environment-names.txt", ($Lines -join "`r`n"), $Utf8)
$Lines
```

This prints `True`/`False` per name and **never** a value. Also record whether a `.env.local` exists and
which keys it defines — again names only, never values:

```powershell
foreach ($f in "$Repo\.env.local","$Repo\frontend\.env.local") {
  if (Test-Path $f) {
    $keys = (Get-Content $f) | Where-Object { $_ -match '^\s*[A-Za-z_][A-Za-z0-9_]*\s*=' } | ForEach-Object { ($_ -split '=')[0].Trim() }
    [IO.File]::AppendAllText("$Ev\02-environment-names.txt", "`r`n$f`r`n" + ($keys -join "`r`n"), $Utf8)
  }
}
```

**Why this matters.** The readiness diagnostic reads the environment of the process it runs in. If the
variables live in `.env.local`, they are loaded by `npm run server:dev` but **not** by
`npm run iid:readiness` — verified: the `iid:readiness` script is `tsx server/investment/cli/iid-readiness.ts`
with no `--env-file-if-exists` flags, unlike `server:dev`. A readiness run from a shell without those
variables therefore reports everything as absent even when the running server is fully configured. §3
handles this explicitly, and §5 measures the *served* truth regardless.

---

## 3. Step 2 — the IID readiness check (the exact command)

From `frontend`:

```powershell
cd "$Repo\frontend"
```

### 3.1 Human-readable report, pinned to the data domain

```powershell
$DataDir = 'C:\iips-data'
npm run iid:readiness -- --data-dir $DataDir 2>&1 | Tee-Object -FilePath "$Ev\03-readiness.txt"
```

### 3.2 Machine-readable, for the record

The same run in JSON. Invoke the script directly rather than through `npm run`, because `npm` writes its
own banner (`> @iips/v3-frontend@0.1.0 iid:readiness` and the echoed command) **to stdout**, so a captured
`npm run … --json` is not parseable JSON. Verified in this session: `npx tsx server/investment/cli/iid-readiness.ts --json` emits the object as its first byte; `npm run … -- --json` emits two banner lines first.

```powershell
$Json = (npx tsx server/investment/cli/iid-readiness.ts --json --data-dir $DataDir 2>$null | Out-String)
[IO.File]::WriteAllText("$Ev\03-readiness.json", $Json, $Utf8)
$Json.Substring(0, 1)   # must print { — anything else is not a JSON capture
```

If you prefer to keep the `npm` form for consistency, capture it as text rather than JSON and say so — do
not trim or paste the banner away and call the result machine-clean.

### 3.3 Strict exit code

```powershell
npm run iid:readiness -- --strict --data-dir $DataDir > $null 2>&1
[IO.File]::WriteAllText("$Ev\03-readiness-exit.txt", "strict exit code: $LASTEXITCODE", $Utf8)
"strict exit code: $LASTEXITCODE"
```

**Expected exit codes, and what they mean.** Verified by running the same script in this session:

| Exit | Meaning |
|---|---|
| `0` without `--strict` | a report was produced. **It does not mean ready.** The default exit is 0 even when dependencies are outstanding, because this is an inventory, not an operation |
| `1` with `--strict` | at least one read-path dependency is outstanding. On a host where IPD's binding is absent this is the **expected, correct** answer, not a fault |
| `2` | the invocation was wrong (bad flag, missing `--data-dir` value) |

**If the report contradicts the running server.** If §2.2 shows the variables live in `.env.local`, re-run
§3.1 in a shell that carries the same values, so the diagnostic describes the same configuration the server
uses. Do **not** print the values while doing this; set them in the shell the way §4.1 sets them. The
diagnostic itself never prints a value, a path or a stack trace — its output is safe to attach to a review.

**Record in the evidence file which of the two situations applied**, because a readiness report that
describes a different environment from the server is not evidence about the server — the diagnostic says
this itself: *"An absent setting here is NOT evidence about any other host."* The same applies to a
different process on the same host.

### 3.4 The eight findings, and the owner of each

Verify the report contains these ids, and copy the `reason` for each into your evidence notes. Do not
"fix" any of them during verification.

| Finding id | Gates | Owner of the next action |
|---|---|---|
| `identity-files` | IID-01/02/03 | user host — the three governed JSON files under `<IIPS_DATA_DIR>\investment\identity` |
| `reports-owner-context` | IID-01/03 | user host — `IIPS_REPORTS_OWNER_PATH` → the carrier **file** |
| `np04-assessment-store` | IID-01/03 | user host — `IIPS_NP04_DATABASE_PATH`, absolute, outside Git |
| `owner-context-carrier` | IID-02 | user host — the F-3 carrier (`IIPS_OWNER_CONTEXT_PATH`), a **different** file and pair from the Reports carrier |
| `ipd-binding-precondition` | IID-02 | **IPD** — IPD provisions the binding; only then may the operator set the declaration |
| `ipc-endpoint` | IID-02 | **IPD** listening; user host sets `IIPS_G2_IPC_ENDPOINT` |
| `fundamentals-dataset` | IID-01/03 | user host — `<IIPS_DATA_DIR>\investment\dataset` |
| `local-personal-use-enablement` | IID-02 write path | user host — a condition, excluded from read-path readiness |

Two things the report does **not** prove, and neither should be read into it: a present database file is
not a populated one (`DATABASE_FILE_PRESENT_CONTENT_UNVERIFIED`), and a resolved endpoint is not a live
peer. §6 and §7 test both against the application instead.

---

## 4. Step 3 — start the API transport (existing script)

Open a **second** PowerShell window for the server, so its console stays readable.

### 4.1 Start it

Set only the variables that §2.2 showed are in use. If they are already in `.env.local`, skip the `$env:`
lines entirely — `npm run server:dev` loads them. Otherwise, set the *same* variables here:

```powershell
cd "$Repo\frontend"
$env:IIPS_DATA_DIR = 'C:\iips-data'
# only if the host already uses these — do not invent paths:
# $env:IIPS_NP04_DATABASE_PATH = '<the absolute path already in use>'
# $env:IIPS_REPORTS_OWNER_PATH = '<the carrier file already in use>'
# $env:IIPS_G2_IPC_ENDPOINT   = '\\.\pipe\iips-user-portfolio-v1'
# $env:IIPS_G3_IPC_BINDING_PROVISIONED = 'true'   # only after IPD confirms the binding

npm run server:dev 2>&1 | Tee-Object -FilePath "$Ev\04-transport-console.txt"
```

Wait for `Executive transport listening on 127.0.0.1:8787`. That line is the only startup success signal;
`/api/health` is **not** a readiness check — it answers a static `ok`.

### 4.2 Confirm the transport answers

From the **first** window:

```powershell
curl.exe -s -o "$Ev\04-health.json" -w "health: %{http_code}`n" "http://127.0.0.1:8787/api/health"
```

`200` means the process is up. Nothing more.

---

## 5. Step 4 — start the UI (existing script)

Third window:

```powershell
cd "$Repo\frontend"
npm run dev 2>&1 | Tee-Object -FilePath "$Ev\05-vite-console.txt"
```

Wait for `Local: http://localhost:5173/`. Vite proxies `/api` → `http://localhost:8787`, so **the two ports
must match**: if §4.1 used a non-default `EXEC_TRANSPORT_PORT`, the proxy target in `vite.config.ts` no
longer matches and every screen will show its error state. Leave the default `8787`.

---

## 6. Step 5 — capture the HTTP answers (before touching the browser)

This is the durable evidence. It is independent of what a screenshot happens to show, and it can be
diffed later.

```powershell
$Base = 'http://127.0.0.1:8787'
$AsOf = (Get-Date).ToString('yyyy-MM-dd')
$Log  = "$Ev\06-http-status.txt"
[IO.File]::WriteAllText($Log, "base=$Base asOf=$AsOf`r`n", $Utf8)

$Reqs = @(
  @{ n = '06-01-companies-Infosys'; u = "$Base/api/investment/companies?q=Infosys" },
  @{ n = '06-02-companies-Marico';  u = "$Base/api/investment/companies?q=Marico" },
  @{ n = '06-03-companies-KEC';     u = "$Base/api/investment/companies?q=KEC" },
  @{ n = '06-04-companies-CIN';     u = "$Base/api/investment/companies?q=L85110KA1981PLC013115" },
  @{ n = '06-05-companies-ISIN';    u = "$Base/api/investment/companies?q=INE009A01021" },
  @{ n = '06-06-identity-coverage'; u = "$Base/api/investment/coverage?asOf=$AsOf" },
  @{ n = '06-07-investment-coverage'; u = "$Base/api/investment/coverage/investment?asOf=$AsOf" },
  @{ n = '06-08-company-Infosys';   u = "$Base/api/investment/company/IN:CIN:L85110KA1981PLC013115" },
  @{ n = '06-09-html-coverage';     u = "$Base/investment/coverage?asOf=$AsOf" },
  @{ n = '06-10-identity-html';     u = "$Base/identity-coverage?asOf=$AsOf" }
)

foreach ($r in $Reqs) {
  $code = curl.exe -s -o (Join-Path $Ev ($r.n + '.out')) -w '%{http_code}' $r.u
  [IO.File]::AppendAllText($Log, "$($r.n)`t$code`r`n", $Utf8)
  Write-Host "$($r.n) -> $code"
}
Get-Content $Log
```

### 6.1 How to read each answer

The expected shapes below were produced in this session by running the same code against a data directory
holding only the Infosys identity files and no dataset — they are the **contract**, not a Windows result.

| Capture | Normal answer | What it proves | What it does **not** prove |
|---|---|---|---|
| `06-01`…`06-03` companies (name) | `200`, one match each: `legalName`, `issuerId`, `cin`, `equityIsin`, `sector`, `matchedBy: "LEGAL_NAME"` — **or** `503 identity-sources-unavailable` with `issues[].code` per file | the roster parsed and a name selected a governed record, or exactly which file did not load | that the name *is* the identity — `matchedBy` says how it was found; and a `503` is not "no such company" |
| `06-04` CIN, `06-05` ISIN | `200`, same issuer, typically `matchedBy: "IDENTIFIER"` | the governed resolver path works on a real identifier | nothing about a holding |
| `06-06` identity coverage | `503 identity-sources-unavailable` (files missing) **or** `503 observation-sources-unavailable` (files fine, holdings/watchlist surfaces unavailable — the observed case here, with `detail` naming `holdings/broker-preview/watchlist`) | fail-closed behaviour is correct in both states, and which of the two causes applies | that "no company exists". A 503 is a *read that could not be validated* |
| `06-07` investment coverage | `200`, `dataset.datasetClass`, `dataset.issuers`, `measuredSectors`/`13`, `counts`, `statusLine` | the dataset's own position, computed without the identity files | anything about identity |
| `06-08` company assessment chain | `200` with `head` (reportId, versionCount, payloadDigest, adequacy) — **or** `503 owner-context-unavailable` / `503 investment-persistence-unavailable` / `404 investment-artifact-not-found` | an honest, fixed refusal shape when a precondition is missing; a real chain when one is stored | that a `404` means "never assessed" — it means no version exists for that scope in that store |
| `06-09` server-rendered **investment** coverage HTML | `200 text/html`, no script: `datasetClass`, issuer count, sectors measured of 13, outstanding sectors, `statusLine`, one row per issuer — **or** `503` investment-worded HTML (`Investment coverage is unavailable`, naming the dataset) if the dataset cannot be read | the JS-free page renders the **investment** capability from the dataset, without the identity files | anything about identity coverage; and it is not the SPA's own bundle — it is the server's rendering of the same read model |
| `06-10` server-rendered **identity** coverage HTML | `503` fail-closed HTML with `issues[].code` per file (`IDENTITY_SOURCE_MISSING`) **or** `200` with the identity report once the files validate | the identity capability keeps its own JS-free view, still fail-closed | that identity coverage is unavailable to the SPA — the SPA shows the same JSON read |

Note in your evidence which branch of `06-06` you got, because the two have completely different next
actions: the first is a host file problem, the second is the IPD-owned observation surfaces.

---

## 7. Step 6 — the browser checks, in order

Open `http://localhost:5173/`. Do them in this order; each has its own screenshot.

### 7.1 Company identification — the discovery panel (`/investment`)

1. Go to `http://localhost:5173/investment`.
2. Find the form labelled **"Find a company"** — a field "Company name or identifier" with placeholder
   `Company name, ISIN, CIN or NSE:SYMBOL` and a **Find company** button (the button stays disabled until
   two characters are typed).
3. Type **`Infosys`**, press **Find company**.
4. Expect one row in a table captioned *Governed companies matching "Infosys" (1)*, with columns
   **Company** / **Issuer identity** / **Sector** / **Matched by** / **Assessment** / **Open**: Infosys
   Limited, Technology, *Matched by* `LEGAL_NAME`, issuer identity `IN:CIN:L85110KA1981PLC013115`.
   Screenshot → `07-01-discovery-infosys.png`.
5. Repeat for **`Marico`** and **`KEC`**. Screenshots → `07-02`, `07-03`.
6. Now search the identifiers: **`L85110KA1981PLC013115`** and **`INE009A01021`**. The same company must
   come back, now with *Matched by* reading the identifier kind. Screenshot → `07-04-discovery-identifier.png`.
7. Note the *Assessment* column verbatim. `UNKNOWN` there is a statement that the assessment store or owner
   context was not observed — **not** that the company was never assessed, and not an error to clear.

**The acceptance point is narrow and checkable:** the identifier the browser shows must be the one the
roster record carries, verbatim — the same `IN:CIN:L85110KA1981PLC013115` that `06-01` returned. If the
page ever shows a company whose identifier you cannot find in `06-01`, stop: that is a finding, not a
cosmetic issue.

**Do not infer qualification from presence.** A company appearing here — or its assessment badge reading
anything — is not a statement that its data is current or fit. `O1` item 3 records exactly that.

### 7.2 The assessment chain (`/investment/company/IN:CIN:L85110KA1981PLC013115`)

1. Click the Infosys match, or navigate directly to
   `http://localhost:5173/investment/company/IN:CIN:L85110KA1981PLC013115`.
2. One of three things will happen, and each is a distinct result:
   - **A chain renders.** Read off: `reportId`, version count, adequacy, `dataAsOf`/`knownAsOf`, the
     withheld methods **with their reasons**, and the dataset identity. Screenshot.
     If this is the store written on 2026-11-15, the values must match these — they are
     **operator-reported** from `IID-NP04-FIRST-INFOSYS-PERSISTENCE-COMPLETION-2026-11-15.md` §4, recorded
     as supplied and never recomputed by Arena: report id
     **`6b6e2316-d958-4187-9700-c47984a9a10a`**, artifact version **1**, version count **1**, payload digest
     **`f80c25de6025aa6e38f64b6b303d78b4a5657ef39a44c863c625b0041f683084`**, dataset version
     **`sha256:bdfb2527389d1e9701dd87125f053ee6197e286fa7602bc6a558e4c7fee0504b`**, adequacy / quality
     **`SUFFICIENT / MATERIAL_CONCERNS`**, confidence **`0.3210`**. Record agreement or disagreement per
     field; a disagreement is a finding, and `SUFFICIENT / MATERIAL_CONCERNS` is not a freshness or
     source-rights closure.
   - **`503` state page.** The page names a precondition (owner context / persistence). Screenshot and
     record which one.
   - **`404` state page.** No version exists for that scope in that store. Screenshot.
3. Do **not** fix a 503 or a 404 during verification. Do not retry into a different store, do not read the
   SQLite file directly, and do not treat an empty page as an absent assessment.

### 7.3 Identity coverage (`/identity-coverage`)

Open `http://localhost:5173/identity-coverage`. Screenshot → `07-06-identity-coverage.png`.

Expect one of: the honest unavailable state naming the missing observation surfaces (the normal state until
IPD's binding and peer are live), or — only if those are live — a classified table with counts by state and
reason. **A `503` here is not "no companies are installed".** The companies panel in §7.1 already answered
that question.

### 7.4 Investment coverage (`/investment/coverage`)

Open `http://localhost:5173/investment/coverage`. Screenshot → `07-07-investment-coverage.png`.

Read off and record: `datasetClass`, issuer count, sectors measured of 13, outstanding sectors, and the
status line. This page must answer from the dataset **without** requiring the identity files; if it shows
an identity error instead, that is the separation defect returning and is a finding.

### 7.5 The JS-free coverage views (`G-10`) — corrected 2026-11-17; verify, do not record an exception

**Amended 2026-11-17.** The instruction this section previously carried — *"returns the fail-closed
identity-unavailable HTML … Record it; it is not a defect this procedure introduces or resolves"* — is
**withdrawn**, because `G-10` has been corrected in the product. Each capability now has its own JS-free page,
at its own path:

| Open on the transport, scripts disabled | Expected | If it is not |
|---|---|---|
| `http://127.0.0.1:8787/investment/coverage` | `200`, `<h1>Investment coverage</h1>`, no `<script`, dataset figures (or `503` *Investment coverage is unavailable* naming the dataset) | an identity error here is **the separation defect returning** — a finding, not an expected state |
| `http://127.0.0.1:8787/identity-coverage` | the identity page: the identity report once the files validate, otherwise `503` fail-closed with `issues[].code` per file | a `200` that reports coverage while the roster is missing would be worse than the old defect |

Screenshot the investment page → `07-08-html-coverage.png`. Read off `datasetClass`, issuer count, sectors
measured of 13, outstanding sectors and the status line, and check them against the `06-07` JSON body from
§7.4: the page is the server's rendering of the same read, so the two must agree figure for figure.

Both pages are outside `/api`, so the Vite origin does not proxy them (T-1 in
`CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13.md`): address the transport port directly, as the
captures in §7.4 do.

### 7.6 Change intelligence (`/investment/change-intelligence`) — optional

Only informative at this stage. With one stored version there is nothing to compare; a
`404 change-not-found` is the correct refusal. Screenshot only if it renders something unexpected.

---

## 8. Step 7 — independent read-back in a separate process

This is what distinguishes persistence from caching. From the first window, **while the transport is
running** (it does not matter which process reads; it only matters that it is not the one that wrote):

```powershell
cd "$Repo\frontend"
npx tsx server/investment/cli/show-investment-chain.ts --issuer IN:CIN:L85110KA1981PLC013115 2>&1 | Tee-Object -FilePath "$Ev\08-chain-readback.txt"
```

This CLI is read-only and prints identity, digests and counts — never the payload body. Its documented
flags are `--issuer` (required), `--db`, `--owner-carrier` and `--version` (a report id, to read one
version's metadata). It honours `IIPS_NP04_DATABASE_PATH` and `IIPS_REPORTS_OWNER_PATH` from the
environment; if those are not set in this shell, pass the paths explicitly instead of exporting them:

```powershell
npx tsx server/investment/cli/show-investment-chain.ts --issuer IN:CIN:L85110KA1981PLC013115 --db "<absolute db path>" --owner-carrier "<carrier file path>" 2>&1 | Tee-Object -FilePath "$Ev\08-chain-readback.txt"
```

**Comparing §7.2 with §8 is the point.** The browser and this CLI must report the *same* `reportId`,
`versionCount` and `payloadDigest`. Agreement across two independent readers is the persistence evidence;
disagreement is a finding to record, not to reconcile by hand.

If it prints `OWNER_CONTEXT_UNAVAILABLE` or `PERSISTENCE_UNAVAILABLE`, that is the same fail-closed shape
the transport uses, and it tells you the store is not configured for *this shell* — not that the chain is
absent.

---

## 9. Step 8 — stop cleanly

```powershell
# in the UI window:  Ctrl+C
# in the transport window:  Ctrl+C
curl.exe -s -o NUL -w "transport after stop: %{http_code}`n" http://127.0.0.1:8787/api/health
```

`000` confirms it stopped. Stopping a process does not move, delete or re-initialise the database.

---

## 10. The 2,388 installed companies versus the three `O1` names

### 10.1 What the two numbers are

| Number | Where it comes from | What it is |
|---|---|---|
| **3** | `IID-O1-IDENTITY-GOVERNANCE-PA-DECISION-2026-11-16.md` §3.1 | the owner's **decided** initial governed population: Infosys Limited, Marico Limited, KEC International Limited — "three issuers, and no others" |
| **2,388** | IPD `IIPS-W04-IDENTITY-PROVISIONING-HOST-COMPLETION-RECONCILIATION-2026-11-14.md` §2.2, an **operator-reported host fact**, not an Arena observation | the issuers in the roster **reported installed** as IRR's identity sources, exported from IPD's P04 authenticated universe under IPD approval `W04-D1-20261114-01` |

These are answers to two different questions, and the difference between them is real and is the owner's to
settle. `O1` records a population; the installed file is what the application reads. §10.2a/§10.2b measure
the second; §10.5 sets out the choice.

### 10.2a Preferred: the existing verifier (`IID-STAGE2-IDENTITY-PROVISION.ps1 -VerifyOnly`)

If §0.4's `Test-Path` was `True`, this is the command. It is the repository's own Stage 2 verifier, it is
**read-only**, and in `-VerifyOnly` mode it ignores the source bundles entirely and re-reads whatever is
already installed through the product's own loader.

```powershell
cd $Repo
powershell -ExecutionPolicy Bypass -File .\tools\windows\IID-STAGE2-IDENTITY-PROVISION.ps1 `
  -VerifyOnly -DataRoot 'C:\iips-data' 2>&1 | Tee-Object -FilePath "$Ev\09-verify-only-transcript.txt"
```

Read these four things out of the transcript and into your notes:

| Transcript line | Meaning |
|---|---|
| `RESULT  VERIFY-PASS` / `VERIFY-FAIL` | the script's own verdict, from its Layer-1 checks **and** the provisioner's |
| `verification.issuers` / `securities` / `listings` / `corporateActions` | **the count you are looking for** — 3 or 2,388 or something else |
| `verification.rosterVersion` | the loader's roster version, which *is* the roster's content digest |
| `probe.observed` / `probe.resolved` / `probe.unresolved` | whether declared identifiers actually resolve through the production resolver |

Notes, all verified in this session by running the same commands against probe directories:

- The script prints `RESULT  VERIFY-FAIL` if any non-informational check fails, and `FAIL-VERIFY_ONLY` only if
  the run threw. **`VERIFY-FAIL` is a real possibility on a wide set, and the likely cause is named in the
  script's own source:** it asserts `merged-issuers == source-set count` — one issuer per admitted bundle —
  and that assertion is skipped only in `-VerifyOnly`. What is *not* skipped is the existing-set
  cross-check set and the probe. So read the failing check ids verbatim rather than assuming: a failure
  naming the population is a *confirmation* that the installed set is not the three-issuer set, not a broken
  installation; a failure naming a file hash or the loader is a real file problem and belongs in §10.3.
- `probe` is on by default; pass `-NoProbe` only if the platform's `node_modules` is missing on the host. An
  unprobed run is not evidence of resolution — the script says so itself, and that caveat stands.
- The script needs `iips-platform\node_modules\tsx`. If it reports `tsx-runner-present` failed, it will tell
  you the command to run — **do not run it during verification**; record it and move to §10.2b.
- It writes no file of its own; `Tee-Object` above is what preserves the transcript. (`-OutFile` does not
  exist on this script — do not pass it.)

### 10.2b Fallback: OS cmdlets only (works on any checkout)

Use this if the script is absent (§0.4), or if `tsx` is unavailable on the host. It reads the same three
files with Windows' own tooling, so it does not depend on the product's code at all — which also makes it a
useful independent cross-check of §10.2a.

```powershell
$IdDir = Join-Path $DataDir 'investment\identity'   # $DataDir from §3.1, normally C:\iips-data

$Files = Get-ChildItem $IdDir | Select-Object Name, Length | Format-Table -AutoSize | Out-String
[IO.File]::WriteAllText("$Ev\09-identity-files.txt", $Files, $Utf8)

$Hashes = Get-FileHash "$IdDir\eligible-roster.json", "$IdDir\listing-map.json", "$IdDir\corporate-actions.json" -Algorithm SHA256 |
  Select-Object Hash, Path | Format-List | Out-String
[IO.File]::WriteAllText("$Ev\09-identity-hashes.txt", $Hashes, $Utf8)

$r  = [IO.File]::ReadAllText("$IdDir\eligible-roster.json")  | ConvertFrom-Json
$lm = [IO.File]::ReadAllText("$IdDir\listing-map.json")      | ConvertFrom-Json
$ca = [IO.File]::ReadAllText("$IdDir\corporate-actions.json") | ConvertFrom-Json
[IO.File]::WriteAllText("$Ev\09-identity-counts.txt",
  "rosterLabel: $($r.rosterLabel)`r`nissuers: $($r.issuers.Count)`r`nsecurities: $($r.securities.Count)`r`nlisting entries: $($lm.entries.Count)`r`ncorporate actions: $($ca.actions.Count)`r`n",
  $Utf8)
Get-Content "$Ev\09-identity-counts.txt"
```

`Get-ChildItem`, `Get-FileHash` and `[IO.File]::ReadAllText` are reads. **Nothing above writes to
`C:\iips-data`.** Note `Out-File -Encoding UTF8` is deliberately **not** used: in PowerShell 5.1 it emits a
BOM, and these captures are meant to be diffable and pasteable. `[IO.File]::WriteAllText` with the `$Utf8`
encoder from §2 writes UTF-8 without one.
Do not open the identity JSON in an editor that might save it, and do not "clean up" whitespace.

### 10.3 Identify *which* set it is, by content digest

Identity files are content-addressed — `rosterVersion` *is* the sha256 of the canonical roster — so a digest
identifies the set without ambiguity. Two candidate identities are on record:

| Candidate | `eligible-roster.json` bytes | sha256 of the file | Loader `rosterVersion` |
|---|---|---|---|
| **The three-issuer `O1` set** (merge of the three admitted bundles) | **1,992** | **`08a5d29cbc6ba01729d4c05488d98ec89ff4027825f51ae5e3bd1a683140ef24`** | `sha256:e910728a1bfa1593880d0880c1cb27952cfd155efd61d3d365bbb6e750a60fa3` |
| **The 2,388-issuer P04 export** (as reported installed) | **1,350,516** | **`078e89cc…`** — prefix only | not on record; record what §10.2a prints |

How those values were established, so they can be trusted as comparanda:

- The three-issuer row was **re-derived in this session**, twice, by two different existing paths: the
  provisioner's own `--preflight` (which printed `candidate.digest 08a5d29c… 1992 eligible-roster.json`), and
  separately `readIdentitySourceSet` → `mergeIdentitySourceSets` → `loadIdentitySourcesFromDir`. Then
  `--verify-only` over the written bytes reported `verification.issuers 3`,
  `verification.rosterVersion sha256:e910728a…`, `probe.observed 8 / resolved 8 / unresolved 0`. Every value
  agrees with `IID-STAGE2-WINDOWS-HOST-PROVISION-EVIDENCE-2026-11-14.md` §4.5, which listed them as
  **predicted** and not host-observed. They are reproducible, not observed.
- The 2,388 row is quoted from IPD's host-completion record as reproduced in `O1` §7.2: an
  **operator-reported host fact** giving the size (1,350,516 bytes) and a **truncated** digest
  (`078e89cc…`). No IRR document holds the full hash, so compare **size and prefix** only, and let §10.2a/§10.2b
  supply the full value. Arena did not read that host. Do not treat an inferred full hash as recorded.

Three outcomes:

| Your `eligible-roster.json` | Interpretation | Next |
|---|---|---|
| `08a5d29c…`, 1,992 B | the installed set is the three-issuer `O1` population | §10.4 confirms the three resolve; nothing to settle |
| `078e89cc…`, 1,350,516 B | the installed set is the 2,388 P04 export — wider than `O1` | §10.5: an owner decision, not a verification step |
| anything else | a third state exists that no record describes | record digest, size and counts, stop, report it. Do **not** normalise it |

### 10.4 Are the three `O1` names present, and do they resolve?

`probe` in §10.2a already answers "does a declared identifier resolve". This answers "is *my* three in the
file" — the membership test, by governed identifier only:

```powershell
$O1 = @(
  @{ name = 'Infosys Limited';            cin = 'L85110KA1981PLC013115'; isin = 'INE009A01021' },
  @{ name = 'Marico Limited';             cin = 'L15140MH1988PLC049208'; isin = 'INE196A01026' },
  @{ name = 'KEC International Limited';  cin = 'L45200MH2005PLC152061'; isin = 'INE389H01022' }
)
$Found = foreach ($i in $O1) {
  $hit = @($r.issuers | Where-Object { $_.cin -eq $i.cin -or $_.equityIsin -eq $i.isin })
  $ids = ($hit | ForEach-Object { "$($_.issuerId) [$($_.legalName)] [$($_.status)]" }) -join '; '
  "$($i.name)`tfound=$($hit.Count -gt 0)`t$ids"
}
[IO.File]::WriteAllText("$Ev\09-o1-membership.txt", ($Found -join "`r`n"), $Utf8)
$Found
```

This uses `$r` from §10.2b; if you ran only §10.2a, load it first:

```powershell
$r = [IO.File]::ReadAllText((Join-Path $DataDir 'investment\identity\eligible-roster.json')) | ConvertFrom-Json
```

The three identifiers above are the ones the admitted bundles themselves carry — `IN:CIN:L85110KA1981PLC013115`
Infosys / `IN:CIN:L15140MH1988PLC049208` Marico / `IN:CIN:L45200MH2005PLC152061` KEC, each `status=ELIGIBLE`
— read from the bundles in this session, not reconstructed. A row reading `found=True` with those ids and
`status=ELIGIBLE` is the answer: the company is identifiable in the set that is actually installed,
whichever set that is. `found=False` is the finding: that issuer cannot be identified at all, and no amount
of searching in the UI will change it.

### 10.5 If the installed set is wider than `O1` — the decision, and the two wrong turns

`O1` records the population as three "and no others", while reserving additions to the owner (§3.1 item 4).
An installed set of 2,388 is therefore **wider than the population of record**, and that is a scope fact the
owner must settle. It is not a defect in the application, and nothing in verification can settle it.

The owner's two real options:

| Option | What it means | Consequence |
|---|---|---|
| **Accept the wider population** | record the addition through `O1`'s own addition limb, naming the IPD-exported set and its digest | one owner act; the 2,388 set stays installed and nothing is re-provisioned |
| **Restore the three-issuer set** | re-provision from the three admitted bundles with the existing Stage 2 script | a **write** to the identity directory — a separate ordinary operation, not verification |

**Neither option is part of this procedure.** Both are owner acts, and the second writes to the data
domain. If the owner chooses it later, the tooling already exists and needs nothing new:

```powershell
# NOT part of this procedure. Shown only so the owner knows the existing path and writes no new one.
# Step 1 - READ-ONLY preflight, the script's default: what would change, with every digest.
powershell -ExecutionPolicy Bypass -File .\tools\windows\IID-STAGE2-IDENTITY-PROVISION.ps1 -DataRoot 'C:\iips-data'
# Step 2 - the publication itself is -Execute, plus the confirmation phrase the script demands.
```

The script's own default is a read-only preflight, and `-Execute` publishes exactly one set through a
staging directory with rollback; the provisioner refuses a target that is not `<dataRoot>\investment\identity`,
refuses a synthetic-fixture source, and refuses two sources claiming one issuer. That is why the correct
action here is to **use it**, not to hand-roll a replacement — verified in this session: `--preflight` over
the three admitted bundles reported `plan.wouldChange false` / `UNCHANGED` for all three files against a
three-issuer target, and left the bytes and mtimes untouched.

**Two things that look like the second option and are not:**

1. **Hand-editing the JSON.** The roster is content-addressed: its version *is* the sha256 of its canonical
   content, and the loader rejects the whole set on any structural defect. Editing it by hand produces a set
   with no provenance and silently changes every identity reference. Do not do it.
2. **Running the IPD exporter again to "get back to three".** That tool exports the 2,388-record universe; it
   cannot produce the three-issuer merge. Verified: IPD `scripts/provision-irr-identity-sources.mjs` offers
   `generate | validate | review | check-approval | install | verify-endpoint`, all over the P04 export.

**Where the three-issuer machinery lives, per checkout.** `iips-platform/src/investment/cli/provision-identity.ts`
and `tools/windows/IID-STAGE2-IDENTITY-PROVISION.ps1` are on this branch and on PR #562's head (`f98732e1`),
and **not on `main`** (`064195397`). On a `main` checkout today the three-issuer set cannot be re-provisioned
at all. Recording that is the correct outcome; building a replacement would duplicate an existing tool and is
out of scope.

### 10.6 What the number does **not** explain

Keep these separate, because a wide roster invites the wrong inference:

- **Identity coverage's `503` is not caused by the population size.** Verified in this session: with the
  identity files loading cleanly, `/api/investment/coverage` still answers
  `503 observation-sources-unavailable`, naming `holdings/broker-preview/watchlist`. The blockers are the
  IPD-owned binding and peer, not the roster.
- **A 2,388-issuer roster does not give 2,388 assessments.** Assessment versions exist per scope; adding
  issuers to the roster creates no assessment, no dataset row and no qualification.
- **Discovery caps its answer at 25 matches** with `truncated: true` when more matched. A broad query on a
  wide roster is a list, not an export, and truncation is disclosed rather than silent.
- **Population is not qualification.** `O1` item 3 stands for every issuer in the file, including the
  2,385 that `O1` does not name.

---

## 11. Evidence inventory — what to keep, and where

Save everything under **`C:\iips-evidence\IID-STAGE4-<date>\`**, outside the repository and outside
`C:\iips-data`. Nothing there is committed; nothing there is in the data domain.

| File | Produced by | What it evidences |
|---|---|---|
| `01-checkout.txt` | §2.1 | the exact commit, tree state and Node version the observations belong to |
| `02-environment-names.txt` | §2.2 | **which** settings were defined — names only, never values |
| `03-readiness.txt` / `.json` / `03-readiness-exit.txt` | §3 | `R-1`: the host readiness capture, all eight findings, and the `--strict` exit code |
| `04-transport-console.txt`, `04-health.json` | §4 | the transport started, on which port, with which configuration |
| `05-vite-console.txt` | §5 | the UI started and its proxy target |
| `06-http-status.txt`, `06-0*.out` | §6 | `R-2`: the served-surface captures, per route, with status codes and full bodies |
| `07-*.png` | §7 | what the owner actually saw, per surface |
| `08-chain-readback.txt` | §8 | a separate process reading the stored chain — persistence, not caching |
| `09-verify-only-transcript.txt` | §10.2a | the repository's own verifier on the installed set: `RESULT`, record counts, `rosterVersion`, probe results |
| `09-identity-files.txt`, `09-identity-hashes.txt`, `09-identity-counts.txt`, `09-o1-membership.txt` | §10.2b/§10.4 | independent OS-level measurement: which files, their hashes and sizes, and whether the three `O1` issuers are in the set |

Two rules for handling this directory: it is **local evidence**, and it may be pasted into a review record,
but the `06-0*.out` bodies can contain issuer names and the `.out` for coverage can contain a filesystem
path in its `issues[].subject` (`CPII-01` §8, finding `O-1` — deliberate, so the host's resolved directory
is visible). Read a body before publishing it. Nothing here is a secret: no credential, token or key is
printed by any command above.

---

## 12. What each overall outcome means

Read only the row that matches what you observed. None of them is decided in advance.

| Observed | Then | And it is still **not** |
|---|---|---|
| All eight findings `[ok]`, `--strict` exit 0, chain renders, read-back agrees | a materially complete host picture — **record it**; the readiness and served captures close `R-1`/`R-2` | browser acceptance of the identity surface, which needs the IPD-owned observation surfaces |
| `identity-files` ok, `ipd-binding-precondition` / `ipc-endpoint` outstanding, identity coverage `503` | the expected intermediate state: IRR's own pieces present, IPD's not | a defect, and not something IRR can fix |
| `identity-files` missing or invalid | a host file problem — check §10.2a/§10.2b and the loader's named codes | an empty company list; discovery and coverage fail for different reasons |
| chain `404` | no assessment version exists in that store for that scope | proof that none was ever minted elsewhere |
| chain `503` | a named precondition is absent | "no data" |
| `06-07` (investment coverage) shows an identity error | the identity/investment separation has regressed | a dataset problem |
| `09-verify-only-transcript.txt` shows 2,388 issuers | the installed set is wider than `O1` — **§10.5 is the decision**, not a fix | a failure of this procedure, or of the application |

---

## 13. Boundary confirmations

| Boundary | Confirmation |
|---|---|
| **Windows verification** | **NOT CLAIMED.** Nothing here was executed on Windows; no observation in this document is a host fact |
| **New scripts or tools** | **NONE.** Every command invokes an existing npm script, CLI, endpoint or PowerShell cmdlet |
| **Installed data / identity files** | **NOT TOUCHED by design.** Every step is a read: `-VerifyOnly` (which by contract re-reads the published directory and writes nothing), `Get-ChildItem`, `Get-FileHash`, `[IO.File]::ReadAllText`, `ConvertFrom-Json`, GET/HEAD requests |
| **Re-provisioning / reinstallation / minting** | **NOT PERFORMED AND NOT AUTHORIZED HERE.** §10.5 explicitly declines to change the population |
| **IPD** | **Not modified.** IPD records are quoted read-only; the two IPD-owned dependencies are named, not acted on |
| **Other IID work** | **None started.** `O1`, NP-04 persistence, `S4-R3` freshness, `L-041`/`L-042` and the Stage 5 loop are referenced only where a command depends on them |
| **Tracker** | **No tracker section added and no `CV-CORR`/`CHG`/`V` identifier consumed.** This is a procedure, not a status change; recording a status would require an observation this document does not have |

---

## 14. Verification performed for this document

Read-only, in this session, on branch `arena/53ff9276-iips-review-recovered` at `6187092d`, and against
IRR `main` `064195397` and IPD `main` `75db511d` through the GitHub API.

| # | Check | Result |
|---|---|---|
| V1 | `iid:readiness` exists and runs | **ran it**: full report, `--strict` exit **1**, default exit **0**; eight findings present |
| V2 | Its output is paste-safe | confirmed: setting names, reason codes, booleans only; no value, no path |
| V3 | The script reads no `.env.local` | confirmed from `frontend/package.json`: `iid:readiness` has no `--env-file-if-exists` flags, unlike `server:dev` — recorded in §2.2/§3 |
| V4 | The discovery endpoint resolves a name to a governed id | **ran the transport** against a probe data directory: `GET /api/investment/companies?q=Infosys` → `200`, `IN:CIN:L85110KA1981PLC013115`, `matchedBy: LEGAL_NAME` |
| V5 | The two coverage routes fail differently, by design | **ran them**: `/api/investment/coverage` → `503 observation-sources-unavailable` (naming `holdings/broker-preview/watchlist`); `/api/investment/coverage/investment` → `200`, `datasetClass: NONE` |
| V6 | The company chain route fails closed without a carrier | **ran it**: `503 owner-context-unavailable` |
| V7 | The server-rendered coverage page is the fail-closed HTML | **ran it**: `503`, ~1.7 KB |
| V8 | The three-issuer set's canonical digests are reproducible | **re-derived** via `readIdentitySourceSet` + `mergeIdentitySourceSets` + `loadIdentitySourcesFromDir`: 1,992 B, `08a5d29c…`, `rosterVersion sha256:e910728a…` — matching the Stage 2 record's predicted values |
| V9 | The three-issuer tooling's availability per code level | confirmed by tree inspection: absent from `main` (`064195397`) and from `08411bcd`; present from `302e932949` (2026-11-14) onward on this branch, and at PR #562's head `f98732e1` |
| V10 | The served-count disclosure differs between code levels | confirmed: `directory.issuerCount` present in `main`'s `companyDirectory.ts`, absent at `08411bcd` |
| V11 | Ports and proxy | `EXEC_TRANSPORT_PORT` default `8787`; Vite `5173` with `/api` → `localhost:8787` |
| V12 | No probe residue | the temporary probe data and transport process were removed; no `.iips-data` was created in the checkout; no tracked file was modified by the probes |
| V13 | `provision-identity.ts --verify-only` is genuinely read-only | **ran it** over a three-issuer probe dir with `--probe`: `RESULT PASS`, `verification.issuers 3`, `rosterVersion sha256:e910728a…`, `probe.observed 8 / resolved 8 / unresolved 0`; `sha256sum -c` and `stat %Y` before/after both unchanged, no marker directory created |
| V14 | `provision-identity.ts --preflight` writes nothing | **ran it** over the three admitted bundles against a three-issuer target: `merge.issuers 3`, `candidate.digest 08a5d29c… 1992`, `plan.wouldChange false`, all three `UNCHANGED`; bytes and mtimes unchanged |
| V15 | The `--strict` exit code is the one §3.3 tests | **measured**: `1` via both `npm run … -- --strict` and direct `tsx … --strict`; default form exit `0` |
| V16 | `npm run … -- --json` is not parseable JSON | **confirmed**: npm's banner precedes the object on stdout, so §3.2 invokes `tsx` directly |
| V17 | The `-VerifyOnly` transcript fields §10.2a tells the owner to read | **confirmed against a real run**: `RESULT`, `verification.issuers/securities/listings/actions`, `verification.rosterVersion`, `probe.observed/resolved/unresolved` all present in the machine-readable block |
| V18 | Discovery fails closed with a per-file code when identity is absent | **ran it** against an empty data dir: `503 identity-sources-unavailable`, `issues[]` naming `eligible-roster.json` / `IDENTITY_SOURCE_…` — which is why §6.1 lists both shapes for `06-01` |

---

*End of procedure. Nothing in this document is a Windows observation. It becomes evidence only when the
owner runs it and records what the machine actually said.*
