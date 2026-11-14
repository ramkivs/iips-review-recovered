# IID Stage 2 — Windows-host identity provisioning evidence

**Date of host execution:** 2026-11-14 (operator, Windows host)
**Date of this record:** 2026-11-14 (UTC)
**Executed head:** `da4d145bf657d797a30df09d49b429595992591d` on `arena/94a53bb3-iips-review-recovered`
**Host worktree:** `C:\tmp\iips-review-recovered-iid-stage2-da4d145b` (a separate worktree; not the operator's primary checkout)
**Publication target:** `C:\iips-data\investment\identity`
**Classification:** LOCAL_SINGLE_USER_NON_PRODUCTION — evidence publication only
**Publication:** additive. PR #562 remains OPEN and UNMERGED. No prior record is replaced.

> ## Provenance of every number in this record
>
> The four result blocks below are **actual Windows-host execution output supplied by the operator**, who ran
> `tools/windows/IID-STAGE2-IDENTITY-PROVISION.ps1` on the host at commit `da4d145b`. They are **not** Arena
> Linux execution, **not** a model, and **not** a prediction. Arena has no PowerShell engine and executed
> nothing on Windows.
>
> What Arena performed on this evidence was **reconciliation against the authoritative source at this head**:
> every result token, every quoted string, the parameter surface, and — arithmetically — every one of the four
> check counts, derived from the script's own `Add-Check` call sites, their `-Class` arguments and their mode
> gates. **All four counts reconcile exactly** (§6). No number was altered to agree, and one supplied character
> count that disagrees with the source is recorded as supplied and explained (§4.1) rather than corrected.
>
> This is the host execution that `IID-STAGE-2-…` work at `617a8bae`/`da4d145b` named as outstanding. That work
> could offer only a structural conformance pass and a semantic model; §9 states precisely what each was worth
> and what this record adds.

---

## 1. Execution environment, as reported by the host

| Item | Value | How known |
|---|---|---|
| Repository | `C:\tmp\iips-review-recovered-iid-stage2-da4d145b` | Host-supplied |
| Commit | `da4d145bf657d797a30df09d49b429595992591d` | Host-supplied; **equals this head** |
| HEAD state | Detached HEAD | Host-supplied |
| Worktree status | `## HEAD (no branch)` | Host-supplied |
| Data root | `C:\iips-data` | Script default (`param [string]$DataRoot = 'C:\iips-data'`, `:113`); the host transcript's `target:` line confirms the composed path |
| Provisioner target | `C:\iips-data\investment\identity` | **Host-observed** in all four result blocks |
| PowerShell version | **NOT SUPPLIED** | §9, gap G-1 |
| Node version | **NOT SUPPLIED** | §9, gap G-1 |
| `asOf` | **NOT SUPPLIED.** `-AsOf` was not passed, so `--as-of` was not added to the invocation (`:413`) and the provisioner used its own `today()` (`cli/provision-identity.ts:158`) | §9, gap G-2 |

The worktree was created from PR #562's fetched commit. The registered worktrees after creation, as supplied:

```text
C:/tmp/iips-review-recovered                     8765860 (detached HEAD)
C:/tmp/iips-review-recovered-iid-stage2-da4d145b da4d145 (detached HEAD)
C:/tmp/iips-review-recovered-iid-stage3-0a564cdb 0a564cd (detached HEAD)
C:/tmp/iips-review-recovered-iid-stage3-2c491bc5 2c491bc (detached HEAD)
C:/tmp/iips-review-recovered-iid-stage3-a218099d a218099 (detached HEAD)
```

The three Stage 3 worktrees and the primary checkout were **preserved and not synchronised**. No existing
worktree was switched, and nothing in this record depends on their state.

---

## 2. Run 1 — dependency preflight, REFUSED (and correctly so)

The first invocation was a read-only preflight. It **refused**, exactly as designed:

```text
[FAIL] preflight
         1 precondition(s) failed: tsx-runner-present

  REFUSED: at least one precondition failed. Fix the listed precondition(s) and re-run.
  Nothing was provisioned, created, deleted or modified.

==============================================================================
  RESULT  REFUSED-PRECONDITIONS
          checks: 12 passed, 2 failed, 4 informational
          mode: PREFLIGHT   provisioner exit code: not run
          target: C:\iips-data\investment\identity
==============================================================================
  Failed checks:
    - tsx-runner-present: C:\tmp\iips-review-recovered-iid-stage2-da4d145b\iips-platform\node_modules\tsx\dist\cli.mjs  (if absent: run "npm install" inside iips-platform; this script never installs anything)
    - preflight: 1 precondition(s) failed: tsx-runner-present
  This run performed NO filesystem mutation of its own and published nothing.
  Control returns to this PowerShell session; the terminal is not closed.
```

### 2.1 Why this refusal is evidence FOR the script, not against it

A fresh worktree has no `node_modules`. The script's own contract is that it **never installs anything**
(`:284`, quoted verbatim in the host's failed-check detail), so the correct behaviour on a missing tsx runner is
to refuse before any provisioner invocation. Four properties of the refusal are load-bearing and all four are
visible in the transcript:

1. **`provisioner exit code: not run`** — the provisioner was never invoked. The gate at `:431` short-circuits
   before the authorised block at `:464`, so no `node` process started.
2. **`Nothing was provisioned, created, deleted or modified`** — and the target directory was not created
   either; the script performs no filesystem mutation of its own at any point (conformance rule R7: 0 mutating
   commands, 0 .NET write calls).
3. **The two failures are one problem, not two.** `preflight` (`:428`) is a *roll-up* check: it counts the
   non-info checks that already failed and names them. So `tsx-runner-present` is the root cause and `preflight`
   is its summary. Reading "2 failed" as two independent defects would be wrong.
4. **Control returned to the session.** No `exit`, no session-terminating command (conformance R4: 0).

### 2.2 Arithmetic reconciliation of run 1

Every `Add-Check` the script can reach before the preflight gate, with its `-Class`, under the host's conditions
(3 resolved source sets, no `-Source` parameter, target not yet holding identity files):

| # | Check id | Site | Class | Emitted |
|---|---|---|---|---|
| 1 | `mode-unambiguous` | `:263` | info | 1 |
| 2 | `repo-root` | `:271` | check | 1 |
| 3 | `provisioner-cli-present` | `:279` | check | 1 |
| 4 | `tsx-runner-present` | `:283` | check | 1 — **FAILED** |
| 5 | `node-available` | `:290` | check | 1 |
| 6 | `data-root` | `:304` | info | 1 |
| 7 | `target-is-governed-identity-dir` | `:309` | check | 1 |
| 8 | `dataset-not-targeted` | `:313` | check | 1 |
| 9 | `portfolio-store-not-targeted` | `:319` | check | 1 |
| 10 | `evidence-root` | `:327` | check | 1 |
| 11 | `source-origin` | `:336` | info | 1 |
| 12 | `source-complete <parent>` | `:361`, loop over 3 source dirs | check | 3 |
| 13 | `source-count` | `:363` | check | 1 |
| 14 | `existing-published-set` | `:390` | info | 1 |
| 15 | `existing <name>` | `:393`, loop over already-published files | info | **0** — nothing published yet |
| 16 | `no-preexisting-publication-markers` | `:398` | check | 1 |
| 17 | `preflight` | `:428` | check | 1 — **FAILED** (roll-up) |

Checks: 1+1+1+1+1+1+1+1+3+1+1+1 = **14**, of which **2 failed** → **12 passed**.
Informational: 1+1+1+1+0 = **4**.

> **Host reported 12 passed, 2 failed, 4 informational. Census derives 12 / 2 / 4. Exact.**

This reconciliation is the strongest single fact in this record. It is not a plausible-looking total: the count
of `source-complete` emissions (3), the absence of `existing <name>` emissions (0, because nothing was
published), and the split of `source-count` between its `check` site (`:363`) and its `info` site (`:367`) are
all *forced* by the total. A different script version, a different source count, or a target that already held
files would produce a different triple.

### 2.3 The remediation, and what it did not do

The operator installed the missing dependency inside the Stage 2 worktree only:

```powershell
Set-Location "C:\tmp\iips-review-recovered-iid-stage2-da4d145b\iips-platform"
npm install
```

**No identity provisioning occurred during this remediation**, and it touched no other worktree. It installed
dev dependencies into a scratch worktree's `node_modules`; it did not modify the repository, the dataset, the
portfolio store, or any committed evidence.

---

## 3. Run 2 — successful preflight

```text
==============================================================================
  RESULT  PREFLIGHT-PUBLISHABLE
          checks: 34 passed, 0 failed, 18 informational
          mode: PREFLIGHT   provisioner exit code: 0
          target: C:\iips-data\investment\identity
==============================================================================
  This run performed NO filesystem mutation of its own and published nothing.
  Control returns to this PowerShell session; the terminal is not closed.
```

`PREFLIGHT-PUBLISHABLE` is set at `:747` and is **overridden** to `PREFLIGHT-ALREADY-PUBLISHED` at `:753` when
`plan.wouldChange` is `false`. The host therefore reported the token that means *the merge was accepted, the
target is governed, and the published set WOULD change* — i.e. the target did not already hold this set. That is
consistent with the Stage 3 host evidence, which recorded `eligible-roster.json: IDENTITY_SOURCE_MISSING`.

`provisioner exit code: 0` means the provisioner itself accepted the merge of the three admitted source sets and
produced a governed plan. `This run performed NO filesystem mutation of its own and published nothing` is
printed at `:768` for every mode except EXECUTE, and is true: PREFLIGHT never enters the publication path.

### 3.1 Arithmetic reconciliation of run 2

Pre-gate emissions are identical to §2.2 except that nothing failed: **14 checks passed, 4 informational**.
Post-gate, inside `if ($authorised)` (`:464`) — `$authorised` is true in PREFLIGHT because no confirmation is
required — with `PostClass = 'info'` (`:597-600`, because mode is PREFLIGHT):

| # | Check id | Site | Class in PREFLIGHT | Emitted |
|---|---|---|---|---|
| 18 | `cli-machine-trailer-present` | `:483` | check | 1 |
| 19 | `cli-result-line-present` | `:491` | check | 1 |
| 20 | `cli-exit-code` | `:494` | check | 1 |
| 21 | `cli-mode-agrees` | `:498` | check | 1 |
| 22 | `cli-target-agrees` | `:502` | check | 1 |
| 23 | `cli-governed` | `:506` | check | 1 |
| 24 | `no-refusals` | `:516` | check | 1 |
| 25 | `cli-reported-every-source-digest` | `:524` | check | 1 |
| 26 | `crosscheck source <path>` | `:539`, loop over the 9 `source.digest` trailer lines (3 sets × 3 files) | check | **9** |
| 27 | `candidate <fileName>` | `:546`, loop over the 3 `candidate.digest` trailer lines | info | 3 |
| 28 | `crosscheck published <fileName>` | `:563`, loop over the `published.digest` trailer lines | check | **0** — nothing published |
| 29 | `published-equals-candidate <name>` — Layer 1's own `Get-FileHash` of each published file | `:579` | check | **0** |
| 30 | `digest-cross-check` | `:583` | check | 1 |
| 31 | `merged-issuers` | `:603` | check | 1 |
| 32 | `merged-securities` | `:605` | info | 1 |
| 33 | `plan <fileName>` | `:609`, loop over the 3 `plan.action` trailer lines | info | 3 |
| 34 | `publication-published` / `-not-rolled-back` / `published-three-files` | `:616-620` | check | **0** — EXECUTE only |
| 35 | `existing-loader-accepts-published-set` | `:625` | **info** (PostClass) | 1 |
| 36 | `verified-record-counts` | `:629`, gated on `verified -eq 'true'` | info | **0** — nothing to verify |
| 37 | `data-class-is-operator-supplied` | `:632`, gated on `verified` | info | **0** |
| 38 | `source-versions` / `listing-map-version` / `corporate-action-table-version` | `:634-638`, gated on `verified` | info | **0** |
| 39 | `resolution-probed` | `:655` | **info** (PostClass) | 1 |
| 40 | `counts-reconcile`, `everything-declared-resolves`, `no-issuer-key-conflict`, `both-resolution-paths-exercised`, `every-probe-item-resolved` | `:671-688` | **info** (PostClass) | **5** |
| 41 | `probe <observationId>` | `:692`, loop over the `probe.item` trailer lines | info | **0** — the probe had no published set to read |
| 42 | `no-publication-markers-after` / `target-holds-exactly-three-files` | `:703`, `:712` | check | **0** — EXECUTE only |
| 43 | `attestation-matches-outcome` | `:726` | check | 1 |

Checks: 14 + (6 + 1 + 1 + 9 + 1 + 1 + 1) = 14 + 20 = **34**.
Informational: 4 + (3 + 1 + 3 + 1 + 1 + 5) = 4 + 14 = **18**.

> **Host reported 34 passed, 0 failed, 18 informational. Census derives 34 / 0 / 18. Exact.**

Note what this reconciliation establishes beyond the total. Row 26 forces **nine** `source.digest` lines, i.e.
Layer 1 independently hashed all three files of all three source sets with `Get-FileHash` and each was compared
against the provisioner's own claim (row 25 passed). Row 40's five emissions are the post-publication facts
running in **informational** mode — the correction made at `617a8bae` after a semantic model showed that scoring
them as failures made a *correct* preflight over an empty root fail. The host total of 18 confirms that
correction is live in the executed script.

---

## 4. Run 3 — publication (`-Execute`)

```powershell
.\tools\windows\IID-STAGE2-IDENTITY-PROVISION.ps1 -Execute
```

The script requested the exact case-sensitive confirmation phrase:

```text
PROVISION IID STAGE 2 IDENTITY
```

which is `$script:RequiredPhrase` at `:134`, compared with `-ceq` (`:459`) and `-cne` (`:452`) so that case
cannot satisfy it. The operator entered the phrase.

```text
=============================================================================
  RESULT  PUBLISHED
          checks: 53 passed, 0 failed, 24 informational
          mode: EXECUTE   provisioner exit code: 0
          target: C:\iips-data\investment\identity
==============================================================================
  The identity set is published. The readiness finding `identity-files` and the served
  route /api/investment/coverage now read these bytes; re-run with -VerifyOnly at any time.
  Control returns to this PowerShell session; the terminal is not closed.
```

`PUBLISHED` is set at `:743` and requires **`failed.Count -eq 0`** in EXECUTE mode. The two closing lines are
`:771-772` verbatim, including the line break after "the served".

### 4.1 One supplied character count disagrees with the source, and is recorded as supplied

The upper separator in the operator's EXECUTE transcript contains **77** `=` characters. The script emits **78**
at every one of its six separator sites (`:241`, `:243`, `:757`, `:762`, `:804`, `:810`), and the operator's own
other three transcripts all contain 78. This is a **transcription artifact** — one character lost when copying —
not a host fact and not a script defect. It is recorded here rather than silently corrected, because the
discipline this repository applies to host numbers is that **none is altered to agree with the source**. It has
no bearing on any check, count or verdict.

### 4.2 Arithmetic reconciliation of run 3

Pre-gate: 14 checks as §2.2, all passing, plus `confirmation` (`:460`, class **info**, emitted because the typed
phrase matched) → **14 checks, 5 informational**.

Post-gate, now with `PostClass = 'check'` (`:595`, not overridden outside PREFLIGHT) and a real publication:

| Rows 18–27 | as §3.1 | check 6 + 1 + 1 + 9, info 3 | 17 checks, 3 info |
|---|---|---|---|
| 28 | `crosscheck published <fileName>` (`:563`), loop over 3 | check | **3** |
| 29 | `published-equals-candidate <name>` (`:579`) — Layer 1 re-hashes each published file | check | **3** |
| 30–33 | `digest-cross-check`, `merged-issuers`, `merged-securities`, `plan <fileName>`×3 | check 2, info 4 | 2 checks, 4 info |
| 34 | `publication-published`, `publication-not-rolled-back`, `published-three-files` (`:616-620`) | check | **3** |
| 35 | `existing-loader-accepts-published-set` (`:625`) | **check** (PostClass) | 1 |
| 36 | `verified-record-counts` (`:629`) | info | **1** — the set verified |
| 37 | `data-class-is-operator-supplied` (`:632`) | **check** | 1 |
| 38 | `source-versions`, `listing-map-version`, `corporate-action-table-version` (`:634-638`) | info | **3** |
| 39 | `resolution-probed` (`:655`) | **check** | 1 |
| 40 | `counts-reconcile` … `every-probe-item-resolved` (`:671-688`) | **check** | **5** |
| 41 | `probe <observationId>` (`:692`), loop over probe items | info | **8** |
| 42 | `no-publication-markers-after` (`:703`), `target-holds-exactly-three-files` (`:712`) | check | **2** |
| 43 | `attestation-matches-outcome` (`:726`) | check | 1 |

Checks: 14 + (6 + 1 + 1 + 9 + 3 + 3 + 1 + 1 + 3 + 1 + 1 + 5 + 2 + 1) = 14 + 39 = **53**.
Informational: 5 + (3 + 1 + 3 + 1 + 3 + 8) = 5 + 19 = **24**.

> **Host reported 53 passed, 0 failed, 24 informational. Census derives 53 / 0 / 24. Exact.**

### 4.3 What row 41 forces: the probe produced exactly eight items

The informational total of 24 is reachable **only** if the `probe <observationId>` loop at `:692` emitted exactly **8**
lines. Seven would give 23; nine would give 25. Eight is what the merged set produces — one `WATCHLIST`
observation per roster security (3) plus one per listing entry (5) — which is the population the three admitted
bundles yield. The host's probe therefore observed **3 ISIN-path items and 5 exchange/symbol-path items**, and
row 40's `both-resolution-paths-exercised` passing confirms both counts were non-zero.

Likewise `target-holds-exactly-three-files` (`:712`) passing means the target held **exactly** the three
governed files — no fourth file, no leftover — and `no-publication-markers-after` (`:703`) passing means neither
`.iips-staging` nor `.iips-previous` survived publication.

### 4.4 What was published, and from what

Three files at `C:\iips-data\investment\identity`:

```text
eligible-roster.json
listing-map.json
corporate-actions.json
```

Source data — the three bundles admitted as operational by the owner's **O3** decision
(`IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md`), already present in the repository:

```text
evidence\real-issuer\REL-1-INFOSYS-2026-11-06\identity
evidence\real-issuer\WI7-CONSUMER-MARICO-2026-11-07\ingest-input\identity
evidence\real-issuer\WI8-INDUSTRIALS-KEC-2026-11-07\ingest-input\identity
```

The corresponding issuers, and no others:

| Issuer | Sector | CIN | Equity ISIN |
|---|---|---|---|
| Infosys Limited | Technology | `L85110KA1981PLC013115` | `INE009A01021` |
| Marico Limited | Consumer | `L15140MH1988PLC049208` | `INE196A01026` |
| KEC International Limited | Industrials | `L45200MH2005PLC152061` | `INE389H01022` |

**No identity record was invented, and no issuer was added.** The merge is a concatenation of the raw parsed
records from exactly these three sets; the provisioner refuses a set that self-classifies as a fixture
(`SYNTHETIC_SOURCE_REFUSED`) and re-checks the composed roster label for `synthetic` before writing. That
`data-class-is-operator-supplied` passed as a **hard check** in EXECUTE (row 37) is the host's own confirmation
that the published set is `OPERATOR_SUPPLIED` and not `SYNTHETIC_FIXTURE`.

### 4.5 Digests — predicted, NOT host-observed

The operator supplied the result blocks, not the digest lines. The published bytes are nevertheless
**deterministic**: `serializeIdentityFile` emits canonical JSON (sorted keys, two-space indent, trailing LF), so
the same three sources produce the same bytes on any platform. Computed on Linux from the same three admitted
sources:

| File | Bytes | sha256 | Status |
|---|---|---|---|
| `eligible-roster.json` | 1992 | `08a5d29cbc6ba01729d4c05488d98ec89ff4027825f51ae5e3bd1a683140ef24` | **PREDICTED** |
| `listing-map.json` | 3794 | `33837065aedd8b30fa3ffd970712c73ea5565759200b19291a25b283b3f61c9b` | **PREDICTED** |
| `corporate-actions.json` | 70 | `1d5ef030ff0b3aaafc86820c60b191558e1808381f1e09b1a410b2e95a3f073a` | **PREDICTED** |

And the loader-canonical versions the report prints as `verification.*`:

| Version | sha256 | Status |
|---|---|---|
| `rosterVersion` | `e910728a1bfa1593880d0880c1cb27952cfd155efd61d3d365bbb6e750a60fa3` | **PREDICTED** |
| `listingMapVersion` | `9635ecd1bef7638589cc188ae9aabcf9a3d40ffaaa0891da03b7049a71c4ae7c` | **PREDICTED** |
| `corporateActionTableVersion` | `0b1d3cbfe52c6afbfabffe2a8ed66dd4a0812ca712f05e1ed9a58caa4b75819` | **PREDICTED** |

These are labelled PREDICTED and are **not** host-observed facts. What *is* host-observed is stronger in the
only respect that matters for integrity: `digest-cross-check` (`:583`) passed with 0 failures, and that check
re-hashes with `Get-FileHash` every digest the provisioner claimed for a real path — 9 source files, 3 candidate
files, 3 published files — and fails on any disagreement, having normalised both sides to lower case so that
hex case alone cannot mask a real difference. **The host therefore verified its own published bytes against the
provisioner's claims, independently, and they agreed.** §9 G-3 records that the digest values themselves were not
transcribed.

---

## 5. Run 4 — independent read-only verification (`-VerifyOnly`)

```powershell
.\tools\windows\IID-STAGE2-IDENTITY-PROVISION.ps1 -VerifyOnly
```

```text
==============================================================================
  RESULT  VERIFY-PASS
          checks: 27 passed, 0 failed, 20 informational
          mode: VERIFY_ONLY   provisioner exit code: 0
          target: C:\iips-data\investment\identity
==============================================================================
```

This was a **separate** invocation, after publication, in read-only mode. It published nothing and mutated
nothing (`:768` applies, since mode is not EXECUTE).

### 5.1 The operator's parameter correction is right, and it matters

The operator recorded that `-Probe` was **not** used "because it is not a supported PowerShell parameter", and
that identifier-resolution probing is **enabled by default**, `-NoProbe` being the switch that disables it.

**Verified against the source.** The `param` block (`:110-121`) declares exactly:

```text
-RepoRoot  -DataRoot  -EvidenceRoot  -NodeExe  -AsOf  -Source  -ConfirmPhrase
[switch]$Execute   [switch]$VerifyOnly   [switch]$NoProbe
```

There is **no `-Probe`**. Line `:412` reads `if (-not $NoProbe) { $script:CliArgs += '--probe' }`, so `--probe`
is passed unless `-NoProbe` is given. The operator's statement is correct in both halves, and the correction is
material: **the verification run probed resolution**. Had `-NoProbe` been passed, `resolution-probed` (`:647`)
would have been emitted with `-Ok $false` and, `PostClass` being `check` in VERIFY_ONLY, the run would have
reported `VERIFY-FAIL` with 1 failed. It reported 0 failed, so the probe ran.

### 5.2 Arithmetic reconciliation of run 4

In VERIFY_ONLY the source section is gated off entirely (`:340`, `if ($script:Mode -ne 'VERIFY_ONLY')`), so
`source-complete`×3 and the `check` form of `source-count` are **not** emitted; the `info` form at `:367` is
emitted instead. The target now holds three published files, so `existing <name>` (`:393`) emits **3**.

Pre-gate: **10 checks** (`repo-root`, `provisioner-cli-present`, `tsx-runner-present`, `node-available`,
`target-is-governed-identity-dir`, `dataset-not-targeted`, `portfolio-store-not-targeted`, `evidence-root`,
`no-preexisting-publication-markers`, `preflight`) and **8 informational** (`mode-unambiguous`, `data-root`,
`source-origin`, `source-count`, `existing-published-set`, `existing`×3).

Post-gate, `PostClass = 'check'`:

| Check id | Site | Class | Emitted |
|---|---|---|---|
| `cli-machine-trailer-present` … `cli-governed` | `:483-506` | check | 6 |
| `no-refusals` | `:516` | check | 1 |
| `cli-reported-every-source-digest` | `:524` | — | **0**, gated on mode ≠ VERIFY_ONLY |
| `crosscheck source`×9 | `:539` | — | **0**, same gate |
| `candidate`×3 | `:546` | — | **0** |
| `crosscheck published`×3 / `published-equals-candidate`×3 | `:563`, `:579` | — | **0**, no publication |
| `digest-cross-check` | `:583` | check | 1 |
| `merged-issuers`, `merged-securities`, `plan`×3 | `:603-609` | — | **0**, gated at `:602` |
| `publication-*`, `published-three-files` | `:616-620` | — | **0**, EXECUTE only |
| `existing-loader-accepts-published-set` | `:625` | **check** | 1 |
| `verified-record-counts` | `:629` | info | 1 |
| `data-class-is-operator-supplied` | `:632` | **check** | 1 |
| `source-versions`, `listing-map-version`, `corporate-action-table-version` | `:634-638` | info | 3 |
| `resolution-probed` | `:655` | **check** | 1 |
| `counts-reconcile`, `everything-declared-resolves`, `no-issuer-key-conflict`, `both-resolution-paths-exercised`, `every-probe-item-resolved` | `:671-688` | **check** | 5 |
| `probe <observationId>`×8 | `:692` | info | **8** |
| `no-publication-markers-after`, `target-holds-exactly-three-files` | `:703`, `:712` | — | **0**, EXECUTE only |
| `attestation-matches-outcome` | `:726` | check | 1 |

Checks: 10 + (6 + 1 + 1 + 1 + 1 + 5 + 1) = 10 + 17 = **27**.
Informational: 8 + (1 + 3 + 8) = **20**.

> **Host reported 27 passed, 0 failed, 20 informational. Census derives 27 / 0 / 20. Exact.**

Two facts are forced by this total and are worth stating separately. The informational count of 20 requires
`existing <name>`×**3** (so the target held exactly three files before verification began) and `probe <observationId>`×**8**
(so the probe again observed exactly eight items against the published set). And `digest-cross-check` must be
emitted in VERIFY_ONLY — omitting it would give 26, not 27 — which the host total confirms.

---

## 6. The census method, and why four exact reconciliations matter

Method: parse the script into logical statements by joining backtick continuations; enumerate every `Add-Check`
call site (**59 logical statements, 45 static ids plus 8 dynamically-built id prefixes**); read each site's `-Id`,
its `-Class` (literal `'info'`, the dynamic `$script:PostClass`, or the default `check`), and its enclosing mode
gate; then multiply the loop-emitted sites by their iteration counts under the host's known conditions (3 source
sets, 9 source files, 3 published files, 8 probe items).

The eight dynamic prefixes are `source-complete `, `existing `, `crosscheck source `, `candidate `,
`crosscheck published `, `published-equals-candidate `, `plan ` and `probe `. One further property deserves
recording because it is easy to misread as a weakness and is not: `probe <observationId>` (`:692`) carries
`-Class 'info'` **regardless of whether the item resolved**, so an unresolved probe item would not by itself
increment the failed count. That is deliberate — the hard requirement is `every-probe-item-resolved` (`:688`),
which compares the resolved count against the item count and so cannot be satisfied by an item quietly failing
at informational class. The per-item lines exist to make each item individually visible in the transcript.

| Run | Mode | Host reported | Census derived | Reconciles |
|---|---|---|---|---|
| 1 | PREFLIGHT (refused) | 12 passed, 2 failed, 4 info | 12 / 2 / 4 | **Exact** |
| 2 | PREFLIGHT | 34 passed, 0 failed, 18 info | 34 / 0 / 18 | **Exact** |
| 3 | EXECUTE | 53 passed, 0 failed, 24 info | 53 / 0 / 24 | **Exact** |
| 4 | VERIFY_ONLY | 27 passed, 0 failed, 20 info | 27 / 0 / 20 | **Exact** |

Four independent triples, each the sum of a different subset of the script's emission sites, all exact. This is
the same discipline `IID-STAGE3-WINDOWS-HOST-ACCEPTANCE-EVIDENCE-2026-11-14.md` §3.1 applied to the Stage 3
verifier's 62 checks, and it establishes three things at once:

1. **The host ran this script at this commit.** A different version would emit a different number of checks.
2. **No check was silently absent.** Every site reachable in each mode is accounted for, so `0 failed` means
   *every reachable hard check passed*, not that some were never evaluated.
3. **The loop multiplicities are confirmed** — 3 source sets, 9 source files, 3 published files, 8 probe items —
   which are facts about the host's data, derived from its own totals.

The census is pinned as a test so it cannot silently drift:
`iips-platform/tests/investment/windowsIdentityProvisionScript.test.ts`, suite *"the Windows host census
reconciles exactly"*, encodes all 54 rows with their per-mode multiplicities and classes and asserts the four
host triples. It also asserts the converse — that **every** `Add-Check` id in the script appears in the census —
so a site cannot be deleted without a total moving and the test failing.

### 6.1 What this reconciliation corrects in Arena's own prior evidence

The semantic model built at `617a8bae` (`stage2-psmodel.py`, not committed) reported 28/0/16 for preflight,
47/0/21 for execute and 21/0/15 for verify. Those totals are **6 checks lower in every mode** than the script
actually emits. The omission is exactly the six `cli-*` agreement checks at `:483-506` — `cli-machine-trailer-present`,
`cli-result-line-present`, `cli-exit-code`, `cli-mode-agrees`, `cli-target-agrees`, `cli-governed` — which the
model did not implement.

That gap is worth naming rather than burying, for two reasons. First, the model's own verdicts and its
per-check assertions were still correct; only its totals were short, so nothing it was used to justify changes.
Second, the six checks it omitted are precisely the ones that cross-verify the provisioner's self-report against
what the script measured independently — the checks most worth having. **The model was not a complete census and
was never claimed to be; this record now supplies the arithmetic the model could not.**

---

## 7. What `VERIFY-PASS` with zero failures establishes

Because `PostClass = 'check'` in VERIFY_ONLY (`:595`, overridden to `'info'` only for PREFLIGHT at `:597`), the
eight post-publication facts were **hard requirements** in run 4. With `0 failed`, each passed, and each carries
a specific consequence:

| Check | Site | What passing establishes, on the host |
|---|---|---|
| `existing-loader-accepts-published-set` | `:625` | The published set re-loads through the **existing** identity loader (`loadIdentitySourcesFromDir`) — `available=true`. This is the same loader `runtimeReadiness.ts:172` uses for finding D1 |
| `data-class-is-operator-supplied` | `:632` | `rosterDataClass = OPERATOR_SUPPLIED`. A fixture would have been refused upstream and would fail here |
| `resolution-probed` | `:655` | The probe **ran** (`-NoProbe` was not passed, and `probe.sourcesAvailable = true`) |
| `counts-reconcile` | `:671` | `resolved + unresolved == observed` — no observation was dropped between counting and classification |
| `everything-declared-resolves` | `:673` | `unresolved == 0` **and `observed > 0`** — a non-empty set, fully resolved. The `observed > 0` conjunct is what prevents an empty probe from passing as success |
| `no-issuer-key-conflict` | `:679` | `issuerKeyConflicts == 0` **with the probe actually having run**. The distinct detail for a non-running probe (`:677`) means this cannot be satisfied by absence of evidence |
| `both-resolution-paths-exercised` | `:685` | ISIN-path items **> 0** and exchange/symbol-path items **> 0** — neither path passed vacuously |
| `every-probe-item-resolved` | `:688` | Every one of the 8 probe items resolved; none was skipped |

Together these establish, **on the host and read-only**: a three-issuer identity reference set is installed at
the designated governed location, it is accepted by the product's own existing loader, it is operator-supplied
rather than synthetic, and every identifier it declares resolves through both resolution paths with no
issuer-key conflict.

**The limit of that claim is stated by the probe itself** and is not relaxed here. Its class is
`DECLARED_IDENTIFIER_SELF_CONSISTENCY`: it proves the published set resolves **its own** declared identifiers.
It establishes **nothing** about any portfolio, holding or watchlist item, because none was read — the probe
constructs one synthetic observation per roster security and per listing entry from the published files
themselves. Holding-to-issuer resolution against real observations is a different act, gated on the observation
surfaces (§8 of the reassessment).

---

## 8. Read-only integrity attestation

| Property | Evidence |
|---|---|
| Runs 1, 2 and 4 performed no filesystem mutation | Host-observed: `This run performed NO filesystem mutation of its own and published nothing.` (`:768`, printed for every mode except EXECUTE). Structurally guaranteed: conformance R7 = 0 mutating commands, 0 .NET write calls |
| Run 1 created no target directory | The gate at `:431` short-circuits before the authorised block; `provisioner exit code: not run` confirms the provisioner never started |
| Run 3's writes were the provisioner's, not the script's | The script's only write path is the single authorised invocation at `:471`. Publication, staging, verification, swap and rollback are `provision.ts`'s |
| No publication marker survived | Host-observed: `no-publication-markers-after` passed in run 3 (`:703`) |
| The portfolio store was not opened | Conformance R6: 0 database commands, 0 store-opening lines; the script names the path only in the `portfolio-store-not-targeted` guard, which passed in all four runs |
| No git command ran | Conformance R5: 0 git invocations |
| Control returned to the session in all four runs | Host-observed closing line in every transcript; conformance R4: 0 `exit`, 0 session-terminating commands |
| The repository was not modified | The only host change outside the worktree's `node_modules` is the published identity set at `C:\iips-data\investment\identity` |
| The Stage 3 dataset was not touched | The target is `<dataRoot>\investment\identity`; `dataset-not-targeted` passed in all four runs. The dataset lives at `<dataRoot>\investment\dataset` |

---

## 9. What this evidence does **not** establish

**Gaps — evidence not supplied, each with the exact reason the supplied material does not close it.**

| # | Gap | Why the supplied evidence does not close it | Exact act that closes it |
|---|---|---|---|
| **G-1** | PowerShell and Node versions on the host | The Stage 3 record could state `5.1.26100.9818 (Desktop)` and Pester `5.7.1` because that transcript included them. These four blocks do not. Version matters here specifically because the two Stage 3 defects were **PowerShell 5.1 semantics**, so the engine version is part of what makes this evidence comparable | `$PSVersionTable.PSVersion` and `node --version` on the host |
| **G-2** | The `asOf` used, and the full per-check listings | `-AsOf` was not supplied, so the provisioner used its own `today()`; the transcript's `asOf` line was not included. And only the four RESULT blocks were supplied — not the individual `[pass]`/`[info]` lines, so no check's **detail text** is host-observed. §6's census establishes that every check was *emitted and passed*; it cannot establish what each one *said* | The complete stdout of any one run, or `-Report <path.json>` |
| **G-3** | The published digests, as host-observed values | §4.5's digests are **computed on Linux**. They are deterministic by construction, and the host's `digest-cross-check` passing proves the host's own bytes agreed with the provisioner's claims — but that is agreement *within* the host run, not agreement *with* these values | The `published.digest` and `verification.*` lines from run 3 or run 4 |
| **G-4** | The readiness diagnostic (`iid-readiness`) on the host | Not invoked. All four runs are the provisioning script; none reads the readiness diagnostic. Finding D1's flip is therefore **derived** from `existing-loader-accepts-published-set` passing against the same loader the diagnostic uses (`runtimeReadiness.ts:172`) — a sound derivation, but not a host capture of the diagnostic itself | **R-1**, unchanged |
| **G-5** | Any served-surface capture | No browser or HTTP capture was supplied. The script's closing line at `:771-772` *asserts* that the served route now reads these bytes; that is the script's own prose, not a capture of the route | **R-2**, re-scoped by the reassessment §5 |

**Non-gaps — things this evidence positively does not claim, and never could.**

1. It does **not** establish that any real holding, watchlist item or broker row resolves to an issuer. The
   probe is `DECLARED_IDENTIFIER_SELF_CONSISTENCY` (§7) and read no observation surface.
2. It does **not** establish that the Identity Coverage **page** renders. That route requires the holdings and
   watchlist surfaces, which throw while D4/D5/D6 are outstanding — reassessment §5 verifies this empirically.
3. It does **not** establish three issuers as the intended investment universe, nor 3 of 13 sectors as coverage.
   Stage 2's population is the O3-admitted evidence set.
4. It does **not** adjudicate source rights. `OPERATOR_SUPPLIED` is a classification the loader derives, and
   `L-041` remains OPEN.
5. It does **not** establish the owner's roster governance decision (**O1**). The owner's act of publishing is
   evidence of intent; a decision record is a different artefact and none exists. Reassessment §2.
6. It does **not** show Arena executing anything on Windows. Every Windows number here is operator-supplied;
   every Arena number is labelled Linux.
7. It does **not** treat a successful publication as an exercised recovery path. Rollback is tested on Linux by
   fault injection (`identityProvision.test.ts`); no Win32 interruption occurred or was simulated.

---

## 10. Traceability

| Item | Value |
|---|---|
| Script executed | `tools/windows/IID-STAGE2-IDENTITY-PROVISION.ps1` (833 lines) at `da4d145b` |
| Provisioner invoked | `iips-platform/src/investment/cli/provision-identity.ts` → `src/investment/identity/provision.ts` |
| Introducing commits | `617a8bae` (implementation, tests, script), `da4d145b` (idempotency pin) |
| Structural conformance | R1–R8 **PASS**, 0 rule failures across the four governed `.ps1` files; nodes=21374, 253 command invocations, 3 catch clauses, 0 `else`/`elseif`/`finally`, 0 `exit`, 0 git, 0 database, 0 mutation |
| Census pinned by | `iips-platform/tests/investment/windowsIdentityProvisionScript.test.ts` |
| Linux behavioural proof | `iips-platform/tests/investment/identityProvision.test.ts` (52), `frontend/server/investment/iidStage2ServedIdentityRoute.test.ts` (9) |
| Source authority for the three bundles | `IID-O3-DATASET-ADMISSION-PA-DECISION-2026-11-13.md` (`O3 = ADMITTED`) |
| Readiness finding reassessed | `frontend/server/investment/runtimeReadiness.ts:145-198` (D1 `identity-files`) |
| Companion record | `IID-STAGE-2-READINESS-REASSESSMENT-2026-11-14.md` (published with this one) |
| Records unchanged | Every prior IID record, byte for byte. This record supersedes no finding and no verdict |

---

*End of evidence. Published additively; no prior record is replaced, corrected or reinterpreted.*
