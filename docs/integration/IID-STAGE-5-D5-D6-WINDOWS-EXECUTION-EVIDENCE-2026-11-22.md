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
— plus IPD's own publication of the confirmation. The IPD proposal's approved acceptance model
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
read is to be repeated.

### 7.3 Can D5 / D6 be formally closed?

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

## 9. What Stage 5 still needs (unchanged list; status after this evidence)

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
