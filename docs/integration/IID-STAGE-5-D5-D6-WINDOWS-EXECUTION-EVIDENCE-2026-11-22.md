# IID Stage 5 — D5 / D6 Windows execution evidence and reconciliation (operator-reported)

**Record type:** evidence record and acceptance reconciliation for the two external prerequisites of the
Stage 5 portfolio loop — D5 (active IPD owner binding) and D6 (live portfolio IPC read)
**Evidence date:** 2026-11-22 (UTC; operator capture `20261122T101640Z`)
**Repository:** `ramkivs/iips-review-recovered` (IRR); published from `main` at
`11089815707b10a6d516f9a64ddf6611b547a4b3` (PR #613)
**Executes:** `IID-STAGE-5-D5-D6-WINDOWS-EXECUTION-HANDOFF-2026-11-21.md` (the handoff; §3 D5, §4 D6, §5
read-back, §8 outcome matrix)
**Evidence class:** **operator-reported.** Arena did not access the Windows host, the IPD service, the IPD
database, or the evidence directory. Every host fact below is what the operator observed and reported;
repository facts were verified against IRR `main@1108981` and IPD `main@cbb116d2` (public).
**Classification:** Local / Single User / Non-Production. Production explicitly out of scope.
**Authority:** `IID-PA-01-PERSONAL-USE-OPERATING-AUTHORITY-2026-11-15.md`; roadmap Part C §C.2, §C.4, §C.5.

> This record closes nothing beyond D5 and D6. It claims **no** Stage 5 acceptance, **no** overall IID
> readiness and **no** IPD-side record (IPD's own records are IPD's to update). §7 states exactly what each
> criterion's evidence is and where a required item is absent.

---

## 0. Outcome in one paragraph

Against the handoff's §8 matrix, the observed outcome is row 2: IPD confirmation present (the IPD-owned
read-only Direct P1 verification returned `ok: true`, `status: VERIFIED`, DP-V1..DP-V9 all passed); every
§4.4 in-scope route answered **200** over the **v2** channel (the detail responses carry `contributionLedger`
and `contributions: []`, which v1 never produces); the second-process W11 read-back exited **0
`CONSISTENT_CAPTURE`**; and the transport's detail and history agree on revision, provenance digest and
holdings count for both portfolios the resolved owner holds. **D5 is CONFIRMED (with one recorded
build-provenance residual, §7.1) and D6 is DEMONSTRATED (with one recorded cross-source comparison
residual, §7.2)** on the build pair IRR ≥ `a6df94ff…` / IPD `cbb116d2` (descendant of `4716d0bc`).
The Stage 5 portfolio read path exists on the host. Overall IID readiness remains **NOT READY** (§9).

> **Update 2026-11-22 (second pass), §11:** both residuals are resolved by later operator evidence —
> D5-1 compiled-module hashes (§11.1) and the four-source digest comparison (§11.2). The R-1 strict
> readiness capture is recorded in §11.3. The paragraph above is left as written.

> **Update 2026-11-22 (third pass), §12:** R-1 re-captured in the transport's own process environment
> (PID `18424`) — `READ-PATH READY: YES`, `--strict` exit 0, all eight findings `[ok]` with the
> diagnostic's qualifications preserved. R-1 closed; P6-A §10 prerequisites 1–6 evidenced; prerequisite 7
> (the recorded browser journey) is the remaining Stage 5 step and is **not executed**. Procedure:
> `IID-STAGE-5-D10-P6B-BROWSER-ACCEPTANCE-PROCEDURE-2026-11-22.md`.

> **Update 2026-11-22 (first D10 browser pass), §13:** portfolio surfaces verified in the browser (64 Dhan
> holdings, summary, valuation, weights, latest revision); two findings — *Company assessment* reached the
> honest "No stored assessment" state for the chosen holding (root cause: only the Infosys chain is stored;
> disposition by issuer in §13.2), and *Change history* resolved to the same page (root cause: anchor to a
> section mounted only after a successful read; corrected to the IID-03 workspace, §13.3). **P6-B not accepted.**

---

## 1. Operator-observed host evidence (IPD checkout, service, endpoint)

| # | Observation (operator-reported) | Reconciled against the repository | Handoff ref |
|---|---|---|---|
| H-1 | IPD Windows checkout `H:\IIPS\iips-production-market-data`, manually synchronized, local HEAD `cbb116d2a221b82a704b4b96cf17efe0560e2498`, working tree clean | `cbb116d2` is IPD remote `main` (PR #186, 2026-11-22T04:06Z). `git diff --stat e46b56b0..cbb116d2 -- src/ipc src/persistence docs/DIRECT_P1_PROVISIONING.md scripts windows-setup` is **empty**, and `4716d0bc..e46b56b0` was already empty for `src/ipc src/persistence`: the IPC and persistence sources at `cbb116d2` are the sources verified in `d22f156` and the R-1 record | §2 "IPD service build" |
| H-2 | Required implementation commit `4716d0bc` is an ancestor of the synchronized HEAD | confirmed in the public clone (`git merge-base --is-ancestor 4716d0bc cbb116d2`) | §2 |
| H-3 | `dist\src\ipc\entrypoint.js` exists; `dist\src\persistence\directP1Provisioning.js` exists | IPD's compiler emits under `dist/src/…`; `dist/` is git-ignored in IPD (`.gitignore` L2), so a clean working tree says nothing about `dist/` contents — see §7.1 | §2 |
| H-4 | A running IPD IPC process was observed, started from the IPD checkout | IPD `src/ipc/entrypoint.ts` is the only IPC entrypoint; it logs `[g3] listening on windows-named-pipe` on bind | §2, D5-1 |
| H-5 | Named pipe present; pipe enumeration returned exactly one matching pipe; an independent .NET named-pipe connection succeeded | the name equals the IPD `windows-setup/03-Start-IipsServers.ps1` `-PipeName` default and the documented endpoint; **the value is withheld here** per handoff §7. Enumeration/wait helpers: IPD `windows-setup/Iips-Common.ps1` `Get-IipsNamedPipes` / `Wait-IipsPipePresent` | D5-4 |
| H-6 | The startup script in use already carries `IIPS_G3_IPC_BINDING_PROVISIONED=true` and `IIPS_G2_IPC_ENDPOINT`; no environment change was needed | consistent with IPD `windows-setup/03-Start-IipsServers.ps1` L304–305, which sets exactly those two variables in the IRR transport environment only after the provider reports a bound pipe and the pipe is visible in the namespace; the same script sets `IIPS_OWNER_CONTEXT_PATH` (L249) and does not set `IIPS_LOCAL_PERSONAL_USE` for the transport | §3.3 |

What H-4/H-5 do **not** establish: the build identity of the running process. Observing a process and its
command line attests that *an* `entrypoint.js` from that checkout path is running, not which compiler
output it is (§7.1). The named-pipe connection test attests reachability, not peer authenticity (§4).

---

## 2. Read-only database verification (IPD-owned procedure; closes D5-2 / D5-3)

Executed by the operator with IPD's own verifier against `C:\iips-data\iips\user-portfolio.sqlite` in
read-only mode (`directP1Provisioning.js --mode=verify`: opens with `readOnly: true`, pre/post file SHA-256
guard; IPD `src/persistence/directP1Provisioning.ts` L933/L968/L1600). No database change was made.

| Field | Reported | Meaning |
|---|---|---|
| `ok` / `status` | `true` / `VERIFIED` | the whole check set passed |
| DP-V1 … DP-V9 | all passed | includes **DP-V5** exactly one ACTIVE, unrevoked local principal binding carrying the designated label/id; **DP-V6** the ACTIVE membership attached to it; **DP-V8** live five-component resolution (`principalLabel`, `bindingId`, `membershipId`, `tenantId`, `canonicalOwnerId`) through the same resolver the IPC dispatcher uses; **DP-V7** audit chain valid |
| audit chain | valid; 2 audit events | DP-V7 |
| `portfolioCounts` | `portfolios` 3, `portfolioRevisions` 13, `portfolioHoldings` 142, `portfolioContributions` 6 | DP-V9 — **global table counts**, not owner- or revision-partitioned (they count every row in each table). They are not the S1 owner's view; the owner-scoped view is §3/§5 (2 portfolios; 64 + 1 current holdings) |

No binding, membership, owner or tenant value is reproduced here; the verifier output stays on the host.

---

## 3. HTTP response evidence (IRR transport `http://127.0.0.1:8787`; status codes only)

Captured by the operator per the Stage 4 §6 loop with the handoff §4.3 requests appended. `{id}` values
were taken from the actual list response. All bodies stay on the host (handoff §7); only status codes and
the keys-only comparison in §5 are recorded.

| Route (handoff §4.4 row) | Status | Note |
|---|---|---|
| `GET /api/user-portfolios` (`11-01` list) | **200** | two portfolios returned for the resolved owner; ids used below |
| `GET /api/user-portfolios/DHAN_PORTFOLIO` (`11-02`) | **200** | `contributions: []`, `contributionLedger` present (1 entry) — **v2 on the wire** |
| `GET /api/user-portfolios/DHAN_PORTFOLIO/revisions` (`11-03`) | **200** | latest revision 1 |
| `GET /api/investment/portfolio/DHAN_PORTFOLIO/identities` (`11-04`) | **200** | — |
| `GET /api/user-portfolios/PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2` (`11-02`) | **200** | `contributions: []`, `contributionLedger` present (1 entry) — **v2 on the wire** |
| `…/PERSONAL-fa8ad7bc-…/revisions` (`11-03`) | **200** | latest revision 2 |
| `…/portfolio/PERSONAL-fa8ad7bc-…/identities` (`11-04`) | **200** | — |
| `GET /api/investment/coverage?asOf=…` identity coverage (`11-05`) | **200** (and a follow-up capture, **200**) | the holdings surface is present; see §3.1 |
| `GET /api/investment/coverage/investment` | **200** | unchanged from PR #610 (W05 Step 4) |
| identity HTML; coverage HTML | **200**, **200** | — |
| Infosys / Marico / KEC company endpoints; CIN lookup; ISIN lookup; Infosys company detail | **200** ×6 | Stage 4 routes re-served on the same transport; recorded for completeness, no Stage 4 status is reopened or changed |

Why each `200` is a v2 read: IRR's `parseResponseFrame` requires `frame.v === expectedVersion` and the
Stage 5 read ports are constructed with `protocolVersion: 2` (R-1 record §3); there is no v1 fallback, and
IPD dispatches the S1→D02 relationship only on `v = 2` (`d22f156` F-1). The `contributionLedger` on both
details is the on-wire proof (handoff §4.4, `11-02` row).

### 3.1 Identity coverage 503 → 200: the W05 Step 4 outstanding item is resolved by configuration

`W05-STEP4-CAPTURE-VALIDATOR-CORRECTION-2026-11-21.md` "Outstanding" item 1 recorded the identity route's
`503 observation-sources-unavailable` ("owner context not established: the server-owned binding carrier is
not configured"). The 2026-11-21 reconciliation of that message against the current sources concluded
**external prerequisite / configuration only**: the "binding carrier" is IRR's process-environment
declaration `IIPS_G3_IPC_BINDING_PROVISIONED` (`frontend/server/user-portfolio/ownerContextFromBinding.ts`
L213–225; consumed at `frontend/server/investment/sources.ts` L167–169), the watchlist surface additionally
needs the F-3 carrier at `IIPS_OWNER_CONTEXT_PATH` (`sources.ts` L213–215, `owner-context-resolver.ts`),
and `OwnerContext` carries no identity field — the S1 binding itself is resolved by IPD per request. The
`200` captured here, from a transport started with those variables (H-6), confirms that conclusion: no IRR
or IPD code change was made or needed. It also shows, indirectly, that the F-3 carrier was resolvable in
that transport process (otherwise the watchlist surface would have failed the same way); D4 was not
separately captured and is not claimed closed here.

---

## 4. W11 consistency evidence (independent second-process read-back; v1 by design)

Run by the operator with the existing capture CLI (`tools\windows\capture-owner-bound-portfolio.ps1`;
IRR `frontend/server/user-portfolio/capture/`). Sanitized summary on the host:
`C:\iips-evidence\IID-STAGE4-20261116\12-w11-capture\w11-dep1-capture-20261122T101640Z-d1992178\SANITIZED-SUMMARY\w11-dep1-capture-summary.json`.
The exact capture under `LOCAL-ONLY-DO-NOT-PUBLISH\` is local-only and is **not** reproduced,
summarised or attached.

| Field | Reported |
|---|---|
| outcome / reason / exit | `CONSISTENT_CAPTURE` / `ALL_GATING_CHECKS_PASSED` / **0** |
| capture id | `d1992178-e6e6-4f52-b70a-046db66c446a` |
| attempts / reads | one attempt; four reads `portfolio.list → get → revisions → get` |
| consistency | all four reads agreed on portfolio, revision, provenance digest and holdings count; exactly one history entry matched; all ten gating checks passed |
| selection | operator explicitly selected `DHAN_PORTFOLIO` from the returned list — no portfolio was guessed (`selection.method`, `operatorSuppliedPortfolioId`) |
| portfolio | revision **1**; holdings **64** (reported count = array length); one matching history entry |
| identity | 64 holdings, 64 resolved, 64 with `CANONICAL_P04` disposition; `securityIdentity` object present on 1, `null` on 63 — identical to the W04 census of this portfolio at revision 1 (IPD W04 acceptance basis, 1 of 64) |
| `contributionsCount` | **0** — see §6: this is the v1 projection and is **not** a mismatch |
| **peer authenticity** | **`NOT_ATTESTED`** — preserved verbatim from the summary: the v1 consumer cannot prove which process served the endpoint; that the peer was the operator-run IPD service is a host fact the operator attests separately (H-4/H-5), and that attestation is by observation, not by any wire or build attestation |
| build | the summary's build section labels host-observed facts as host-observed; "the service build is not attested on the wire" (summary `limitations`) — see §7.1 |

Exit **0** under the handoff §5.2 table corresponds to the IPD service running with its local personal-use
switch (otherwise the v1 detail leg is refused with exit 14). The IPD env-mode name/presence was not
separately reported; it is inferred from the capture behaviour and recorded as such.

---

## 5. IRR v2 detail / history comparison (transport; keys only, no holding values)

Operator-compared from the `11-02` and `11-03` bodies for each portfolio id returned by the list.

| Key | `DHAN_PORTFOLIO` | `PERSONAL-fa8ad7bc-efec-5562-cfbd-de362b782fa2` | Must (handoff §5.3) |
|---|---|---|---|
| detail `revision` | 1 | 2 | — |
| latest history `revision` | 1 | 2 | = detail ✔ ✔ |
| detail `provenanceDigest` | `17b2b2833268222310c21f7b685d0ca5e595ebd6a62bda7f118a9c0c6b84781f` | `9e5dc076ebcceeed24b375296b5c27ad723f1a53cbe9489ae8c8d6af84e14de1` | — |
| history entry digest at that revision | identical | identical | = detail ✔ ✔ |
| detail `totalHoldingsCount` / `holdings.length` / history `holdingsCount` | 64 / 64 / 64 | 1 / 1 / 1 | identical ✔ ✔ |
| `contributions` | `[]` | `[]` | `[]` on v2 (R-1) ✔ ✔ |
| `contributionLedger` | present, 1 entry | present, 1 entry | present on v2 ✔ ✔ |

The `DHAN_PORTFOLIO` digest equals the digest already of record for this portfolio at revision 1 (IRR
`docs/investigations/2026-11-11-stage2-identity-boundaries.md`; IPD W04 acceptance basis) — the store
still serves the same revision-1 row.

---

## 6. Three-source contribution reconciliation (`DHAN_PORTFOLIO`)

| Source | Value | Protocol / path |
|---|---|---|
| IRR transport v2 detail | `contributionLedger.length` = **1** | v2 `portfolio.get` → R-1 mirror of IPD's validated rows |
| IPD database (operator's separate **read-only** SQLite query, scoped to the historical S1 storage owner and `DHAN_PORTFOLIO`) | `{"contributionsValidated": 1}` | IPD store, by reference |
| W11 capture v1 summary | `contributionsCount` = **0** | v1 `portfolio.get` under personal mode (`personalGet`) does **not** expose the v2 contribution ledger; IRR's v1 mirror therefore reports 0 (handoff §5.3 last row: "v1 has no ledger") |

Transport count = IPD count (**1 = 1**): the handoff §5.3 ledger criterion holds. The v1 `0` is a
protocol distinction, not a disagreement, and must be read that way wherever this capture is cited.

The IPD-side figure came from an operator-executed query, not from an IPD-published record; it is
recorded as operator-reported. No SQL is reproduced here.

---

## 7. Acceptance reconciliation — D5 and D6 against the evidence actually present

### 7.1 D5 — active IPD owner binding (handoff §3.2; closure files §3.4)

| Criterion | Required evidence | Present? | Basis |
|---|---|---|---|
| D5-1 service build from `4716d0bc` or a qualifying descendant | checkout HEAD **and** `Get-FileHash` of the compiled dispatcher/store/binding modules from the checkout the service was started from | **PARTIAL** | HEAD `cbb116d2` (descendant; clean tree) and the two `dist\src\…` files' existence are reported (H-1..H-4). **Not reported:** hashes of `dist\src\ipc\dispatch.js`, `dist\src\persistence\portfolio_store.js`, `dist\src\persistence\binding.js` (the handoff §2 wrote these paths without the `src\` segment; the compiled layout is `dist\src\…`). Because IPD ignores `dist/`, a clean tree does not bind the running artifacts to `cbb116d2`, and a process command line does not attest its build. **Functionally** the running service answered `v = 2` reads with rows under an ACTIVE S1 binding (§2 DP-V5/V8 + §3 ledger on the wire), which only the S1→D02 code path introduced at `e7ded933`/`4716d0bc` does — a behavioural inference, recorded as such, not an attestation |
| D5-2 exactly one ACTIVE binding, the approved S1 binding, five components present, binding and membership unrevoked | IPD binding procedure output | **YES** | §2: DP-V5, DP-V6, DP-V8 passed; `VERIFIED`; IPD-owned verifier, read-only |
| D5-3 the S1 storage owner holds ≥ 1 persisted portfolio with ≥ 1 holding; none created | IPD store / read | **YES** | §3 list `200` with two portfolios; §5 64 and 1 current holdings; §2 DP-V9 tables readable; nothing was written (§8) |
| D5-4 the IPC endpoint as a Windows named pipe, name only | IPD service configuration | **YES** | H-5 (present, exactly one match, independent connection) |
| `10-d5-ipd-confirmation.txt` — IPD's confirmation **by reference** to an IPD document/record id | file in the evidence folder | **NOT AS SPECIFIED** | the confirmation of record is the verifier output (§2), which is IPD's own governed procedure (`docs/DIRECT_P1_PROVISIONING.md` §5.1). No IPD-repository record of this host confirmation exists at `cbb116d2`; the IPD roadmap entry for S1→D02 still reads "OPERATIONAL EVIDENCE PENDING" with "reviewed running artifacts" among the remaining items. IPD-owned; not an IRR act |
| `02-environment-names.txt` (names → `True`, `IIPS_LOCAL_PERSONAL_USE` → `False`) | file | reported as H-6 (script already sets both; no change needed); the names-only listing itself was not reported | — |
| `03-readiness*` (`--strict`, `ipd-binding-precondition`/`ipc-endpoint` `[ok]`) | file | **not reported** | necessary-not-sufficient diagnostic; the served `200`s supersede it for D5/D6 (handoff §8 last row) but it remains the R-1 host readiness capture (§9) |

**D5 status: CONFIRMED** on D5-2, D5-3 and D5-4, which are the binding facts D5 exists to establish
(roadmap §C.2: "IPD confirms"; NP-04 record §9.3: "IPD confirmation plus an actual portfolio read through
the IRR transport resolving real holdings" — both present). **One residual stays open and is named
precisely:** the build-provenance item of D5-1 — the three compiled-module hashes from the running
service's checkout, compared with a build of `cbb116d2` (identical IPC/persistence sources to `4716d0bc`)
— plus IPD's own publication of the confirmation. *(Hashes recorded 2026-11-22, second pass — §11.1; the
IPD-owned publication remains open — §11.4.)* The IPD proposal's approved acceptance model
(IPD-S1-D02 proposal §9: "source-policy plus operator binding/peer/build evidence, with no wire binding
attestation") names build evidence explicitly, so this residual is recorded rather than waived. It is a
new, single recording step, not a repeat of any check above.

### 7.2 D6 — live portfolio IPC read (handoff §4, §5)

| Criterion | Present? | Basis |
|---|---|---|
| In-scope routes `200` with the stated shapes, over v2, against persisted holdings | **YES** | §3 (list, detail ×2, revisions ×2, identities ×2, identity coverage); ledger on the wire; counts 64 and 1 |
| No write route exercised; `IIPS_LOCAL_PERSONAL_USE` not set for the transport | **YES (reported)** | §8; H-6 script sets no personal-use switch for the transport |
| Second process reads the same portfolio back: exit 0 (personal mode) | **YES** | §4: exit 0, `CONSISTENT_CAPTURE`, one attempt |
| Agreement transport ↔ capture ↔ IPD on `portfolioId`, `revision`, holdings count | **YES** | `DHAN_PORTFOLIO`, revision 1, 64 — identical in §3/§5 (transport), §4 (capture), and §6/§2 (IPD read-only sources) |
| Agreement on `provenanceDigest` **across sources** | **PARTIAL** | within the transport: detail = history (§5). Within the capture: all four reads agreed (§4). **The value-level equality capture-vs-transport was not reported**: the sanitized summary carries only `provenanceDigestPresent`/`provenanceDigestLength` by design, so the comparison needs the host-local exact capture and belongs in `13-readback-comparison.txt` (digests and counts only, publishable). Equality follows from revision parity on IPD's append-only revision store, but that is an inference, not the recorded observation |
| `contributionLedger` length = IPD `contributionsValidated` | **YES** | §6 (1 = 1); v1 `0` is the protocol distinction, preserved |
| Peer authenticity | **NOT ATTESTED — preserved** | §4; no claim is made that the wire proves which process answered |

**D6 status: DEMONSTRATED.** Every served read the handoff put in scope answered `200` over the v2
channel against IPD's persisted holdings, and an independent second process read the same portfolio back
consistently. **One residual stays open:** the recorded value-level digest comparison between the capture
and the transport (`13-readback-comparison.txt`), which is a comparison of data already captured — no
read is to be repeated. *(Recorded 2026-11-22T11:35:21Z, result PASS — §11.2.)*

### 7.3 Can D5 / D6 be formally closed? *(as assessed at first publication; see §11.4 for the current assessment)*

- **D5:** closable as *CONFIRMED* now on the binding facts; its formal closure record should carry the
  D5-1 build-provenance residual until the three module hashes are recorded (or the owner, as sole
  operational authority under PA-01, records acceptance of the behavioural inference in its place —
  that is the owner's call and is not made here).
- **D6:** closable as *DEMONSTRATED* now; the digest cross-comparison residual is a recording step on
  existing data.
- Neither residual requires a service restart, a re-capture, a rebuild, a provisioning step or any change
  to either repository.

---

## 8. Boundaries observed by this operation (as reported) and by this record

- Reads only: `GET` routes, `portfolio.list|get|revisions` over IPC, a read-only verifier, a read-only
  query. No `POST`/`PUT`/`DELETE`, no `/reset`, no broker-import save, no re-provisioning, no portfolio
  created, no rebuild, no `npm ci`, no `git pull` by Arena. The IPD database was not modified
  (verifier pre/post SHA guard; operator statement).
- Nothing local-only is published: no holding, amount, portfolio name, binding/membership/owner/tenant
  value, pipe name value, environment value, database row, exact W11 capture, or response body.
  Portfolio identifiers, revisions, provenance digests and counts are the keys the handoff §5.3/§7 admits
  and are already of record in both repositories.
- No application code, test, script, configuration, dependency pin or database content was changed for
  this publication. No IPD file was changed. The operator's Windows checkouts were not touched by Arena.

---

## 9. What Stage 5 still needs (unchanged list; status after this evidence) *(status column superseded by §11.5)*

| Item (handoff §9 / NP-04 record §9.3) | Status after this record |
|---|---|
| D5 active binding | **CONFIRMED** — residual: D5-1 build-provenance hashes + IPD-side publication (§7.1) |
| D6 live v2 read + independent read-back | **DEMONSTRATED** — residual: recorded digest cross-comparison (§7.2) |
| D4 F-3 carrier / watchlist context | evidenced **indirectly** by identity coverage `200` (§3.1); not separately captured; open as a recorded item, not a blocker |
| R-1 host readiness capture (`iid:readiness --strict`) | **open** — not reported in this evidence set |
| R-2 served coverage captures (investment + identity, holdings surface present) | **CLOSED** — both `200` (§3; investment already PR #610) |
| Remaining Marico / KEC v1 mints (three-issuer scope) | open; not forced |
| Second comparable version + change diff | open; needs a genuine input change; not forced |
| D10 / P6-B real browser acceptance (Personal Portfolio page renders the served v2 view; `contributionLedger` passed through unrendered) | **unblocked by D5/D6**; its remaining prerequisites are the readiness capture above and the two residuals |
| Stage 4 data residuals | open in parallel; untouched |

**Next roadmap step:** record the two residuals (§7.1 hashes, §7.2 comparison) and the R-1 readiness
capture from the existing host state — no reruns — then **D10 / P6-B real browser acceptance** on the
same build pair. **Overall IID readiness remains NOT READY.** D5/D6 closure moves the hard external
prerequisite of the portfolio loop and nothing else; it is not Stage 5 acceptance.

---

## 10. Repository verification performed for this record (Arena, IRR + public IPD; no host access)

| Check | Result |
|---|---|
| IRR `main` at publication | `11089815707b10a6d516f9a64ddf6611b547a4b3` (PR #613); PR #610 `3c253f63…` (W05 Step 4 capture validator) is an ancestor |
| IPD `main` | `cbb116d2a221b82a704b4b96cf17efe0560e2498` (PR #186); `4716d0bc` and `e46b56b0` are ancestors; no change under `src/ipc`, `src/persistence`, `scripts`, `windows-setup`, `docs/DIRECT_P1_PROVISIONING.md` since `4716d0bc` (`git diff --stat` empty); `dist/` git-ignored |
| IRR code facts cited | `ownerContextFromBinding.ts` L176–228 (`OwnerContext` has no identity field; `BINDING_PRECONDITION_SETTING` L225); `investment/sources.ts` L167–169, L198–200, L213–215; `coverage-transport.ts` L83–102; `iips-platform/src/investment/identity/coverageEndpoint.ts` L159–171; `runtimeReadiness.ts` `bindingFinding` L332–372 (`BINDING_DECLARED_IPD_VERIFIES_PER_REQUEST`); capture summary `peerAuthenticity: 'NOT_ATTESTED…'`, `limitations`, `provenanceDigestPresent/Length` in `ownerBoundPortfolioCapture.ts` |
| IPD code facts cited | `src/persistence/binding.ts` L102–147, L186–203 (`S1_D02_PERSONAL_READ`); `directP1Provisioning.ts` verify `readOnly: true` L968, DP-V5 L1302, DP-V6 L1385, DP-V7 L1464, DP-V8 L1500, DP-V9 L1553 (`portfolioCounts` global); `windows-setup/03-Start-IipsServers.ps1` L249, L290–311; IPD roadmap "S1 → D02" entry: OPERATIONAL EVIDENCE PENDING |
| Dependency pin | `iips-production-market-data#1ce6a829a7ce65550356a0071c108a60f2d813be` — unchanged |
| Host / IPD-service facts | **none observed by Arena**; all operator-reported (§1–§6) |

---

## 11. Evidence update — 2026-11-22, second operator pass (appended; §§0–10 are the historical record)

**Published from IRR `main` at `5d259a44803f096f8cc2f6adb34cab2b853a9010` (PR #615).** Operator-reported;
Arena accessed no host, service, database or evidence directory. Evidence root on the host:
`C:\iips-evidence\IID-STAGE5-20261122\`. This section resolves exactly the two residuals named in §7.1
(D5-1 compiled-module hashes) and §7.2 (value-level digest cross-comparison), records the R-1 strict
readiness diagnostic, and reassesses D5/D6. Nothing in §§0–10 is rewritten; where a statement there is
superseded, a pointer to this section was added beside it.

### 11.1 D5-1 — compiled-module hash verification (resolves the §7.1 residual)

Operator-reported, from the IPD Windows checkout `H:\IIPS\iips-production-market-data`: HEAD
`cbb116d2a221b82a704b4b96cf17efe0560e2498`, working tree clean; `git merge-base --is-ancestor
4716d0bc123e5fb3e8e72f74bada257d08d76ba2 HEAD` → exit **0**.

| Compiled module (IPD checkout) | Observed SHA-256 (operator, `Get-FileHash`) | Expected (handoff §2 / R-1 record §1, 8-hex prefix of a `4716d0bc` build) | Independent full-hash rebuild (Arena sandbox, §11.6) |
|---|---|---|---|
| `dist\src\ipc\dispatch.js` | `FB4A3ABC68CCA81DF86B6D9938646317BD5FB27F712CBD06179445A828FDE1EC` | `fb4a3abc…` | `fb4a3abc68cca81df86b6d9938646317bd5fb27f712cbd06179445a828fde1ec` — **identical** |
| `dist\src\persistence\portfolio_store.js` | `76185EC7736AE6B7E221924AA4E2B11AE61E9B8227C620DB3C54421A876FE0CE` | `76185ec7…` | `76185ec7736ae6b7e221924aa4e2b11ae61e9b8227c620db3c54421a876fe0ce` — **identical** |
| `dist\src\persistence\binding.js` | `551F14B26A8E2E900C0029B6EEA8336C160A1475C7745E4EB43DE8AD8034FA28` | `551f14b2…` | `551f14b26a8e2e900c0029b6eea8336c160a1475c7745e4eb43de8ad8034fa28` — **identical** |

All three observed hashes match the recorded prefixes and, byte for byte, a fresh compile of IPD
`main@cbb116d2` performed in the Arena sandbox (`npm ci --ignore-scripts` + `tsc` 5.9.3, Node 22.22.3,
clean clone; no host involvement). The compiled dispatcher, store and binding modules in the operator's
checkout are therefore the modules verified in `d22f156` and the R-1 record (the sources under `src/ipc`
and `src/persistence` are unchanged from `4716d0bc` to `cbb116d2`).

**Three distinct statements — only the first two are established:**

1. *Checkout ancestry* — the synchronized checkout is `cbb116d2`, a clean descendant of `4716d0bc` (§1 H-1/H-2;
   exit 0 above).
2. *Compiled-module identity* — the three compiled modules **in that checkout** are byte-identical to a
   build of `cbb116d2` (table above). The handoff §2 "IPD service build" row is now satisfied as written
   (HEAD + `Get-FileHash`; the compiled layout is `dist\src\…`, as §7.1 noted).
3. *Code loaded by the already-running process* — **not directly proven, and not claimed.** The service was
   observed running from this checkout (§1 H-4) and its behaviour is that of the S1→D02 build (§3, §5), but no
   recorded observation binds the bytes resident in that process to the files hashed afterwards. IPD has no
   build-identity attestation on the wire or in its startup log (`[g3] listening on …` only). This limitation
   is permanent for this evidence class and is recorded, not a residual to be worked.

### 11.2 D6 — four-source exact read-back comparison (resolves the §7.2 residual)

Operator-produced `13-readback-comparison.txt`, captured **2026-11-22T11:35:21Z**, generated from the
host-local W11 exact capture (`d1992178-e6e6-4f52-b70a-046db66c446a`; stays local-only) and the IRR v2
detail and revision-history responses. Keys only; no holding values.

| Source | Portfolio | Revision | Provenance digest | Holdings |
|---|---|---|---|---|
| W11 first `portfolio.get` (v1, second process) | `DHAN_PORTFOLIO` | 1 | `17b2b2833268222310c21f7b685d0ca5e595ebd6a62bda7f118a9c0c6b84781f` | 64 |
| W11 second `portfolio.get` (v1, second process) | `DHAN_PORTFOLIO` | 1 | `17b2b2833268222310c21f7b685d0ca5e595ebd6a62bda7f118a9c0c6b84781f` | 64 |
| IRR transport v2 detail (`11-02`) | `DHAN_PORTFOLIO` | 1 | `17b2b2833268222310c21f7b685d0ca5e595ebd6a62bda7f118a9c0c6b84781f` | 64 |
| IRR transport v2 revision history (`11-03`, entry at revision 1) | `DHAN_PORTFOLIO` | 1 | `17b2b2833268222310c21f7b685d0ca5e595ebd6a62bda7f118a9c0c6b84781f` | 64 |

Reported comparison verdicts: portfolio identity **MATCH**; revision **MATCH**; provenance digest
**MATCH**; holdings count and array length **MATCH**; result **`PASS`**. The §7.2 inference ("equality
follows from revision parity") is replaced by this recorded observation.

Unchanged and restated so this section can be cited alone: W11 outcome `CONSISTENT_CAPTURE`, exit 0,
one attempt (`list → get → revisions → get`), ten gating checks passed, operator-selected
`DHAN_PORTFOLIO`, revision 1, 64 holdings; contribution reconciliation transport v2 `contributionLedger`
= **1** = IPD read-only `contributionsValidated` **1**, with the W11 v1 `contributionsCount: 0` being the
v1 projection (no ledger on v1), **not a mismatch**; every route in §3 answered **200** (the §3 table is
the route-by-route record and is not restated). **Peer authenticity remains `NOT_ATTESTED`** by the v1
consumer; that the peer was the operator-run IPD service is a host observation (§1), not a wire fact. The
exact W11 capture, the response bodies and all portfolio contents remain host-local and unpublished.

### 11.3 R-1 — strict readiness diagnostic (new evidence; read-only; its own process environment only)

> **Superseded for status 2026-11-22 (third pass):** the same diagnostic was afterwards run in the transport's process
> environment and returned `READ-PATH READY: YES`, exit 0 — see **§12**. The table below remains the record of the shell capture.

Operator ran, from the IRR `frontend` package, `npm run iid:readiness -- --strict --data-dir C:\iips-data`;
output saved as `C:\iips-evidence\IID-STAGE5-20261122\03-readiness.txt`. Header:
`IID runtime readiness (read-only) — LOCAL_SINGLE_USER_NON_PRODUCTION`; platform `win32`; Node `24.14.0`.
Conclusion: **`READ-PATH READY: NO`**. The diagnostic states that it was read-only, opened/created/migrated
no database, contacted no IPC peer, wrote nothing, and that "this report describes only the process
environment in which it ran — an absent setting there is NOT evidence about another host"; production
admission NOT ADMITTED.

| # | Finding | Result | Ownership (as reported) | Reason / setting | Status for Stage 5 and how it relates to other evidence |
|---|---|---|---|---|---|
| 1 | `identity-files` | **OK** | `irr-owned-operational` | `IDENTITY_SOURCES_VALID` (IID-01/02/03) | operational |
| 2 | `fundamentals-dataset` | **OK** | `irr-owned-operational` | `DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED` (IID-01/03) | operational; the diagnostic does not read the dataset — content verification is by the existing dataset reader before any mint (Stage 4 records; accepted) |
| 3 | `reports-owner-context` | TODO | `user-host-provisioning-required` | `REPORTS_OWNER_CONTEXT_UNAVAILABLE (path-not-configured)` — `IIPS_REPORTS_OWNER_PATH` | **absent in this shell.** NP-04 record / roadmap §C.1 recorded the Reports carrier and NP-04 store in use when Infosys was persisted on this host; the carrier is set per process. Open as a readiness-capture item, operator-owned |
| 4 | `np04-assessment-store` | TODO | `irr-owned-not-configured` | `DATABASE_PATH_NOT_CONFIGURED` — `IIPS_NP04_DATABASE_PATH` | **absent in this shell.** Same note as 3 (`H:\IIPS\runtime\np04\reports.sqlite` exists per §C.1; a configured path is not evidence that records exist — the diagnostic says so). Operator-owned |
| 5 | `owner-context-carrier` | TODO | `user-host-provisioning-required` | `OWNER_CONTEXT_UNAVAILABLE (path-not-configured)` — `IIPS_OWNER_CONTEXT_PATH` | **absent in this shell.** The transport that served the identity-coverage `200` (§3.1) necessarily resolved the F-3 carrier; the startup script sets this variable for the transport process only. D4 remains "evidenced indirectly, not separately captured" |
| 6 | `ipd-binding-precondition` | TODO | `ipd-owned-unavailable` | `BINDING_NOT_PROVISIONED` — `IIPS_G3_IPC_BINDING_PROVISIONED` | **absent in this shell.** The declaration was present in the transport's environment (§1 H-6) and the IPD-owned fact behind it is verified (§2). The diagnostic correctly says IRR cannot establish or assert the binding — ownership IPD |
| 7 | `ipc-endpoint` | TODO | `irr-owned-not-configured` | `ENDPOINT_NOT_RESOLVED (ENDPOINT_NOT_CONFIGURED)` — `IIPS_G2_IPC_ENDPOINT` | **absent in this shell.** Present in the transport's environment (§1 H-6); the live reads in §3/§11.2 went through it. The diagnostic contacted no peer by design |
| 8 | `local-personal-use-enablement` | TODO | `irr-owned-not-configured` | `LOCAL_PERSONAL_USE_ABSENT` — `IIPS_LOCAL_PERSONAL_USE` | **absent by design** for the read-only Stage 5 scope (handoff §3.3: must not be set; the diagnostic itself says read-only IID assessment does not require it). Not a Stage 5 read-path item |

**Reading.** The diagnostic ran in a shell that did not carry the transport's environment (handoff §3.4
asked for "a shell that has the same variables"). Its six TODO findings describe **that shell**, as the
diagnostic itself states, and are **not** evidence that the Windows D5/D6 read path failed: the same host,
on the same day, served every in-scope route with `200` over v2 and passed the four-source
comparison (§3, §11.2). No host setting was or should be changed to make the diagnostic pass. For Stage 5
the R-1 item is now **captured but not green**: NP-04 record §9.3 lists `--strict` exit 0 as *necessary but
not sufficient*. What remains for R-1 is the same read-only diagnostic executed in the transport's own
process environment (the environment the startup script builds) — a new capture in a different
environment, not a repeat of this one and not a configuration change. Its expected residual findings there
would be 3/4 (Reports carrier and NP-04 path are set only if the startup script finds them; roadmap §C.1
says they exist) and 8 (by design). Owner: operator; items 3–5 and 7 are operator/host settings, item 6 is
IPD-owned fact + operator declaration, item 8 is out of scope for reads.

### 11.4 Reassessed status

**D5 — CONFIRMED; the IRR-recordable residual of §7.1 is resolved.** D5-1 now carries the evidence the
handoff §2 required (ancestry + compiled-module hashes, §11.1), D5-2/D5-3/D5-4 are unchanged (§2, §3, §1
H-5). The behavioural inference in §7.1 is no longer load-bearing for the artifact identity; the only
remaining limitation is statement 3 of §11.1 (running-process memory), which is inherent and recorded.

What remains is **IPD-owned and cannot be closed from IRR:** IPD has not published, in its own repository
under its own process, the confirmation that its handoff rows D5-1..D5-4 contemplate (IPD roadmap
`IIPS-CURRENT-PORTFOLIO-EXECUTION-ROADMAP.md` "S1 → D02" entry still reads **OPERATIONAL EVIDENCE PENDING**,
with "reviewed running artifacts, peer/source binding and a real persisted-holdings v2 read" as the
remaining items). *Sufficiency assessment (IRR's view only, no authority):* the operator-reported set now
covers each of those three items — running artifacts (`cbb116d2`, three module hashes equal to a build of
IPD `main`), peer/source binding (Direct P1 verifier `VERIFIED`, DP-V1..V9; pipe present and connectable;
no Class P refusal on any in-scope read — all answered 200), and a real persisted-holdings v2 read (§3, §11.2) — so IPD appears to have
what it needs to publish. **Precise remaining action, IPD-owned:** append its operational evidence record
(checkout HEAD and hashes by reference, verifier result by check id, pipe presence, env-mode name) to its
D02 evidence pack / roadmap entry and move that entry off OPERATIONAL EVIDENCE PENDING, through an IPD PR.
Left open here; IRR records nothing on IPD's behalf.

**D6 — DEMONSTRATED; the §7.2 residual is resolved** (§11.2). No D6 residual remains. Peer authenticity
`NOT_ATTESTED` is a standing limitation of the v1 consumer, not a residual.

**Not changed by this update:** Stage 5 is **not** accepted; overall IID readiness remains **NOT READY**;
Stage 4 remains closed as recorded (its accepted limitations — S4-R6 / G-4 series, tracker §16.301–§16.307 —
are Stage 4 facts, not Stage 5 work, and are not reopened here).

### 11.5 Stage 5 remaining work after this update (replaces the status column of §9; the list is unchanged)

> **Status column superseded by §12.5** (R-1 closed green in the transport environment; D10 / P6-B procedure published).

| Item | Owner | Status after §11 |
|---|---|---|
| D5 active binding | IPD fact / operator declaration | **CONFIRMED** (IRR-recordable evidence complete). Open, IPD-owned: IPD's own publication (§11.4) |
| D6 live v2 read + independent read-back | operator / IPD peer | **DEMONSTRATED**, no residual; peer authenticity NOT_ATTESTED (standing) |
| R-1 host readiness capture | operator | **captured, not green** (`READ-PATH READY: NO` in a shell without the transport's variables); remaining: the same diagnostic in the transport's process environment (§11.3) |
| D4 F-3 carrier / watchlist context | operator (IRR materialiser exists) | evidenced indirectly (§3.1); readiness finding 5 confirms it was not in the diagnostic's shell; a separate capture is still open if watchlists are exercised |
| R-2 served coverage captures | operator | **CLOSED** (§3) |
| Marico / KEC successor v1 mints (three-issuer scope) | operator, existing CLI | open; not forced |
| Second comparable persisted assessment version + change diff | operator (genuine input change required) | open; not forced; readiness findings 3/4 must be set in the minting process's environment when it is pursued |
| D10 / P6-B formal browser acceptance | operator host | **unblocked by D5/D6**; prerequisites remaining: R-1 green in the transport environment (above) |
| Stage 4 data limitations | per Stage 4 records | accepted limitations, preserved; not Stage 5 work |

**Next roadmap step:** R-1 readiness in the transport's process environment (read-only; no setting
changed), then **D10 / P6-B real browser acceptance** on this build pair (IRR ≥ `a6df94ff…` /
IPD `cbb116d2`). IPD's publication proceeds in parallel under IPD ownership.

### 11.6 Verification performed for this update (Arena; IRR + public IPD; no host access)

| Check | Result |
|---|---|
| IRR `main` at the time of this update | `2bfb7a801c1fc5dea452df0649340333709f237c` = PR #614 (broker-import snapshot payload; code/tests only, merged after #615); PR #615 `5d259a44…` is its parent. No documentation path touched by #614; this update is branched from `5d259a44…` and applies cleanly |
| IPD `main` | still `cbb116d2a221b82a704b4b96cf17efe0560e2498`; `git merge-base --is-ancestor 4716d0bc… HEAD` → 0 in the sandbox clone; roadmap S1→D02 entry unchanged (OPERATIONAL EVIDENCE PENDING) |
| Independent rebuild | fresh `--depth 30` clone of IPD at `cbb116d2`, `npm ci --ignore-scripts`, `npx tsc` (5.9.3) on Node 22.22.3; `sha256sum` of the three modules equals the operator's three hashes exactly (§11.1). Working tree clean after build (`dist/` ignored). No IPD file changed, nothing pushed |
| Sanitisation | this section adds portfolio id, revision, digest and counts already of record (§5, IPD W04 basis); no holdings, bodies, exact capture, binding/membership/owner/tenant values, pipe-name value or environment values |
| Host / IPD-service facts | **none observed by Arena**; all operator-reported |

---

## 12. Evidence update — 2026-11-22, third operator pass: R-1 in the transport's process environment (appended; §§0–11 are the historical record)

Operator-reported; Arena accessed no host, service, database, process or evidence directory. This section
records the one R-1 step that §11.3 and §11.5 left open — the same read-only diagnostic executed in the
transport's own process environment — and nothing else. §11.3 is not rewritten; its eight-row table remains
the record of the **shell** capture (`03-readiness.txt`). D5/D6 are not re-examined and were not rerun.

### 12.1 What was run, and where its environment came from

| Item | Operator-reported value |
|---|---|
| Diagnostic | IRR `frontend` package, `npm run iid:readiness -- --strict` (read-only; same code path as §11.3) |
| Environment | captured from the **actual running IRR transport process**, PID **`18424`** (the process serving `127.0.0.1:8787` in §3/§11.2), and applied to the diagnostic's process — not a re-typed or reconstructed variable set |
| Output files | `C:\iips-evidence\IID-STAGE5-20261122\04-readiness-transport-environment.txt` (report) and `04-readiness-transport-exit.txt` (exit code) |
| Exit code (`--strict`) | **`0`** |
| Header | `IID runtime readiness (read-only) — LOCAL_SINGLE_USER_NON_PRODUCTION`; platform `win32`; Node `24.14.0` (same host/runtime as §11.3) |
| Conclusion line | **`READ-PATH READY: YES`** |
| Production admission | **NOT ADMITTED** (the diagnostic's own statement; unchanged) |

### 12.2 The eight findings in the transport environment (operator-reported), against §11.3

| # | Finding | §11.3 shell result | **Transport-environment result** | What `[ok]` does and does not establish (diagnostic's own qualification, preserved) |
|---|---|---|---|---|
| 1 | `identity-files` | OK | **`[ok]`** | identity sources validate (`IDENTITY_SOURCES_VALID`); unchanged |
| 2 | `reports-owner-context` | TODO (path not configured in that shell) | **`[ok]`** | the Reports owner-context carrier resolved in the transport's environment. The product emits this result only when the resolver returns ok (`REPORTS_OWNER_CONTEXT_ESTABLISHED`, evidence level `configured-runtime` — code fact, `runtimeReadiness.ts`). Resolves the §11.3 row-3 "absent in this shell" |
| 3 | `np04-assessment-store` | TODO (path not configured in that shell) | **`[ok]`** | NP-04 database **file present**; **stored assessment content unverified by the diagnostic** (it opens no database). Presence of the file is not evidence that a record exists — the Infosys record exists by the separate-process read-back of the NP-04 record, not by this finding |
| 4 | `owner-context-carrier` | TODO (path not configured in that shell) | **`[ok]`** | the F-3 owner-context carrier resolved in the transport's environment (`OWNER_CONTEXT_ESTABLISHED`, `configured-runtime` — code fact). This is the first **direct** capture of D4 in a diagnostic (§11.5 had it "indirect only") |
| 5 | `ipd-binding-precondition` | TODO | **`[ok]`** | the declaration `IIPS_G3_IPC_BINDING_PROVISIONED` is present in the transport's environment. **A binding declaration is not proof of IPD retrieval**; IPD verifies the binding per request. The binding fact itself is IPD-owned and was verified in §2, not here |
| 6 | `ipc-endpoint` | TODO | **`[ok]`** | the configured endpoint **resolved** to an admissible local IPC target; **peer liveness was not probed** (by design). Liveness is evidenced by §3/§11.2, not by this finding |
| 7 | `fundamentals-dataset` | OK | **`[ok]`** | dataset **directory present, content unverified** (`DATASET_DIRECTORY_PRESENT_CONTENT_UNVERIFIED`); measurement for Infosys is evidenced by the NP-04 record (dataset version `sha256:bdfb2527…`) and the R-2 coverage captures (§3), not by this finding |
| 8 | `local-personal-use-enablement` | TODO (absent, "by design" for reads) | **`[ok]`** | **observation, recorded factually:** `IIPS_LOCAL_PERSONAL_USE` **is set** in the transport process (the product reports `[ok]` only for the value `1`; reason code `LOCAL_PERSONAL_USE_DECLARED`). See §12.3 |

Diagnostic-wide statements, as reported and preserved: no database was opened, created or migrated; no IPC
peer was contacted; no application data was written; the report describes only the process environment in
which it ran. `READ-PATH READY` is computed over findings 1–7 (the enablement finding is excluded from the
read-path verdict by the product — code fact), so `YES` here is a statement about the **read path** of the
three capabilities, in the transport's environment, and about nothing else.

### 12.3 Finding 8 — `IIPS_LOCAL_PERSONAL_USE` present in the transport process (recorded, not reinterpreted)

The handoff (§3.3) stated that `IIPS_LOCAL_PERSONAL_USE` "is **not** required for the read path on either
side and must not be set for this handoff: the host-run scope is reads only, and that switch enables IRR's
write routes." §11.3 row 8 recorded it as absent in the shell capture and treated that as the designed state.
The transport-environment capture shows the switch **is** set in the process that served the D5/D6 reads.

What this does and does not mean, kept apart:

- It does **not** invalidate any D5/D6 evidence. Every captured read in §3/§11.2 is a `GET`; the switch
  enables IRR's personal-use **write** routes (`POST`/`PUT`/`DELETE` under `/api/user-portfolios`) and
  grants no authority — IPD keeps its own per-request guards and write refusals (diagnostic text; IRR
  `runtimeReadiness.ts`). No write route was exercised by any Stage 5 step, and none is recorded as exercised.
- It is a **scope-boundary observation** against the handoff's "reads only" instruction, owned by the
  operator: the host runs the local personal application (the `/personal-portfolio` surface is admitted
  only when this switch is set — Program Authority 2026-11-08), which is a legitimate standing configuration
  of the single-user host, not a Stage 5 step. It is recorded here so the record matches the process that
  actually served the reads.
- Consequence for D10 / P6-B: the browser procedure must be explicit that **no create, save, edit or
  delete control is to be used** during acceptance, because on this host those controls are live. The
  procedure (§12.5) carries that instruction.

No host setting was changed, and none is to be changed on account of this finding; whether the switch stays
set is an operator decision outside Stage 5 scope.

### 12.4 What this capture closes, and what it does not

- **R-1 — GREEN in the transport environment.** The §11.5 row "captured, not green … remaining: the same
  diagnostic in the transport's process environment" is **closed**. The shell-vs-transport discrepancy of
  §11.3 is resolved exactly as predicted there (the TODO findings were properties of that shell), with one
  difference from the §11.3 expectation: findings 3 and 4 came back `[ok]`, not TODO, because the startup
  script does set the Reports carrier and NP-04 path for the transport process.
- **Necessary, not sufficient** (NP-04 record §9.3, R-1 row): exit 0 is a precondition for D10 / P6-B
  (P6-A §10 prerequisite 6), not Stage 5 acceptance.
- **D4** — now captured directly (finding 4 `[ok]` in the serving process); the "separate capture if
  watchlists are exercised" note stands only for the watchlist read itself.
- It does **not** independently prove the live IPC read. That proof is D5/D6 (§2, §3, §11.1, §11.2), which
  this capture neither repeats nor strengthens; the diagnostic contacted no peer.
- It does **not** verify NP-04 content or dataset content (findings 3 and 7, by the diagnostic's own words).
- **Stage 5 is not accepted; overall IID readiness remains NOT READY; Stage 4 remains closed as recorded.**

### 12.5 Stage 5 remaining work after this update (supersedes the status column of §11.5; the list is unchanged)

| Item | Owner | Status after §12 |
|---|---|---|
| D5 active binding | IPD fact / operator declaration | **CONFIRMED** (unchanged, §11.4). Open, IPD-owned: IPD's own publication |
| D6 live v2 read + independent read-back | operator / IPD peer | **DEMONSTRATED** (unchanged); peer authenticity NOT_ATTESTED (standing) |
| R-1 host readiness capture | operator | **CLOSED — GREEN in the transport environment** (`04-readiness-transport-environment.txt`, exit 0, `READ-PATH READY: YES`). Necessary-not-sufficient; qualifications §12.2 |
| D4 F-3 carrier | operator | **captured directly** (finding 4 `[ok]` in the serving process); watchlist read itself still not separately exercised — not required by any Stage 5 item |
| R-2 served coverage captures | operator | **CLOSED** (§3) |
| `IIPS_LOCAL_PERSONAL_USE` present in the transport process | operator | **observation recorded** (§12.3); no Stage 5 action; browser procedure forbids write controls |
| Marico / KEC successor v1 mints (three-issuer scope) | operator, existing CLI | open; not forced |
| Second comparable persisted assessment version + change diff | operator (genuine input change required) | open; not forced; **not** a prerequisite for the D10 base journey (P6-A §10 item 4: required only "if change comparison is to be exercised") |
| D10 / P6-B formal browser acceptance | operator host | **all seven P6-A §10 prerequisites 1–6 now evidenced** (reconciliation in `IID-STAGE-5-D10-P6B-BROWSER-ACCEPTANCE-PROCEDURE-2026-11-22.md` §2); prerequisite 7 — the recorded real browser journey — **is the remaining step**, and is **NOT EXECUTED** |
| Stage 4 data limitations | per Stage 4 records | accepted limitations, preserved; not Stage 5 work |

**Next roadmap step:** execute and record the D10 / P6-B browser journey per
`docs/integration/IID-STAGE-5-D10-P6B-BROWSER-ACCEPTANCE-PROCEDURE-2026-11-22.md` on build pair
IRR ≥ `a6df94ff…` / IPD `cbb116d2`, against the already-running transport (PID `18424`, no restart
required). IPD's publication proceeds in parallel under IPD ownership.

### 12.6 Verification performed for this update (Arena; IRR only; no host access)

| Check | Result |
|---|---|
| IRR `main` at the time of this update | `a2fa6823f2d4f14d5a3c358d72207bcb44381496` = PR #617 (snapshot daily field type narrowing; code/tests only). No documentation path touched; this update is branched from `7f39ddb8…` (PR #616 merge) and applies cleanly |
| Product facts cited | `frontend/server/investment/runtimeReadiness.ts`: enablement finding `[ok]` iff `IIPS_LOCAL_PERSONAL_USE === '1'` (reason `LOCAL_PERSONAL_USE_DECLARED`); `ready` computed over all findings except `local-personal-use-enablement`; carrier findings return `…_ESTABLISHED` only when the resolver returns ok; NP-04/dataset findings report `…_PRESENT_CONTENT_UNVERIFIED`; endpoint finding states "Peer liveness not probed" |
| Sanitisation | this section adds a PID, two file names and finding results; no environment **values**, no pipe-name value, no path beyond those already of record, no holdings, no binding/membership/owner/tenant values |
| Host / IPD-service facts | **none observed by Arena**; all operator-reported |

---

## 13. Evidence update — 2026-11-22, first D10 / P6-B browser pass (operator-reported, partial) and two findings resolved (appended; §§0–12 are the historical record)

Operator-reported; Arena opened no browser and accessed no host. This section records what the operator
observed in the first run of the D10 / P6-B procedure, the two findings it produced, their root causes as
established from the IRR source, and what was changed. **P6-B is not accepted by this section** (§13.6).

### 13.1 What the operator observed (as reported)

| Step (procedure §6) | Reported result | Status |
|---|---|---|
| 6.2 / 6.3 — `/user-portfolios` → `DHAN_PORTFOLIO` detail | the read-only view displayed the **64** Dhan holdings, the portfolio summary, the valuation, the holding weights and the latest persisted revision | **VERIFIED** (portfolio surfaces). The §9 summary-sheet figures (statuses, digest match, console/network sweep, 404 path, second portfolio) were **not supplied** with this report and remain to be recorded |
| 6.6 — **Company assessment →** from a Dhan holding | page reached; rendered: *"Company assessment — No stored assessment exists for this issuer. Assessments are produced by the operator CLI. Nothing is substituted for a failed read: no cached assessment, no client-side recomputation and no fallback store."* | **FINDING 1** — honest missing-data state; the bridge did not reach a stored assessment. The issuer id in the page URL was **not reported** |
| 6.6 — **Change history →** from the same holding | landed on the **same** Company assessment page; no distinct history view | **FINDING 2** — navigation defect, reproduced in source (§13.3) |

The Dhan portfolio portion is not to be repeated. D5, D6, R-1 and R-2 are unchanged and were not rerun.

### 13.2 Finding 1 — Company assessment: root cause and disposition

**Mechanism (source).** `UserPortfolioDetail` offers *Company assessment →* for every holding whose
`/api/investment/portfolio/DHAN_PORTFOLIO/identities` row carries an `issuerId` (roster resolution; `LinksCell`).
The link opens `/investment/company/<issuerId>?portfolioId=DHAN_PORTFOLIO&securityId=<id>`;
`CompanyAssessmentPage` reads `GET /api/investment/company/<issuerId>`; a `404 not-found` renders the fixed
copy observed (`ASSESSMENT_UNAVAILABLE_COPY['not-found']`, `src/api/investment.ts`). The copy is correct: the
NP-04 store on this host holds **one** assessment chain — Infosys `IN:CIN:L85110KA1981PLC013115`, version 1
(NP-04 record §4; Stage 4 §8 separate-process read-back) — while the roster the identities route resolves
against may be the 2,388-issuer set (O1 record §7.2, operator-reported host fact), so most of the 64 holdings
resolve to issuers for which **no assessment has ever been produced**. The page did exactly what it is
specified to do; the gap is between the population that resolves and the population that is assessed.

**Why no stored assessment exists, by issuer — and the only authorised remedies.** The issuer is read from
the company page URL (`/investment/company/<issuerId>`). Three cases, no fourth:

| Issuer in the URL | Why no chain | Authorised action | Not authorised |
|---|---|---|---|
| `IN:CIN:L85110KA1981PLC013115` (Infosys) | would be **unexpected** — this chain exists and was read back (Stage 4 §8, NP-04 record §4) | treat as a **defect**: compare the NP-04 path the serving transport resolved (§12.2 finding 3) with the store the mint wrote to (roadmap §C.1); re-run the Stage 4 §8 `show-investment-chain.ts` read-back **against the transport's own `--db` / `--owner-carrier`**; record the disagreement | re-minting Infosys (NP-04 record: "do not repeat the completed Infosys mint") |
| `IN:CIN:L15140MH1988PLC049208` (Marico) or `IN:CIN:L45200MH2005PLC152061` (KEC) | the Stage 5 three-issuer v1 mints for these two are **open operator work, not forced** (NP-04 record §9.3; evidence record §11.5/§12.5) | the existing operator CLI `frontend/server/investment/cli/generate-investment-artifacts.ts --issuer <CIN> --data-dir <dataset> --db <NP-04 path> --owner-carrier <Reports carrier>` run in the transport's environment (dataset covers all three issuers; identity resolves; PA-01 authority), then the Stage 4 §8 separate-process read-back, then the browser link. Expected content per tracker §16.305: NOT_QUALIFIED verdicts and exact `CAPITAL_STRUCTURE_INCOMPLETE` / stale-field withholdings — an honest artifact, not a pass | a mint whose purpose is only to make the page render; any engine, policy or input adjustment |
| any other issuer | the fundamentals dataset on the host covers **three issuers only** (Stage 4 coverage records; §16.305 "three-issuer population"); the IRR-side governed population is the O1 three (O1 record §3.1). The CLI would run the engine over **no statements** for that issuer and persist an INSUFFICIENT artifact — a synthetic assessment minted to satisfy a browser check | **none.** The observed 404 state **is the correct, honest result** for that holding. Record it; choose a holding whose issuer is one of the three for the bridge step | minting; adding the issuer to the dataset or population (an owner population decision under O1 item 4, outside Stage 5) |

**Disposition.** No product change is justified by finding 1: the missing-data behaviour is the specified
fail-closed behaviour and introduces no substitution. The D10 procedure is amended (§6.6) so the bridge step
targets a holding whose issuer is Infosys (the only stored chain) and records any other issuer's 404 as the
expected state. **Which case applies is an operator determination from the URL and is not made here.**
Candidate improvement, recorded and **not implemented** (unrequested product change): the holdings row could
state whether a stored assessment exists before the link is followed, as the Stage 4 discovery panel's
*Assessment* column does.

### 13.3 Finding 2 — Change history: root cause and correction

**Root cause (source, reproduced by test).** `Change history →` in `UserPortfolioDetail.LinksCell` was built by
`changeHistoryHref()` = `companyAssessmentHref(...) + '#change-timeline'` (IID WI-1 P5 design): the company
page scrolled to its change-timeline section. `CompanyAssessmentPage` mounts `ChangeTimeline` (the element
with `id="change-timeline"`) **only in the `ready` state** — in the `unavailable` (404) state it returns the
alert-only section. For an issuer with no stored chain the fragment therefore had no target, `useHashScroll`
timed out silently, and the reader saw the identical Company assessment page. Pinned by the first test in
`iidStage5D10ChangeHistoryNavigation.test.tsx` (`document.getElementById('change-timeline')` is `null`; no
*Change history* / *Version history* heading).

**Intended destination (existing architecture).** IID-03 Historical Change Intelligence has its own
workspace route `/investment/change-intelligence` (`CAPABILITY_ROUTES.changeIntelligence`, `ChangeIntelligencePage`;
Stage 4 procedure §7.6; landing page and `CapabilityBreadcrumb` already link it). It is addressed by issuer,
carries `portfolioId` / `securityId` / `reportId`, always renders a **Version history** section that names
itself in every read state (loading / unavailable / error / ready), lists the stored versions with
*Open this version →* links, and mounts the **existing** `ChangeTimeline` for comparisons — which enforces the
two-version rule itself and renders `no-history` with one version. Nothing is rebuilt and nothing is invented.

**Correction (product code, minimal).** `UserPortfolioDetail.tsx`: the holding row's *Change history →* now
uses `changeIntelligenceHref(issuerId, { portfolioId, securityId })` →
`/investment/change-intelligence?issuerId=<issuer>&portfolioId=DHAN_PORTFOLIO&securityId=<id>`. One import and
one `Link` target changed; the comment above `LinksCell` records why. `changeHistoryHref` itself, the company
page's in-page *Historical changes* stage link, and the `Change history →` links on the Stage 4 discovery panel
and identity-coverage page are **unchanged** (same anchor pattern; recorded in §13.5 as a follow-up, not
altered here so Stage 4-accepted surfaces are not disturbed by this Stage 5 fix).

**Behaviour after the fix, by data state (all read from the one existing assessment endpoint):**

| Issuer's stored chain | What the IID-03 page shows |
|---|---|
| none (404) | heading *IID-03 — Historical Change Intelligence*; *Version history* section with the alert *"No stored assessment exists for this issuer. Assessments are produced by the operator CLI."* and *"no cached history, no reconstructed comparison and no fallback store"*; no table, no timeline |
| one version (Infosys today) | *Version history* table with one row (v1, report id `6b6e2316-…`, generated, data-as-of, *Open this version →*); note *"a chain needs two stored versions before anything can be compared"*; `ChangeTimeline` in its `no-history` state |
| two or more versions | the table lists each; `ChangeTimeline` renders the consecutive comparisons with material changes, triggers and attribution, each linking the exact stored pair |

**Tests.** New `frontend/src/features/user-portfolios/iidStage5D10ChangeHistoryNavigation.test.tsx` (3 tests:
root-cause pin; href distinct from the company link and carrying context; click lands on the IID-03 page with
the honest 404 state and the chain read for that issuer). Updated expectations in
`iid6PortfolioIntegration.test.tsx` and `iidWi2LinkIndependence.test.tsx` (context-preservation cases 1–5
unchanged in intent). Targeted run 3 files / 19 tests pass; full frontend suite **224 files passed, 1 skipped
(pre-existing) / 3321 tests passed, 1 skipped**; `tsc --noEmit` clean.

### 13.4 Browser verification status of the two findings

| Finding | Repository verification | Browser verification |
|---|---|---|
| 1 — Company assessment | mechanism and store state established from source and published records (§13.2) | **not yet**: the issuer id from the URL has to be read and the §13.2 row applied; the bridge is then re-tried on an Infosys-resolving holding (or the Marico/KEC mint is performed first, if the operator elects to) |
| 2 — Change history | defect reproduced by test; correction merged with this update; distinct destination and honest 404 state covered by tests | **not yet**: requires the operator's IRR checkout to include this update, `npm run dev` restarted (Vite serves the new bundle; the transport need not restart), then procedure §6.6 step 3 |

### 13.5 Follow-ups recorded, not performed

- Sibling `Change history →` links on `CompanyDiscoveryPanel` and `IdentityCoveragePage` still use the
  `#change-timeline` anchor and have the same no-chain behaviour; unchanged here (Stage 4 surfaces). Owner
  decision whether to align them.
- Holdings-row assessment presence indicator (§13.2, candidate improvement) — not implemented.
- Marico / KEC v1 mints remain open, not forced; they are the only authorised way to widen the assessed
  population reachable from the Dhan holdings today.

### 13.6 Status after this update

Portfolio surfaces of D10 **verified** (operator-reported); company bridge and change history **not yet
verified in the browser**; §9 summary sheet outstanding. **P6-B NOT ACCEPTED. Stage 5 NOT ACCEPTED; overall IID
readiness NOT READY.** D5/D6/R-1/R-2 and Stage 4 closure unchanged. No IPD change, no pin advance, no host
setting changed, no write route, no mint performed, no assessment data synthesised.
