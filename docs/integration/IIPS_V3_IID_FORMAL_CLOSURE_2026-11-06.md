# IIPS v3.0 — IID formal closure and evidence reconciliation

**Date:** 2026-11-06 · **Work item:** IID formal closure · **Nature:** documentation and evidence reconciliation only.
**Repository head reconciled:** `edddfb0ad8ac1bb8ec1f317536a1786ece7cc918` (`main`, PR #482 merge).

This record formally closes the IID-0 … IID-6 implementation programme and states, criterion by criterion, what the
repository's own evidence supports. It is **append-only**: it supersedes nothing by deletion and it rewrites no
historical record. Where an earlier document still says a phase was "not started", §10 maps that sentence to the
overlay that supersedes it.

It does **not** reopen, redo or re-plan implementation. IID-6 is merged (`14de785`, PR #481); IID-0 … IID-5 are
merged; nothing in this record changes a line of product code, a test, a contract, a pin or a limitation.

**Addendum — 2026-11-06, later the same day (`HEAD` `aaf1f0c`).** Two determinations below have since been resolved by
recorded evidence, and only those two:

- **AC-X2 moves from `OPEN` to `PASS`** on a runtime measurement of the complete assess → persist → read cycle (§6.4;
  bundle `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/`). The gate's own missing artefact (§6.3) now exists.
- **AC-X6 moves from a qualified `PASS` to `PASS`**, with gap **G-8 closed as not a breach** (§7a): the 100 KB bound
  governs committed *fixtures*, and the file in question is committed *test evidence*.

Nothing else changed: no limitation (`L-001` … `L-029`), no other qualification (AC-X1 Q-1…Q-4, AC-2.6, AC-2.9,
AC-4.7), no product code, contract, pin or test. This addendum appends; it does not rewrite §6.1–§6.3, §7 or §8, which
stand as the record of what was open and why.

---

## 1. What "closure" means here, and what it does not

**Means.** Every IID-0 … IID-6 phase has an implementation, a merged commit, an acceptance matrix and an evidence
bundle in the repository; each cross-cutting gate has a determination traceable to a recorded artefact or to a
recorded gap; the remaining gaps are named rather than averaged away.

**Does not mean.** It is **not** production acceptance, admission or release. It is **not** a real-issuer validation.
It confers no trade-execution, brokerage or multi-user/auth scope. It establishes no Windows host behaviour. It does
not close any limitation (`L-001` … `L-029` keep their meanings and statuses — §9), and it does not begin R-16 sector
expansion, scheduling or any other future workstream.

---

## 2. Authoritative sources (inspected, not assumed)

| Artefact | Path | Authoritative for |
|---|---|---|
| Design of record | `docs/integration/IIPS_V3_IID_INVESTMENT_INTELLIGENCE_DESIGN_REFINEMENT_2026-11-05.md` | contracts, Part III surfaces A–J, cross-cutting gates §6.8 (AC-X1…AC-X5) |
| Roadmap | `docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md` | phases IID-0…IID-6, gates §3 (AC-X1…AC-X7), Part B corrections §B.A…§B.O |
| Limitation register | `docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md` | `L-001` … `L-029`, §1–§10 |
| IID-5 implementation record | `docs/integration/IIPS_V3_IID5_HISTORICAL_CHANGE_INTELLIGENCE_2026-11-06.md` | IID-5 behaviour, `L-014` closeout, `L-028`/`L-029` |
| `L-014` decision | `docs/integration/IIPS_V3_IID_L014_SUBSTANTIVE_IDENTITY_DECISION_2026-11-06.md` | substantive-identity grammar (implemented by IID-5) |

Evidence bundles, by phase — note the **location asymmetry**, which is real and not an error in this record:

| Phase | Evidence bundle | Phase AC table |
|---|---|---|
| IID-0 | `evidence/iid/IID-0-FOUNDATIONS-2026-11-05/` | roadmap §B.J |
| IID-1 | `evidence/iid/IID-1-IDENTITY-COVERAGE-2026-11-05/` | roadmap §B.J2 |
| IID-2 | `evidence/iid/IID-2-COMPANY-ASSESSMENT-2026-11-06/` (`ACCEPTANCE-MATRIX.md`) | §B.J3 |
| IID-3 | `evidence/iid/IID-3-PERSISTENCE-READ-TRANSPORT-2026-11-06/` (`ACCEPTANCE-MATRIX.md`, `INDEPENDENT-VERIFICATION.md`, `m1-demonstration.json`, `runs/`) | §B.J4 |
| IID-4 | `evidence/iid/IID-4-HOLDING-DISPOSITION-2026-11-06/` (`ACCEPTANCE-MATRIX.md`, `TEST-RUN.md`, `INDEPENDENT-VERIFICATION.md`, `POST-MERGE-VERIFICATION-2026-11-06.md`) | §B.J5 |
| IID-5 | **`evidence/integration/iid5-historical-change-intelligence-2026-11-06/`** (not under `evidence/iid/`) | §B.N |
| IID-6 | `evidence/iid/IID-6-PRODUCT-SURFACE-2026-11-06/` (`requirement-matrix.md`, `read-only-proof.md`, `accessibility.md`, `e2e-demo.md`, `corrections.md`, `fresh-clone-verification.md`, `test-run.txt`) | §B.O |
| **This reconciliation** | `evidence/iid/IID-CLOSURE-2026-11-06/` | §4–§7 of this document |

Merged commits (verified against `origin/main` history, not from a summary):

| Phase | PR | Merge commit |
|---|---|---|
| IID-3 | #464 | `f08da401dee12748581cbef5599d8c2e3758c84b` |
| IID-4 | #471 | `bc0de0ea9702a4b6a34138db4fbe9ec81bc0f688` |
| IID-5 | #479, #480 | `17f9395`, `83f4511e2ebac9d42c7f30f5798e8356c7b23edf` |
| IID-6 | #481, #482 | `14de785`, `edddfb0ad8ac1bb8ec1f317536a1786ece7cc918` |

---

## 3. Phase closure — IID-0 … IID-6

All seven phases are **implementation-complete**. "Complete" here means: the phase's code is merged on `main`, its
acceptance matrix exists, and every criterion in that matrix is marked PASS, with the two qualified PASSes listed in
§9.3 carried as such rather than flattened.

| Phase | Capability delivered | Merged | Evidence | Closure basis |
|---|---|---|---|---|
| **IID-0** | Foundations: frozen identity/dataset inputs, coverage artefacts | yes | `IID-0-FOUNDATIONS-2026-11-05/` (`coverage-report.json`, `dataset-manifest.json`) | roadmap §B.J: criteria PASS as recorded; `L-001`–`L-009` opened, none closed |
| **IID-1** | Identity coverage read model + view | yes | `IID-1-.../` (`test-log-investment.txt` 195 pass, `test-log-np12-regression.txt` 42 pass, `typecheck-iips-platform.txt` empty = clean) | roadmap §B.J2 |
| **IID-2** | Company assessment engine | yes | `IID-2-.../ACCEPTANCE-MATRIX.md` (23 PASS marks; AC-2.6 and AC-2.9 qualified — §9.3) | roadmap §B.J3 |
| **IID-3** | Assessment persistence, composition and read transport | yes (#464) | `IID-3-.../ACCEPTANCE-MATRIX.md` + `INDEPENDENT-VERIFICATION.md` (fresh clone, M-1 10/10) | roadmap §B.J4 |
| **IID-4** | Holding/candidate disposition engine, records, read transport | yes (#471) | `IID-4-.../ACCEPTANCE-MATRIX.md` (11 PASS), `TEST-RUN.md`, `POST-MERGE-VERIFICATION-2026-11-06.md` | roadmap §B.J5 |
| **IID-5** | Historical change intelligence (`L-014` resolved) | yes (#479, #480) | `evidence/integration/iid5-.../RESULTS.md`, `digests.json`, `test-run.txt` | roadmap §B.N |
| **IID-6** | Read-only product surface (all three capabilities in one workflow) | yes (#481, #482) | `IID-6-.../requirement-matrix.md`, `read-only-proof.md`, `fresh-clone-verification.md`, `test-run.txt` | roadmap §B.O |

**Per-phase AC accounting.** Each phase's own matrix is the authoritative criterion list; this record does not
re-tabulate the ~90 phase criteria, because duplicating them would create a second source of truth that could drift.
What this record adds is the cross-cutting determination (§4–§7), the qualified-PASS inventory (§9.3) and the gap
register (§8). Phase criteria with a qualified PASS are named individually there.

---

## 4. Cross-cutting gates — the numbering divergence, resolved

The design and the roadmap number the cross-cutting gates differently. This is a pre-existing, documented divergence;
it is not resolved by renumbering either document (that would rewrite settled records). Both tables are reconciled
here by *meaning*.

| Meaning | Design §6.8 | Roadmap §3 |
|---|---|---|
| test suites green + typecheck clean | AC-X1 | AC-X1 |
| zero sockets during assess → persist → read | AC-X2 | AC-X2 |
| no unpinned dependency; no exchange-domain dependency | AC-X3 | AC-X3 |
| dataset external to git; fixtures < 100 KB; committed fixtures small | AC-X4 | AC-X6 |
| no edit under `iips-platform/src/sector-engines/` | AC-X5 | AC-X4 |
| no new persistence store / second artifact store / SQLite outside IPD | *(implied by X5 of the design's persistence section)* | AC-X5 |
| every written artifact validates on write and on read | *(design §5 validation)* | AC-X7 |

Precedence, per the programme's own rule: design Part III wins over Part II/I, and roadmap **Part B** wins over Part A.
Where the two tables give the same criterion different numbers, this record cites the **meaning**, so a reader
checking either document lands on the same evidence.

---

## 5. AC-X1 — platform test evidence (determination: **PASS — satisfied by explicitly referenced prior evidence**, qualified)

**Gate as written.** Design §6.8: *"`npm test` in `frontend` and `iips-platform` pass with the new suites;
`npm run typecheck` clean."* Roadmap §3: *"`npm test` (frontend, `iips-platform`) green; `npm run typecheck` clean."*

### 5.1 The question asked, answered precisely

> Does the reported IID-3 platform verification satisfy the applicable requirement for IID-6?

**Partly, and it is not the applicable record.** IID-3's platform evidence (286/286 investment suite, 651/651
regression, clean `tsc`) was produced at the IID-3 merge `f08da40`. After it, **IID-4 changed `iips-platform`** —
commit `3bc70c3`, 18 files, **+4,476 / −6** lines, including a change to `src/investment/artifacts/scopeToken.ts`
(a file inside the assessment persistence path) and the whole `src/investment/disposition/` engine. IID-3's 286-test
figure is therefore *superseded*, not merely aged: the platform acquired 91 net new investment tests.

The **applicable** platform record for the IID-6 head is IID-4's post-merge verification, executed against the merged
`main` at `bc0de0e`:

- `iips-platform` typecheck `tsc --noEmit` → **exit 0, no diagnostics**
- `tsx --test tests/investment/*.test.ts` → **377 / 377 pass, 0 fail**
- recorded in `evidence/iid/IID-4-HOLDING-DISPOSITION-2026-11-06/POST-MERGE-VERIFICATION-2026-11-06.md` §2

### 5.2 Did IID-6 invalidate or require additional platform verification? **No — and this is a file-identity fact, not an assumption**

```
$ git diff --stat bc0de0e..HEAD -- iips-platform/
(no output)
$ git log --oneline f08da40..HEAD -- iips-platform/
3bc70c3 IID-4: holding disposition engine, composition, records, read transport
```

The `iips-platform` tree at the IID-6 head `edddfb0` is **byte-identical** to the tree that was verified at `bc0de0e`.
IID-5 and IID-6 contributed **zero** platform changes (IID-5's work was in `frontend/server/investment/change/**`;
IID-6's single server edit was `frontend/server/investment/dispositionService.ts`, a four-field addition to an existing
list projection). So **no additional platform verification was required by IID-6**, and none is claimed.

### 5.3 Component-by-component determination

| Component | Verdict | Evidence, with the commit it was measured at | Why it still describes the head |
|---|---|---|---|
| `frontend` suites + typecheck (IID-6) | **PASS — direct** | IID-6 fresh clone of `main` @ `14de785`: `npm run typecheck` clean; `vitest run src` 57 files / 546 passed / 1 skipped; `vitest run server/investment` 14 files / 199 passed — `evidence/iid/IID-6-.../test-run.txt`, `fresh-clone-verification.md`. CI on PR #481: `Typecheck · Test · Build` **pass** (run `42172710601`) | measured at the phase's own merge; PR #482 added one markdown file |
| `iips-platform` investment suite | **PASS — referenced prior evidence** | 377/377 @ `bc0de0e` (IID-4 post-merge §2) | platform tree identical at head (§5.2) |
| `iips-platform` typecheck | **PASS — referenced prior evidence** | `tsc --noEmit` exit 0 @ `bc0de0e` (IID-4 post-merge §2) | index is clean at the same commits; tree identical at head |
| `iips-platform` regression (`tests/regression/*`, 69 files) | **PASS — referenced prior evidence** | 651/651 @ `f08da40` (IID-3 `INDEPENDENT-VERIFICATION.md` §3 and §6) | `git diff f08da40..HEAD -- iips-platform/tests/regression/` is **empty**, and **no regression test references investment code** (`grep -rn investment iips-platform/tests/regression/` → no matches), so the IID-4 additions are outside that suite's dependency closure |
| `iips-platform` in-src tests (`src/**/*.test.ts`, 13 files) | **PASS — referenced prior evidence (weakest link, stated)** | standard command `npm test` recorded **648/648** at `7524f18` (`docs/integration/IIPS_v3.0_E2E-030_D42_DELTA_GOVERNANCE_DECISION.md`; `evidence/integration/e2e-030-replay-remediation-2026-10-11/…VALIDATION_REPORT.md` row "standard platform regression command") | the 13 files are unchanged since `f08da40`, and **non-investment platform `src` is unchanged since `7524f18`** (`git diff --stat 7524f18..HEAD -- iips-platform/src ':!iips-platform/src/investment'` → empty); no in-src test references investment code |

### 5.4 Why this is not a bare "probably fine"

`iips-platform/package.json` defines the commands separately:

```json
"test":    "tsx --test src/**/*.test.ts tests/regression/*.test.ts",
"test:iid": "tsx --test tests/investment/*.test.ts"
```

So the literal `npm test` **does not** run the investment suite, and the IID-era runs of the investment suite are
`test:iid`. Every component above has an executed record; the components partition the gate; and the platform diff
since the last execution of each component is empty **within that component's dependency closure**. That is the
strongest form the evidence supports.

### 5.5 Qualifications (stated, not buried)

- **Q-1 — no single `npm test` execution exists at an IID head.** The gate's literal command has not been run as one
  command at any IID merge. Green status is composed from three executions plus closure analysis. It is *not* claimed
  as a single measured green run.
- **Q-2 — the in-src test component's record is pre-IID** (October, `7524f18`). Its files and its non-investment
  imports are unchanged, which is why it still describes the head — but it is the weakest of the four components, and
  the 648 figure is not itemised into src + regression subsets.
- **Q-3 — platform tests were not re-run during IID-6 or during this reconciliation.** No such claim is made anywhere
  in this record. A single `npm test` in `iips-platform` at the head would replace §5.3–§5.5, not extend them.
- **Q-4 — CI does not cover this.** `.github/workflows/ci.yml` is scoped to `frontend/**` and states explicitly that
  standalone `iips-platform` checks "are not run by this workflow". A green PR check is therefore evidence for the
  `frontend` half only.

---

## 6. AC-X2 — zero-socket evidence (determination: **OPEN** when written — **now PASS**, see §6.4)

**Gate as written.** Design §6.8: *"No network access at analysis or read time: a test asserts zero sockets opened
during a full assess→persist→read cycle."* Roadmap §3: *"Zero sockets opened during a full ingest-free
assess → persist → read cycle."*

### 6.1 The verification the work item asked me to inspect does not exist

A repository-wide search for such a verification returns only the **definitions** of the gate and one unrelated family
of statements:

```
$ grep -rn "socket" evidence/iid/ docs/integration/IIPS_V3_IID_*.md
docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md:634  | AC-X2 | Zero sockets opened during … (the gate itself)
docs/integration/IIPS_V3_IID_INVESTMENT_INTELLIGENCE_DESIGN_REFINEMENT_2026-11-05.md:1160 | AC-X2 | … (the gate itself)
```

The NP-15 records that mention "0 providers / 0 sockets" are **production-boundary declarations** about providers and
credentials in a different workstream; they are not a measurement of an IID assess→persist→read cycle and cannot be
borrowed for it.

The IID-3 M-1 demonstration is the closest artefact. Its ten verification points are enumerated in
`evidence/iid/IID-3-PERSISTENCE-READ-TRANSPORT-2026-11-06/m1-demonstration.json` (`verification[*].name`): create;
independent read in a separate process; payload and evidence intact; unchanged re-run writes nothing; changed input
appends v2; v1 byte-identical and readable; both versions chain-valid; corrupted chain refused on read; sanitized
static 503; **no mutating route exists (8/8 → 405)**. **None of them measures sockets.** There is no instrumentation,
no `net.connect`/`dns.lookup` spy, no syscall trace and no recorded socket counter anywhere in the repository.

**Therefore AC-X2 is OPEN.** It was already OPEN before IID-6 and IID-6 did not create it.

### 6.2 What does exist is architectural evidence, and it is not the criterion

These are true and useful, and they are **not** a substitute for the measurement the gate requires:

| Observation | Command / artefact |
|---|---|
| No runtime server, client or socket construction in the investment code paths | `grep -rn "createServer\|\.listen(\|http.request\|net.connect\|new Socket" frontend/server/investment/ iips-platform/src/investment/` → no matches |
| No network module imported | the only `node:http` references are `import type http` (type-only, for `IncomingMessage`/`ServerResponse` shapes) — `frontend/server/investment/*-transport.ts`, transport tests, CLI demos |
| The transport tests use fake request/response pairs, not sockets | `frontend/server/investment/investment-transport.test.ts` header: "a fake request/response pair, the real service, a real store in a temporary directory" |
| IID-6 introduced no new network path | PR #481 touched no route handler: `git diff --stat 83f4511..HEAD -- frontend/server/` is exactly `dispositionService.ts` (+ its two test files); the two new clients are GET-only by construction (asserted in `src/api/iid6InvestmentClients.test.ts`) and call the same local `/api/investment/...` routes that already existed; the only new routes are client-side SPA paths in `src/app/routes.ts` |

**Scope note.** The gate concerns the server-side assess→persist→read cycle. A browser surface necessarily issues
HTTP requests to the local read transport; that is the transport the design permits, not a new socket path. So IID-6
neither satisfies nor endangers AC-X2 — it simply does not touch it.

### 6.3 Exact missing evidence

To move AC-X2 to PASS, one of the following must be produced **and recorded**, and neither has been:

1. a test (or a demonstration run) that instruments socket creation — e.g. wrapping `net.connect`/`net.createConnection`,
   `dns.lookup` and `http(s).request` — around a full **assess → persist → read** cycle, asserting **zero** invocations,
   with the run's output committed under `evidence/iid/`; **or**
2. an equivalent OS-level trace (e.g. `strace -f -e trace=network` on Linux) of the same cycle, with the trace file or
   its summary committed.

Until one exists, the criterion stays OPEN. Naming the missing artefact precisely is the whole point: it makes the gap
closable by one bounded act rather than an argument.

*That act has since been performed: both routes now exist, and the first was used. See §6.4.*

### 6.4 Resolution — the runtime measurement, and its result (**PASS**)

The artefact named in §6.3(1) now exists, committed, and the criterion is **PASS**. Bundle:
`evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/` (`AC-X2-RUNTIME-EVIDENCE.md`, four JSON run records, and
`commands-and-outputs.txt` with every command and its verbatim output).

**Scope measured, from the design's own scope clause.** §I.2 rule 2 fixes what "zero sockets" means: *"AC-X2 is 'zero
external network connections'. Loopback (`127.0.0.1`/`::1`) is permitted … What is prohibited is any outbound connection
to a non-loopback host, and any exchange-host URL."* Roadmap §B.I.3 repeats it. The measurement therefore asserts
**zero connections to a non-loopback destination**, classifies loopback separately, and treats a bind and a UNIX domain
socket as what they are rather than as connections.

**Instrumentation — two independent layers.**

1. *In-process interception* of all 22 Node APIs that can start an outbound connection (`net.connect`,
   `net.createConnection`, `net.Socket.prototype.connect`, `net.Server.listen`, `tls.connect`, `http(s).request`/`get`,
   the `dns.lookup`/`dns.resolve*`/`dns.promises` family, `dgram.createSocket`, `globalThis.fetch`). Attempts are
   classified LOOPBACK / EXTERNAL / LISTEN / IPC / LOCAL_SOCKET / UNRESOLVED, and an EXTERNAL destination **throws
   instead of connecting**, so the harness cannot perform the thing it is asserting against.
2. *Process-scoped socket-descriptor census* (`/proc/self/fd` → `socket:[inode]`) before and after the cycle — a
   different layer, so a path that bypassed the JS patches would still show up.

**Cycle measured** (product order, real store, real validators): `assembleAssessment` (analysis) → `recordAssessment`
through the governed NP-04 boundary (persistence) → `readChain` + `readVersionWithPayload` (read, service) →
`handleInvestmentRequest` with a fake request/response pair (read, transport).

**Results**, three executions in two processes, all machine-written:

| Run | Attempts | Socket descriptors |
|---|---|---|
| full cycle, plain Node process (`tsx` CLI `write` phase) | total 0 — external 0, loopback 0, listen 0, ipc 0, local-socket 0, unresolved 0 | 4 before, 4 after, **0 new** |
| read repeated in a **separate process** | total 0 | 4 before, 4 after, **0 new** |
| full cycle inside the test runner | total 0 | 4 before, 4 after, **0 new** |

Process ids and report ids are in the records themselves, not transcribed here — a reproduction produces its own.

The cycle did real work in each: version 1 written and read back, 66,726 B canonical payload, transport `HEAD` 200 with
`X-Investment-Artifact-Version: 1`, transport `GET` 200 with `version.artifactVersion = 1`; the separate read process
resolved the same head report id the writing process had written.

**The zero is not vacuous.** `zero-socket-control.test.ts` drives the probe with attempts that must be seen: seven
external attempts (including one through a `net.connect` reference captured **before** the probe was installed) — all
refused, all recorded EXTERNAL; and a real `127.0.0.1` round trip — permitted, recorded LOOPBACK, data received. The
control found a genuine defect in the instrument (Node passes `socket.connect` a normalised **array**, which the first
implementation misread as "no host" and would have classified as loopback); the fix recurses into the array and the
control asserts the pre-captured call is now recorded as EXTERNAL on `net.Socket.prototype.connect`. Product behaviour
was never affected — no assessed path exercises that channel — but the instrument is now unable to fail silently.

**Regression at the same commit:** whole `frontend` suite 142 files passed / 1 skipped, 1813 tests passed / 1 skipped
(1814); `npm run typecheck` and `tsc -p tsconfig.investment-server.json` clean. No production file changed; the four new
files are one probe module, two test files and one CLI used only to produce the evidence.

**Limitations of this evidence, stated rather than smoothed** (full list in the bundle §5): no syscall trace
(`strace`/`ltrace`/`bpftrace` are not installed here, so the measurement is Node-level plus the descriptor census, and
the log says so); no listening socket and therefore no loopback connection inside the cycle (the loopback permission is
exercised by the control instead); the full cycle runs in one process plus a second process for the read half. It says
nothing about production, multi-user or authenticated behaviour, and it closes neither `L-004` nor `L-009`.

**Therefore AC-X2 is PASS** — on runtime evidence, over the cycle the gate names, with the instrument shown to be live.

---

## 7. AC-X3 … AC-X7 (roadmap numbering) — determinations

| Gate | Determination | Evidence |
|---|---|---|
| AC-X3 — no unpinned dependency, no exchange-domain dependency | **PASS** | IID-6 added no dependency at all: `frontend/package.json` and `package-lock.json` are absent from PR #481's file list (38 files, verified via `gh pr view 481`). Pins in use are the pre-existing `iips-np04-governed-persistence #2e11fa3b`, `iips-production-market-data #279d1eed`, `iips-broker-import #07e86a4f` (design §7.1). No exchange host is contacted by any surface (`read-only-proof.md` §7) |
| AC-X4 — no edit under `iips-platform/src/sector-engines/` | **PASS** | PR #481 contains **zero** `iips-platform/` paths; `git diff bc0de0e..HEAD -- iips-platform/` is empty, so nothing there has changed since IID-4 |
| AC-X5 — no new persistence store / second artifact store / SQLite outside IPD | **PASS** | IID-6 adds no table, cache, journal, migration or adapter; the coverage page *names* `ChangeService.reconcile` as an operator action and exposes no control for it (`read-only-proof.md` §5; `iid6ChangeTimeline.test.tsx` asserts every button label). IID-4/IID-5 wrote only through the existing NP-04 record path on `hd:`/`hc:`/`icr:` scopes |
| AC-X6 — dataset external to git, fixtures small | **PASS** (G-8 closed as not a breach — §7a; the qualification was recorded when this row was first written) | No dataset is committed anywhere in the IID record, and every input fixture is small: `iips-platform/tests/investment/fixtures/` totals **37,433 B** with the largest file at 7,929 B (`identity/observations.json`; re-measured at `aaf1f0c` — this row originally named the largest top-level file, 4,100 B `roster.json`, and missed the `identity/` subdirectory). IID-6 commits no dataset and no artifact; its largest new files are source modules. One **evidence** golden payload, `evidence/iid/IID-2-COMPANY-ASSESSMENT-2026-11-06/golden-tech.json`, is **109,948 B** (107.4 KiB) — above the gate's 100 KiB *fixture* bound. It is an expected-output record, not an input fixture, and it is not under any `fixtures/` path; under the strictest reading of "artifacts external to git" it is an exception, so it is recorded as G-8 rather than smoothed away |
| AC-X7 — artifacts validate on write and on read | **PASS — referenced prior evidence** | IID-3 `INDEPENDENT-VERIFICATION.md` §4 (chain validation on read, corruption refused with a static 503) and M-1 points 3, 6, 7, 8; IID-4 `POST-MERGE-VERIFICATION` §3. IID-6 writes nothing, so it adds no artifact to validate |

### 7a. AC-X6 / G-8 — the fixture-size bound, and what it governs (**PASS**, G-8 closed)

The bound in the gate — *"committed fixtures each <100 KB"* — is attached to one data **class**, not to every committed
file. Design §I.2 rule 3 (`:2228–2231`) defines the classes: "(b) *committed fixtures* — synthetic or public-domain
extracts, **each < 100 KB**, no PII; (c) *test evidence* — sanitized summaries (counts, pass/fail, digests), never raw
user data or partition literals." Roadmap §B.I.4 (`:888–894`) assigns them locations: class (b) to
`iips-platform/tests/investment/fixtures/` ("<100 KB total"), class (c) to `evidence/iid/**` — with no size bound.

`evidence/iid/IID-2-COMPANY-ASSESSMENT-2026-11-06/golden-tech.json` (109,948 B) is class (c): committed test evidence, in
the class (c) location, over the synthetic fixture issuer (`IN:ISIN:IN0000000201`, `Aarav Systems Limited`,
`bindingRef: fixture`), containing no user data and no partition literals. **The bound does not apply to it**, so G-8 was
never a breach — the earlier row read the gate's one-line summary as if it covered all committed artefacts, which the
design's own class definitions show it does not.

The bound is nonetheless met where it does apply, re-measured at `aaf1f0c`
(`evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/AC-X6-G8-DETERMINATION.md`, `commands-and-outputs.txt` §8–§9):

| Where | Size |
|---|---|
| `iips-platform/tests/investment/fixtures/` (10 files, the directory the roadmap names) | **37,433 B total**, largest file **7,929 B** |
| `iips-platform/tests/regression/fixtures/` | 61,539 B total, largest file 42,478 B |
| `ies-010…015/fixtures/`, `iips-cross-sector/fixtures/` | 1,851 B – 6,178 B each |
| **any** file under **any** committed `fixtures/` directory | **none exceeds 100 KB**; the largest is 42,478 B |

One honest note, offered for a future revision of the design rather than as a failed criterion: class (c) is
*described* as "summaries", and a full expected-payload dump is broader than that description — it is a golden file,
the standard way to pin an engine's output, and `golden-digests.json` (4,515 B) already carries the summary form. The
file was **not** shrunk, moved or regenerated to satisfy a reading of the gate, and `golden-tech.json` remains 109,948 B.

**Therefore AC-X6 is PASS and G-8 closes as *not a breach*.**

---

## 8. Gap register — everything that is not fully evidenced

| ID | Item | Status | Exactly what is missing |
|---|---|---|---|
| **G-1** | **AC-X2** zero-socket test | **CLOSED** | nothing — the instrumentation and its committed output now exist (§6.4; `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/`). What was missing when this row was written: the instrumentation or trace described in §6.3, with committed output |
| G-2 | AC-X1 literal `npm test` at an IID head (Q-1) | **qualified PASS** | one execution of `npm test` in `iips-platform` at an IID merge; composition is sound but is not a single measured run |
| G-3 | AC-X1 in-src test component (Q-2) | **qualified PASS** | an IID-era run of `src/**/*.test.ts`; today's support is a pre-IID record with an intact dependency closure |
| G-4 | IID-5 evidence bundle location | **recorded** | sits under `evidence/integration/` while IID-0…IID-4 and IID-6 sit under `evidence/iid/`. Not moved (moving would break committed cross-references); indexed in `evidence/iid/README.md` |
| G-5 | Real-issuer validation | **not attempted, out of scope** | an approved real dataset (`L-009`); no real issuer has been assessed, dispositioned or compared |
| G-6 | R-16 sector coverage | **OPEN by design** | 3 of 13 sectors measured (`L-001`); sector expansion is explicitly out of scope for this work item |
| G-7 | Windows host-operation evidence | **not produced, out of scope** | no host-operation evidence of any kind is claimed by IID-0…IID-6 |
| G-8 | AC-X6 fixture-size bound vs one committed golden | **CLOSED — not a breach** | nothing: the bound governs class (b) committed *fixtures*, and this file is class (c) *test evidence* (§7a; `…/AC-X6-G8-DETERMINATION.md`). Every committed fixture is ≤ 42,478 B and the IID fixture corpus is 37,433 B, so the bound is met where it applies. What this row recorded when written: `evidence/iid/IID-2-COMPANY-ASSESSMENT-2026-11-06/golden-tech.json` is 109,948 B (107.4 KiB), above the 100 KiB bound that the gate applies to *fixtures*. No dataset is committed and every actual fixture is ≤ 4,100 B (37,433 B in total). If the bound is read to apply to all committed artifacts, this file is a breach and should either be regenerated smaller or moved to external storage — that decision is not taken here |

---

## 9. Limitations — preserved

### 9.1 Statement

`L-001` … `L-029` are **unchanged**: same identifiers, same meanings, same statuses, same numbering. No limitation was
closed, softened or upgraded because a phase finished. Two clarifications this reconciliation adds are *pointers*, not
status changes:

- `L-014` remains `RESOLVED` (decision recorded 2026-11-06, implementation delivered by IID-5, per §B.N and register
  §9). Its resolution is an implementation fact already recorded, not something this closure confers.
- `L-028` / `L-029` remain as recorded by IID-5; IID-6 renders them honestly (attribution `UNAVAILABLE` with its
  cause; materiality policy version printed beside every materiality label) and does not weaken either.

### 9.2 Verification performed for this section

The register's limitation table was read end-to-end and diffed against `main` at the reconciliation base: this record
edits **no** limitation entry. The only register change in this work item is an appended §11 that points here.

### 9.3 Qualified PASSes carried forward (not flattened)

| Criterion | Qualification as recorded by its own phase | Where |
|---|---|---|
| AC-2.6 | PASS, "first clause structural — see limitation 2" | `IID-2-.../ACCEPTANCE-MATRIX.md` |
| AC-2.9 | PASS, "R-15 single-source rule applied — see note" | `IID-2-.../ACCEPTANCE-MATRIX.md` |
| AC-4.7 | PASS by "a structural walk of keys and prose", i.e. an enumerative check rather than a behavioural test | `IID-4-.../ACCEPTANCE-MATRIX.md` |
| AC-6.1 … AC-6.7 | PASS as recorded in `IID-6-.../requirement-matrix.md`; AC-X2 within that file is now corrected by its §6 | `IID-6-.../requirement-matrix.md` §6 |

---

## 10. Supersession index — stale "not started" sentences and what supersedes them

Nothing below was rewritten. Each line maps a historical sentence to the overlay that supersedes it, so a reader who
lands on the old text is not misled.

| Location | Stale sentence (abridged) | Superseded by |
|---|---|---|
| roadmap L530 (IID-5 section) | "`IID-6` remains **NOT STARTED**" | §B.O (IID-6 implemented); this record §3 |
| roadmap L1113 (§B.J4 "Not done") | "IID-4, IID-5 and IID-6 were not started" | §B.J5, §B.N, §B.O |
| roadmap L1176–1178 (§B.L) | "IID-5 … NOT STARTED. IID-6 … NOT STARTED" | §B.N (IID-5), §B.O (IID-6) — §B.L is preserved verbatim, as §B.N/§B.O state |
| roadmap L1197, L1214 (§B.M) | "IID-4, IID-5, IID-6 remain NOT STARTED, M-2/M-3 not delivered" | §B.J5, §B.N, §B.O; milestones M-2/M-3 delivered as capabilities, not as scheduled operations (§B.N, §B.O) |
| roadmap L1222–1223 (§B.N) | "IID-6 remains NOT STARTED" | §B.O |
| register §9 header (L722) | "IID-5 … NOT STARTED. IID-6 … NOT STARTED" | register §9 body (IID-5 delivered), §10 (IID-6), §11 (this closure) |
| register L380 (L-014 status history) | "IID-5 not started" (dated entry in a history line) | same line's later entry: "2026-11-06 (IID-5) — implementation shipped and tested; status `RESOLVED`" |
| `IIPS_V3_IID_L014_SUBSTANTIVE_IDENTITY_DECISION_2026-11-06.md` L497–499 | "IID-5 is NOT STARTED … IID-6 is NOT STARTED" | §B.N, §B.O; the decision document is a point-in-time record and is not amended |
| roadmap §B.B / design §6.8 gate numbering | design AC-X4/X5 mean different things from roadmap AC-X4/X5 | §4 of this record maps by meaning |
| roadmap §B.P, AC-X2 paragraph | "**AC-X2 … — OPEN** … The criterion was OPEN before IID-6 and remains OPEN" | §B.Q (roadmap) and §6.4 of this record — the runtime measurement now exists and AC-X2 is **PASS** |
| roadmap §B.P, AC-X6 clause | "**AC-X6 is a qualified PASS** … one committed evidence golden … exceeds the gate's 100 KiB *fixture* bound" | §B.Q (roadmap) and §7a of this record — the bound governs the fixture class, and G-8 closes as not a breach |
| register §11, AC-X2 bullet | "**AC-X2 (zero-socket measurement) is `OPEN`.**" | register §12 and §6.4 of this record |
| register §11, AC-X6 wording | "the closure records … G-8" qualification implied by the register's §11 table | register §12 and §7a of this record |

---

## 11. What this reconciliation ran, and what it did not

**Ran (documentation and repository inspection only):** `git fetch --unshallow`, `git log`, `git diff --stat`,
`git merge-base --is-ancestor`, `gh pr view --json files`, `gh pr checks`, `python3` JSON reads of committed evidence, and the greps
recorded verbatim in `evidence/iid/IID-CLOSURE-2026-11-06/commands-and-outputs.txt`.

**Did not run:** `frontend` suites, `iips-platform` suites, any typecheck, any demonstration, any build, and any socket
instrumentation. No test result in this record is newly measured; every number is quoted from a committed evidence file
with the commit it was measured at. Where a claim rests on file identity rather than execution, it says so (§5.3, §5.4).

---

## 12. Closure statement

**IID-0 … IID-6 are implementation-complete**, each merged on `main` with an acceptance matrix and an evidence bundle
(§3), subject to the qualifications in §5.5 and the gaps in §8.

**Open criteria:** none of the cross-cutting gates. **AC-X2 closed on runtime evidence** (§6.4) and **AC-X6 closed with
G-8 resolved as not a breach** (§7a), both on the 2026-11-06 addendum at `aaf1f0c`. **Qualified criteria:** AC-X1
(§5.5 Q-1…Q-4), AC-2.6, AC-2.9, AC-4.7 (§9.3). The phase-level gaps in §8 that are not part of those gates remain as
recorded (G-2, G-3 qualified; G-5, G-7 out of scope by statement; G-6 open by design).

**Not closed by this record:** any limitation, R-16 sector coverage, real-issuer validation, scheduling, Windows host
evidence, production readiness, admission, release, trade execution, brokerage integration, or multi-user/auth scope.
Nothing here should be read as a production claim.
