# IID Stage 5 — D5 / D6 Windows execution handoff (operator-executed)

**Record type:** handoff — what the owner runs on the Windows host, in what order, and what each
outcome means
**Date:** 2026-11-21 (UTC)
**Repository:** `ramkivs/iips-review-recovered` (IRR), `main` at `9d7b4a49ff3f843244c5a3cea1b8e758aecbbdb0`
**Status:** **PREPARED. NOT EXECUTED.** Nothing in this document has been run on Windows. Arena has no
access to the Windows host, to the IPD service, or to the IPD repository (private again at this date).
**Classification:** Local / Single User / Non-Production. Production explicitly out of scope.
**Authority:** `IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md` (owner is the sole operational
authority; a missing technical dependency is a blocker, an approval ceremony is not); roadmap Part C
§C.2 (Stage 5 adopted), §C.4 (IRR v2 + R-1 merged); NP-04 completion record §9.3 (D5/D6 definitions and
closure evidence).

> This handoff claims **no** Stage 5 acceptance, **no** host operational readiness and **no** live host
> operation. It turns the already-merged IRR implementation and the already-recorded governance decisions
> into an execution order for the two outstanding external prerequisites, D5 and D6, and states exactly
> which observations would close each.

---

## 0. The one-page version

1. **Do not** reinstall, rebuild, `npm ci`, `git pull`, re-mint, re-provision identity or touch the data
   domain. Everything below is read-only toward IPD and toward this machine's configuration, except the
   two environment variables the operator sets *after* IPD has confirmed the binding (§3.3).
2. **D5** is an IPD act: IPD confirms that the host's single ACTIVE binding is the approved S1 binding
   (all five components present and unrevoked). IRR cannot provision, observe or substitute it. Only after
   that confirmation does the operator set `IIPS_G3_IPC_BINDING_PROVISIONED=true`.
3. **D6** is a live read: with IPD listening on a Windows named pipe and `IIPS_G2_IPC_ENDPOINT` set to it,
   the IRR transport serves `GET /api/user-portfolios`, `…/{id}`, `…/{id}/revisions`,
   `/api/investment/coverage` and `/api/investment/portfolio/{id}/identities` with **200**, over the v2
   read channel, against IPD's actually persisted holdings — and a second process reads the same
   portfolio back and agrees on id, revision and `provenanceDigest`.
4. Keep every capture under `C:\iips-evidence\IID-STAGE5-<date>\`. Portfolio contents stay on the host;
   only the sanitized files in §7 are publishable.
5. §8 says what each outcome means. §9 says what Stage 5 still needs even when D5 and D6 both close.

---

## 1. What is already done — do not repeat

| Item | Where it stands | Evidence of record |
|---|---|---|
| IPD S1 → D02 read-only relationship | **Merged in IPD** `main@4716d0bc` (impl `e7ded933`, PR #184 `2dec7261`). Dispatched **only** on `v = 2` (`holdingsRead = envelope.v === 2 && IPC_V2_READ_OPERATIONS.includes(op)`); resolves `S1_D02_PERSONAL_READ` only when all five S1 components match and binding + membership are unrevoked; anything else is Class P (zero bytes) | `IID-STAGE-5-IPD-RESPONSE-CONTRACT-VERIFICATION-2026-11-21.md` (`d22f156`) §1–§2, F-1 |
| IRR consumer compatibility (v1, unchanged path) | **COMPATIBILITY CONFIRMED**; four wire conditions WC-1..WC-4 verified at source and executed-production-code level; 12 real frames captured | `d22f156` §3–§5; `IID-STAGE-5-IRR-CONSUMER-COMPATIBILITY-VERIFICATION-2026-11-21.md` (`979c1c6`) |
| B-1 decision (v2 detail contributions) | **R-1 approved** (PA/PO): additive read-only `contributionLedger` on the v2 path; `contributions: []` on v2; v1 DR-4r rule unchanged | `IID-STAGE-5-IRR-IPC-V2-ADOPTION-PROPOSAL-2026-11-21.md` §6, Disposition |
| IRR v2 read channel + R-1 | **Merged to IRR `main`**: PR #606, merge `a6df94ff18641789f67de662c6fc72d224479869` (2026-11-21T18:42:14Z); 14 files; Stage 5 read ports (GET route, `createHoldingsProvider`, `createPortfolioHoldingsProvider`) constructed with `protocolVersion: 2`; v2 writes refused before any socket | `IID-STAGE-5-IRR-IPC-V2-R1-IMPLEMENTATION-RECORD-2026-11-21.md` §3–§4, §7; roadmap §C.4; tracker §16.308 |
| Test evidence | Full IRR suite **3295/3295** (223 files); `tsc` clean; real IPD `4716d0bc` dispatcher + store harness **13/13** in both IPD env modes; v1 control **6/6**; both GitHub workflows green on the PR head and on `main` after merge | record §5, §7; artifacts `docs/integration/artifacts/iid-s5-real-ipd-v2-consumer-probe-2026-11-21.mts`, `…v2-captured-frames-2026-11-21.json` |
| Documentation receipt | PR #607, merge `9d7b4a49ff3f843244c5a3cea1b8e758aecbbdb0` (2026-11-21T18:53:09Z): roadmap §C.4, tracker §16.308, record §7, proposal disposition | this document §10 |
| Dependency pin | `iips-production-market-data#1ce6a829a7ce65550356a0071c108a60f2d813be` — **not advanced**; no technical dependency on the pinned package exists for the IPC client | proposal §7; record §1, §7 |
| Stage 4 host procedure (readiness, transport start, HTTP capture conventions) | Prepared; its §2–§6 conventions are reused here verbatim rather than restated | `IID-STAGE4-WINDOWS-VERIFICATION-PROCEDURE-2026-11-16.md` |
| W11 owner-bound portfolio capture CLI | Exists; read-only; v1 protocol by design (record §8); supported entry point `tools\windows\capture-owner-bound-portfolio.ps1` | `W11-DEP1-OWNER-BOUND-PORTFOLIO-CAPTURE-UTILITY-2026-11-13.md` |

Nothing in this handoff requires a code change in either repository.

---

## 2. Required build identities (record before anything runs)

| Identity | Required value | How the operator records it | Why |
|---|---|---|---|
| IRR checkout commit | `9d7b4a49ff3f843244c5a3cea1b8e758aecbbdb0` **or any descendant of `a6df94ff18641789f67de662c6fc72d224479869`** (the v2 + R-1 merge). An older checkout does not speak v2 and cannot exercise the S1→D02 relationship | Stage 4 procedure §2.1 (`01-checkout.txt`: path, `git rev-parse HEAD`, `git status --porcelain`); additionally `git merge-base --is-ancestor a6df94ff18641789f67de662c6fc72d224479869 HEAD; $LASTEXITCODE` → must print `0` | the host must serve the merged code |
| IRR dependency pin | `frontend/package.json` L32 `iips-production-market-data#1ce6a829a7ce65550356a0071c108a60f2d813be` | `Select-String -Path .\frontend\package.json -Pattern '1ce6a829'` → one line | confirms no local pin drift; nothing to change |
| IRR dependencies installed | `Test-Path .\frontend\node_modules\.bin\tsx.cmd` → `True` | as Stage 4 §1 | installing is a separate operation, not part of this handoff |
| IPD service build | Built from IPD `main@4716d0bc123e5fb3e8e72f74bada257d08d76ba2` **or a descendant that preserves `validateV2Envelope` and `readHoldingsPortfolio`**. Short `dist/` hash prefixes recorded at verification: `dispatch.js fb4a3abc…`, `portfolio_store.js 76185ec7…`, `binding.js 551f14b2…` (record §1) | **Operator**, from the IPD checkout the running service was started from: `git rev-parse HEAD` and `Get-FileHash` of `dist\ipc\dispatch.js`, `dist\persistence\portfolio_store.js`, `dist\persistence\binding.js`. The W11 capture script also records the HOST-OBSERVED IPD HEAD when it can locate the running `ipc\entrypoint.js` process | A-2: an IPD build without the v2 grammar answers `PROTOCOL_VERSION_UNSUPPORTED` → Class P → IRR 503. That is a safe failure, but it would be misread as D5 if the build were not recorded first |
| IPD env mode | Record whether the IPD service runs with `IIPS_LOCAL_PERSONAL_USE=1` (name/presence only — never values) | from the IPD service's own startup environment | F-2: it changes what the **v1** W11 capture can do (§5), not what the v2 route returns (harness item 9.6: identical v2 results in both modes) |
| Node | `node --version` | recorded in `01-checkout.txt` | correlation only |

If any row cannot be recorded, stop and record that instead. Do not build, install or update to make a
row true — that is a different operation.

---

## 3. D5 — active IPD owner binding (owner: **IPD**; declaration: **operator**)

### 3.1 What D5 is, exactly

IPD's dispatcher resolves the host's **single ACTIVE binding** on every request. For a `v = 2` read it
accepts exactly two cases (`d22f156` §2): the native D02 owner, or the approved **S1** binding with all
five components matching — `principalLabel`, `bindingId`, `membershipId`, `tenantId`,
`canonicalOwnerId` — and binding + membership unrevoked. Any other state is `BindingInvalidError` →
Class P → zero bytes on the wire, and IRR reports `503 upstream-unavailable`.

D5 is closed when **IPD confirms, through its own governed procedure, that this binding is ACTIVE on the
host** — and only then. IRR has no reader for the binding table, transmits no owner or tenant value, and
cannot tell *which* component is missing (record §9 item 3; proposal A-3). No IRR diagnostic widening is
proposed or authorized.

### 3.2 What the operator asks IPD to confirm (checklist, IPD-owned)

| # | Confirmation from IPD | Where IPD records it |
|---|---|---|
| D5-1 | The IPD service on the host is built from `4716d0bc` or a qualifying descendant (§2) | IPD's own operation record / D02 evidence pack |
| D5-2 | Exactly one ACTIVE binding exists and it is the approved S1 binding (five components present, binding and membership unrevoked) | IPD binding procedure output |
| D5-3 | The S1 storage owner holds at least one persisted portfolio with at least one holding (the rows D6 will read; **no** portfolio is created for this handoff) | IPD store / D02 evidence pack |
| D5-4 | The IPC endpoint the service listens on, as a Windows named-pipe path `\\.\pipe\<name>` (the **name only**; the value is placed in the IRR environment, never in evidence) | IPD service configuration |

Items D5-1..D5-4 are IPD acts or IPD-owned facts. IRR documentation records that they were confirmed; it
does not perform or verify them.

### 3.3 What the operator does after IPD confirms — the only configuration change in this handoff

In the IRR server's environment (either `.env.local`, which `npm run server:dev` loads, or the shell that
starts it), set:

```text
IIPS_G3_IPC_BINDING_PROVISIONED=true
IIPS_G2_IPC_ENDPOINT=\\.\pipe\<the name IPD confirmed in D5-4>
```

`IIPS_LOCAL_PERSONAL_USE` is **not** required for the read path on either side (record §9 item 4) and
must not be set for this handoff: the host-run scope is reads only (§4.1), and that switch enables IRR's
write routes. Nothing else is set. Restart the transport after the change (NP-04 record §9.3, D6 row).

### 3.4 What closes D5 in the evidence folder

| File | Content | Closes |
|---|---|---|
| `10-d5-ipd-confirmation.txt` | IPD's confirmation of D5-1..D5-4, by reference (document name / record id), **no** binding, membership, owner or tenant value | D5 confirmation |
| `02-environment-names.txt` | Stage 4 §2.2 output showing `IIPS_G3_IPC_BINDING_PROVISIONED` and `IIPS_G2_IPC_ENDPOINT` → `True`, `IIPS_LOCAL_PERSONAL_USE` → `False`, names only | declaration made only after confirmation |
| `03-readiness.json`, `03-readiness-exit.txt` | Stage 4 §3 (`npm run iid:readiness -- --strict --data-dir C:\iips-data`, run from a shell that has the same variables): `ipd-binding-precondition` and `ipc-endpoint` findings `[ok]` | declaration visible to the diagnostic — **necessary, not sufficient**: readiness does not probe pipe liveness (roadmap §C.2) |

D5 is **confirmed** when the first row exists; the other two show the declaration was made correctly.
D5 is **not** closed by setting the variable; the variable is the operator's declaration of an IPD fact.

---

## 4. D6 — live portfolio IPC read (owner: **IPD** peer; **operator** host; IRR client unchanged)

### 4.1 Host-run scope (record §9 item 5 — written here so it is not implied)

In scope: `GET /api/user-portfolios`, `GET /api/user-portfolios/{id}`,
`GET /api/user-portfolios/{id}/revisions`, `GET /api/investment/coverage?asOf=<date>`,
`GET /api/investment/portfolio/{id}/identities`. **No write route is exercised** — no `POST`, `PUT`,
`DELETE`, no `/reset`, no broker-import save, no `IIPS_LOCAL_PERSONAL_USE`. The W11 capture (§5.2) is
read-only by construction. If a write happens, the run is not a D6 run; record it as such.

### 4.2 Start the transport

Stage 4 procedure §4.1 exactly, with the two variables from §3.3 in effect. Wait for
`Executive transport listening on 127.0.0.1:8787`; keep `04-transport-console.txt`. `/api/health` is not
a readiness check.

### 4.3 Capture the HTTP answers (the durable evidence)

Run the Stage 4 §6 loop with these requests appended (same `$Ev`, `$Base`, `$Utf8`, `$Log` conventions).
`{id}` is taken from the **actual** list response — never typed from memory:

```powershell
$code = curl.exe -s -o "$Ev\11-01-portfolios-list.out" -w '%{http_code}' "$Base/api/user-portfolios"
[IO.File]::AppendAllText($Log, "11-01-portfolios-list`t$code`r`n", $Utf8)
$list = Get-Content "$Ev\11-01-portfolios-list.out" -Raw | ConvertFrom-Json
$ids  = @($list.portfolios | ForEach-Object { $_.portfolioId })
[IO.File]::WriteAllText("$Ev\11-00-portfolio-count.txt", "portfolios listed: $($ids.Count)`r`n", $Utf8)
foreach ($id in $ids) {
  $e = [Uri]::EscapeDataString($id)
  foreach ($r in @(
    @{ n = "11-02-detail-$e";     u = "$Base/api/user-portfolios/$e" },
    @{ n = "11-03-revisions-$e";  u = "$Base/api/user-portfolios/$e/revisions" },
    @{ n = "11-04-identities-$e"; u = "$Base/api/investment/portfolio/$e/identities" }
  )) {
    $code = curl.exe -s -o (Join-Path $Ev ($r.n + '.out')) -w '%{http_code}' $r.u
    [IO.File]::AppendAllText($Log, "$($r.n)`t$code`r`n", $Utf8)
  }
}
$code = curl.exe -s -o "$Ev\11-05-identity-coverage.out" -w '%{http_code}' "$Base/api/investment/coverage?asOf=$AsOf"
[IO.File]::AppendAllText($Log, "11-05-identity-coverage`t$code`r`n", $Utf8)
Get-Content $Log
```

The `.out` files for detail and identities contain holdings. They are **host-local evidence**; do not
publish them (§7).

### 4.4 How to read each answer

| Capture | Expected on a host where D5 and D6 hold | What else it can say, and what that means |
|---|---|---|
| `11-01` list | `200`, body `{"portfolios":[…]}`; each summary has `portfolioId`, `portfolioName`, `revision`, `totalMarketValue`, `totalHoldingsCount`, `weightSumPercentage`, `lastUpdated`, `provenanceDigest`, `isSaved`. Count ≥ 1 (D5-3). **No** key named `owner`, `ownerId`, `tenant`, `tenantId`, `userId`, binding or membership anywhere (WC-2) | `503 {"error":"owner-context-unavailable", …"unavailableReason":"binding-precondition-absent"}` → §3.3 not in the server's environment (or server not restarted). `503 …"ipc-endpoint-not-configured"` → endpoint variable absent or not a `\\.\pipe\` path. `503 …"ipc-endpoint-unreachable"` / `{"error":"upstream-unavailable"}` → endpoint set but IPD did not answer **or** IPD answered Class P (binding not ACTIVE / not S1 / build without v2) — the IPD Class P journal on the host says which; IRR cannot. `200` with `[]` → endpoint and binding accepted but the resolved storage owner has no portfolio (D5-3 false, or the ACTIVE binding is not the S1 one) |
| `11-02` detail | `200`, body `{"portfolio":{…}}` with `holdings` non-empty, **`contributions: []`**, and **`contributionLedger`** present (an array; may be empty for a portfolio with no contribution rows). The ledger's presence is the on-wire proof that the response came over **v2** — v1 never carries it | `404 {"error":"not-found"}` → the id is not visible to the resolved owner (WC-3; would mean the list and get disagree, which the W11 capture would also catch). `503 upstream-unavailable` on detail only, with list `200` → a non-conforming contribution row refused the whole view (R-1 validation; record §4.2) or a v2 envelope with an extra key (A-1). Keep the body; this is a genuine finding, not something to work around |
| `11-03` revisions | `200`, `{"revisions":[…]}`, each with `revision`, `operation`, `totalMarketValue`, `provenanceDigest`, `holdingsCount`, `createdAt`; the highest `revision` equals the detail's `revision` and its `provenanceDigest` equals the detail's | mismatch → the store changed between calls (re-run the trio) or an inconsistent read (W11 capture adjudicates with repeated gets) |
| `11-04` identities | `200`; one entry per holding; identities resolved for Infosys / Marico / KEC holdings against the installed roster, honest `unresolved` for anything else | `503 {"error":"holdings-unavailable"}` → same causes as list `503`; this route constructs its own v2 port |
| `11-05` identity coverage | `200`; the holdings source is **present** (previously the holdings surface was refused because D5/D6 were absent — NP-04 record §9.3 R-2 row) | `503` naming the surfaces → the holdings provider failed; see list `503` causes |

Every `200` above is a Stage 5 read over `v = 2` through `S1_D02_PERSONAL_READ` (the only v2 branch
that returns rows for the S1 binding). There is no v1 fallback in IRR (record §3: `parseResponseFrame`
requires `frame.v === expectedVersion`), so a `200` here cannot have come from the generic v1 path.

---

## 5. Actual persisted holdings and independent read-back

### 5.1 Whose holdings

The holdings read in §4 are whatever the IPD store already holds for the S1 storage owner (D5-3). This
handoff creates, imports, saves or resets **nothing**. If the store has no portfolio, D6 cannot be
demonstrated and the correct record is "D5-3 false", not a new portfolio.

### 5.2 Independent read-back — a second process, through the existing capture CLI

From a **new** PowerShell window, while IPD is still running and the transport may stay up (the capture
does not use the transport; it opens the pipe itself through the same IRR IPC consumer):

```powershell
cd "$Repo"
.\tools\windows\capture-owner-bound-portfolio.ps1 -OutputRoot "$Ev\12-w11-capture"
"capture exit: $LASTEXITCODE" | Tee-Object -FilePath "$Ev\12-w11-capture-exit.txt"
```

The CLI performs `list → get → revisions → get`, accepts the capture only when both gets agree on
portfolio, revision and `provenanceDigest`, exactly one history entry carries that revision and digest,
and `holdingsCount` equals the holdings length. It writes `LOCAL-ONLY-DO-NOT-PUBLISH\exact-owner-bound-portfolio-capture.json`
(stays on the host) and `SANITIZED-SUMMARY\w11-dep1-capture-summary.json` + `.md` (publishable).

**The capture speaks v1 by design** (record §8; proposal §5.7). That has one consequence, F-2
(`d22f156` §6): under IPD's governed mode (no `IIPS_LOCAL_PERSONAL_USE=1` on the IPD side) the v1
`portfolio.get` carries the full contribution ledger, IRR's DR-4r rule refuses it, and the capture exits
**14 `PROTOCOL_CAPABILITY_UNAVAILABLE`** at the detail step. Read it as follows:

| IPD env mode (§2) | Expected capture exit | What it proves |
|---|---|---|
| `IIPS_LOCAL_PERSONAL_USE=1` on the IPD service | **0 `CONSISTENT_CAPTURE`** | full independent read-back: list/get/revisions/get consistent in a second process |
| governed (`{}`) | **14** at detail, after a successful `portfolio.list` | the list leg is still an independent second-process read of the same owner's portfolio set; the detail refusal is the recorded pre-existing v1 behaviour, **not** a D6 failure. Do **not** switch IPD's env to make it pass — that is a configuration change outside this handoff; record the exit and use §5.3 for the detail comparison |
| any | **11 `BINDING_OR_AUTHORIZATION_REFUSAL`** | Class P from IPD, or `IIPS_G3_IPC_BINDING_PROVISIONED` absent in the capture's shell — the same D5 causes as §4.4 |
| any | **10 `IPC_CONNECTION_FAILURE`** / **2 `CONFIGURATION_INVALID`** | endpoint not reachable / not set in the capture's shell; D6 not demonstrated |

### 5.3 The comparison (what "agrees" means)

Record, in `13-readback-comparison.txt`, for each portfolio id, the following **keys only** (no holding
values) from the three sources — transport v2 (§4.3), capture v1 (§5.2 summary), and IPD's own record
(IPD-owned read-back, by reference):

| Key | Transport v2 (`11-02` / `11-03`) | Capture v1 (`w11-dep1-capture-summary.json`) | IPD-side (by reference) | Must |
|---|---|---|---|---|
| `portfolioId` | detail | selected portfolio | D02 evidence pack / IPD read | identical |
| `revision` | detail = max(revisions) | accepted revision | IPD current revision | identical |
| `provenanceDigest` | detail = that revision's entry | accepted digest | IPD current digest | identical |
| `holdingsCount` / holdings length | detail `totalHoldingsCount` = `holdings.length` = revisions entry `holdingsCount` | `holdingsCount` | IPD | identical |
| `contributionLedger` length | detail (v2 only) | — (v1 has no ledger; in personal mode `contributionsCount` = 0 by `personalGet`) | IPD `contributionsValidated` count | transport count = IPD count |

v1 and v2 read the **same rows** for the S1 binding (`d22f156` WC-3 / F-1: identical `result` bodies for
list and revisions, identical holdings for get, in the real-dispatcher probe). So agreement between the v1
capture and the v2 transport is expected and is the independent-read-back criterion; disagreement is a
finding to record, not to reconcile by hand.

---

## 6. Order of execution (summary)

| Step | Action | Owner | Reuses | Evidence file |
|---|---|---|---|---|
| 1 | Record build identities (§2) | operator | Stage 4 §2.1 | `01-checkout.txt`, `01-ipd-build.txt` |
| 2 | IPD confirms D5-1..D5-4 (§3.2) | **IPD** | IPD governed procedure | `10-d5-ipd-confirmation.txt` |
| 3 | Set the two variables; restart transport (§3.3) | operator | Stage 4 §4.1 | `02-environment-names.txt` |
| 4 | Readiness `--strict` from a shell with the same variables (§3.4) | operator | Stage 4 §3 | `03-readiness*.{txt,json}` |
| 5 | HTTP captures (§4.3) | operator | Stage 4 §6 loop | `06-http-status.txt`, `11-*.out` |
| 6 | W11 capture in a second process (§5.2) | operator | `capture-owner-bound-portfolio.ps1` | `12-w11-capture\…`, `12-w11-capture-exit.txt` |
| 7 | Comparison table (§5.3) | operator (+ IPD reference) | — | `13-readback-comparison.txt` |
| 8 | Stop cleanly (`Ctrl+C` in the transport window); nothing to roll back — nothing was written | operator | Stage 4 §9 | — |

---

## 7. Evidence inventory and publication boundary

| Keep on the host only (contains holdings or ids) | Publishable (sanitized) |
|---|---|
| `11-02-detail-*.out`, `11-04-identities-*.out`, `12-w11-capture\…\LOCAL-ONLY-DO-NOT-PUBLISH\*` | `01-*.txt`, `02-environment-names.txt`, `03-readiness*.*`, `04-transport-console.txt`, `06-http-status.txt` (status codes only), `11-00-portfolio-count.txt`, `12-w11-capture\…\SANITIZED-SUMMARY\*`, `12-w11-capture-exit.txt`, `13-readback-comparison.txt` **with digests and counts only**, `10-d5-ipd-confirmation.txt` (references only) |

No environment value, pipe name, binding, membership, owner or tenant identifier, holding, amount or
portfolio name goes into a repository. The sanitized set is what an IRR evidence record would cite, in
the style of `IID-NP04-FIRST-INFOSYS-PERSISTENCE-COMPLETION-2026-11-15.md` (operator-reported; Arena did
not access the host).

---

## 8. What each overall outcome means

| Observed | Meaning | Next |
|---|---|---|
| IPD confirmation absent | **D5 open.** Nothing else in this handoff is meaningful; a `200` would not be possible and a `503` would be the correct answer | wait for IPD; do not set the declaration |
| Confirmation present; all §4.4 rows `200` with the stated shapes; §5.2 exit 0 (personal mode) or exit 14-after-list (governed); §5.3 agrees | **D5 confirmed and D6 demonstrated** on this build pair (IRR ≥ `a6df94ff`, IPD `4716d0bc`+). The Stage 5 portfolio read path exists on the host. **Not** Stage 5 acceptance (§9) | write the evidence record; proceed to the remaining Stage 5 items |
| Confirmation present; list `503 upstream-unavailable` / capture exit 11 | IPD refused pre-authorization (Class P) or did not answer. Either the ACTIVE binding is not the S1 one, a component is missing/revoked, the service build lacks v2, or the pipe is not the one declared | IPD Class P journal and §2 build row decide; **no IRR change** |
| List `200`, detail `503` on the same id | R-1 fail-closed (non-conforming contribution row) or A-1 (extra envelope key) | genuine finding; record body and IPD build; stop |
| List `200` with `portfolios: []` | binding accepted but no portfolio for the resolved owner | D5-3 false, or the wrong binding is ACTIVE; IPD decides |
| Readiness `--strict` exit 0 but any `503` above | expected possibility — readiness does not probe the pipe (roadmap §C.2) | the served captures are the truth; do not report readiness alone |

---

## 9. What Stage 5 still needs after D5 and D6 close (unchanged; NP-04 record §9.3)

| Item | Owner | Status |
|---|---|---|
| D4 F-3 carrier / watchlist context (only if watchlists are exercised) | operator (IRR materialiser exists) | open |
| R-1 host readiness capture / R-2 served coverage captures — the holdings surface becomes capturable only with D5/D6 | operator | open; this handoff produces both as a side effect (`03-*`, `11-05`) |
| Remaining Marico / KEC v1 mints (if the three-issuer scope is pursued) | operator, existing CLI | open; not forced |
| Second comparable version + change diff (needs a genuine input change) | operator | open; do not force a duplicate |
| D10 / P6-B real browser acceptance (the Personal Portfolio page renders the served v2 view; `contributionLedger` is passed through unrendered — record §8) | operator host | blocked behind the rows above |
| Stage 4 data residuals (freshness / operating-metric / source) | per Stage 4 records | open in parallel |

**Overall IID readiness remains NOT READY** until those rows carry evidence. Closing D5 and D6 moves the
hard external prerequisite of the portfolio loop, nothing more.

---

## 10. Repository verification performed for this document (2026-11-21, Arena, IRR only)

| Check | Result |
|---|---|
| PR #607 (documentation receipt) | MERGED 2026-11-21T18:53:09Z; merge commit `9d7b4a49ff3f843244c5a3cea1b8e758aecbbdb0`, parents `a6df94ff…` + `9e24499a…`; remote `main` = `9d7b4a49…` (`git ls-remote`); only check `CAP-03 Revision 7 IRR-only static checks` success on `main` (run 44937942807) |
| Four documentation blobs on `main` | roadmap `b30895446fe1…`, tracker `762bd38e706d…`, implementation record `c44d7b01f459…`, proposal `f952f5091367…` — contents API `?ref=main` equal to local `origin/main` tree |
| Receipt references the implementation merge | `a6df94ff18641789f67de662c6fc72d224479869` appears in all four files' added text (4 occurrences in the diff) |
| Unrelated changes in `a6df94ff...9d7b4a49` | none — exactly the four documentation paths; `git diff --check` clean |
| Dependency pin on `main` | `1ce6a829a7ce65550356a0071c108a60f2d813be` in `frontend/package.json` L32, `package-lock.json`, `.ci/verify-ipd-pins.mjs` L16 — unchanged |
| IRR code facts cited here | `user-portfolio-transport.ts` routes L53–58, `ReadUnavailableReason` L88–91, `READ_REQUIRED_SETTINGS` L100–103, GET port `protocolVersion: IPC_PROTOCOL_VERSION_V2`; `investment/sources.ts` L172, L203; `executive-transport.ts` identities route → `createPortfolioHoldingsProvider()`; `ipcClient.ts` L393–399 (`\\.\pipe\` required on Windows); capture CLI exit codes `capture-owner-bound-portfolio.ts` header; `G2PortfolioView.contributionLedger?` in `userPortfolioContract.ts` |
| Host / IPD facts | **none observed**; every IPD statement is cited to `d22f156` or the implementation record, both of which were produced against a public snapshot of IPD `main@4716d0bc` on 2026-11-21 |

---

## 11. Boundary confirmations

- No IPD change, no pin advance, no IRR code change, no new script, no test redesign.
- No Windows host provisioning or runtime configuration was performed; §3.3 describes what the operator
  sets, after IPD confirms, and it is the only configuration change in scope.
- No Stage 5 acceptance, host operational readiness or live host operation is claimed. Overall IID
  readiness remains **NOT READY**.
- Repository ownership and checkout safeguards preserved: this document was published through the
  normal IRR PR process on a fresh branch from `main@9d7b4a49…`.
