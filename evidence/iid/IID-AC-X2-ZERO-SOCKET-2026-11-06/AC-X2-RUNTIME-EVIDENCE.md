# AC-X2 — runtime evidence: zero external network connections over assess → persist → read

**Determination: AC-X2 PASS.** A test and a two-process run both execute the complete assessment → persistence → read
cycle under instrumentation and observe **zero** attempts to reach a non-loopback destination, and **zero** new socket
descriptors in the process that did the work. The assertion is runtime, not static.

- Gate: design §6.8 — *"No network access at analysis or read time: a test asserts zero sockets opened during a full
  assess→persist→read cycle."* Roadmap §3 — *"Zero sockets opened during a full ingest-free assess → persist → read
  cycle."*
- Bundle: `evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06/` (this file, four JSON records, a handoff, and the verbatim
  command log `commands-and-outputs.txt`).
- Code: `frontend/server/investment/demo/zeroSocketProbe.ts` (instrumentation and both cycle runners),
  `frontend/server/investment/zero-socket.test.ts` (the assertion),
  `frontend/server/investment/zero-socket-control.test.ts` (negative control),
  `frontend/server/investment/cli/zero-socket-cycle.ts` (the two-process run).
- Measured at `HEAD = aaf1f0c` (the PR #483 merge) on Node v22.22.3, Linux.

---

## 1. What the requirement actually requires — the interpretation this evidence is measured against

The gate is stated three times. The two later statements fix its **scope**, and they are the ones this work implements:

| Source | Text |
|---|---|
| design §6.8 (`:1160`) | "No network access at analysis or read time: a test asserts zero sockets opened during a full assess→persist→read cycle." |
| design §I.2 rule 2 (`:2225–2227`) | "**AC-X2 is 'zero external network connections'.** Loopback (`127.0.0.1`/`::1`) is permitted, because later phases talk to a local transport. What is prohibited is any outbound connection to a non-loopback host, and any exchange-host URL. Verified by a static module-graph scan in IID-0 and by **socket-level assertion once a transport exists**." |
| roadmap §B.I.3 (`:883–886`) | "No outbound connection of any kind … Loopback to a locally-started process is not an external connection and is not what AC-X2 forbids; a connection to any non-loopback host is." |

So the requirement **does** distinguish external/provider access from local application transport, and it does so in
the direction that matters here: the design *expects* a browser or a local transport to talk to `127.0.0.1`, and
forbids only the outbound connection to a non-loopback host and any exchange-host URL. The shorthand "zero sockets" in
§6.8 therefore means **zero external sockets**, measured at runtime once a transport exists — which it now does (IID-3).

Two further obligations follow from that reading, and both are honoured below:

1. **It must be a socket-level assertion, at runtime.** Static inspection was excluded by the work item and is not
   offered here as evidence.
2. **Loopback must be classified, not silently counted or silently ignored.** The probe reports it as its own class, and
   the negative control proves the class is reachable (a real `127.0.0.1` round trip is permitted and recorded).

---

## 2. The path that was measured (complete, in product order)

| # | Step | Code |
|---|---|---|
| 1 | **Analysis** — dataset read, identity resolution, engine assessment, composition | `server/investment/demo/m1Pipeline.ts` `assembleAssessment` (`:126`), dataset from `prepareM1Environment` (`:52`), engine `assessCompany` |
| 2 | **Persistence** — governed NP-04 write through the authorized boundary | `server/investment/investmentArtifacts.ts` `recordAssessment` (`:524`) → `recordComposed`; port `adaptNp04Store(new GovernedArtifactStore(db))`; store `iips-np04-governed-persistence` |
| 3 | **Read (service)** — validated chain read plus the version's canonical payload | `investmentArtifacts.ts` `readChain` (`:700`), `readVersionWithPayload` (`:760`) |
| 4 | **Read (transport)** — the same handler the server mounts, called with a fake request/response pair | `server/investment/investment-transport.ts` `handleInvestmentRequest` (`:248`), routes `INVESTMENT_ROUTES` (`:39`) |

The two-process run adds a fifth measurement: step 3 repeated **in a separate OS process** that opens the store from
disk, so "read time" is not measured only in the process that did the writing.

Nothing is stubbed on the persistence or validation side: the run writes a real artifact into a real governed store in
a temporary directory and reads it back through the real validators.

---

## 3. The instrumentation (two independent layers)

### 3.1 Layer 1 — in-process interception of every outbound-connection API

Installed before the cycle runs and removed afterwards (`installNetworkProbe`). Node's built-in modules are singletons,
so replacing a method on the module object covers every caller, whenever it imported the module:

```
net.connect · net.createConnection · net.Socket.prototype.connect · net.Server.listen
tls.connect
http.request · http.get · https.request · https.get
dns.lookup · dns.resolve · dns.resolve4 · dns.resolve6 · dns.resolveAny · dns.resolveSrv · dns.resolveTxt
dns.promises.lookup · dns.promises.resolve · dns.promises.resolve4 · dns.promises.resolve6
dgram.createSocket
globalThis.fetch
```

22 channels. Each attempt is classified before anything happens:

| Class | Meaning | Counted as a violation? |
|---|---|---|
| `EXTERNAL` | destination is any host that is not loopback (a hostname or a routable address) | **yes** |
| `UNRESOLVED` | a DNS call whose target could not be read | **yes** (fail closed) |
| `LOOPBACK` | `127.0.0.1`, `::1`, `::ffff:127.0.0.1`, `localhost` | no — permitted by design §I.2 |
| `LISTEN` | a bind (`0.0.0.0`, `::`, a port) — not a connection | no |
| `IPC` | a UNIX domain socket | no |
| `LOCAL_SOCKET` | a socket created with no destination (e.g. an unbound UDP socket) | no |

**The probe is fail-closed where the criterion forbids**: an `EXTERNAL` destination throws instead of connecting. The
harness therefore cannot quietly perform the thing it is asserting against, and a violation would surface as a failed
step rather than as a passing zero.

### 3.2 Layer 2 — process-scoped socket-descriptor census

`/proc/self/fd` is enumerated before and after the cycle and every entry whose link target is `socket:[inode]` is
recorded. This is deliberately a different layer: a path that bypassed the JS patches (native addon, pre-captured
reference) would still have to obtain a descriptor. The census is reported as *unavailable* where `/proc` is absent
rather than being silently treated as zero.

### 3.3 Anti-vacuity: the negative control

A zero from an instrument that never fires proves nothing, so `zero-socket-control.test.ts` drives the probe with
attempts that **must** be seen. Recorded in `zero-socket-control.json`:

| Control | Expected | Observed |
|---|---|---|
| `net.connect({host:'example.com',port:443})` | EXTERNAL, refused | refused, recorded EXTERNAL |
| `net.createConnection({host:'203.0.113.10',…})` | EXTERNAL, refused | refused, recorded EXTERNAL |
| `tls.connect({host:'example.com',…})` | EXTERNAL, refused | refused, recorded EXTERNAL |
| `http.request('http://example.com/')` | EXTERNAL, refused | refused, recorded EXTERNAL |
| `https.request({hostname:'example.com',…})` | EXTERNAL, refused | refused, recorded EXTERNAL |
| `fetch('https://example.com/')` | EXTERNAL, refused | refused, recorded EXTERNAL |
| a `net.connect` **reference captured before the probe was installed** | EXTERNAL, refused | refused, recorded EXTERNAL on `net.Socket.prototype.connect` |
| real loopback round trip to a local `net.Server` | LOOPBACK + LISTEN, **permitted**, data flows | permitted; `received "ac-x2-loopback-ok" over 127.0.0.1:<port>` |
| `dns.lookup('localhost')` | recorded on the dns channel | recorded, resolved `::1` |
| `dgram.createSocket('udp4')` | no destination ⇒ not a connection | recorded LOCAL_SOCKET |

Control totals: **13 attempts — 7 EXTERNAL (all refused), 4 LOOPBACK, 1 LISTEN, 1 LOCAL_SOCKET, 0 UNRESOLVED.**

**This control found a real defect, and it is fixed and pinned.** Node's `net.connect` normalises its arguments and
then calls `socket.connect(normalizedArgsArray)`, so the backstop channel receives an **array**. The first
implementation read that array as "no host" and classified it as loopback — meaning a pre-captured `net.connect`
reference could have opened an external connection *and been recorded as permitted*. `parseAddressArgs` now recurses
into the array, and the control asserts that the pre-captured call appears as
`net.Socket.prototype.connect → example.com → EXTERNAL → refused`. Nothing in the assessed cycle ever exercised that
path, so the product behaviour was never wrong; the *instrument* was, and it is now unable to be wrong in that way
silently.

---

## 4. What was run, and what it returned

Three independent executions of the same cycle, each writing its own record. All numbers below are read back out of the
JSON, not transcribed (see `commands-and-outputs.txt` §7).

| Run | Record | Cycle steps | Attempts | Socket descriptors |
|---|---|---|---|---|
| Full cycle, plain Node process (`tsx` CLI, `write` phase) | `zero-socket-run.json` | analysis ✓ · persistence ✓ · read/service ✓ · read/transport ✓ | total 0 · external 0 · loopback 0 · listen 0 · ipc 0 · local-socket 0 · unresolved 0 | 4 before, 4 after, **0 new** |
| Read in a **separate** process, from the store written above | `zero-socket-read.json` | open store ✓ · chain + payload ✓ | total 0 · external 0 · loopback 0 · listen 0 · ipc 0 · local-socket 0 · unresolved 0 | 4 before, 4 after, **0 new** |
| Full cycle inside the test runner (the committed assertion) | `zero-socket-test.json` | same four steps ✓ | total 0 · external 0 · loopback 0 · listen 0 · ipc 0 · local-socket 0 · unresolved 0 | 4 before, 4 after, **0 new** |

Process ids, ids and timestamps live in the records themselves rather than in this table — a reader reproducing the run
gets different ones, and the records are the source of truth (`commands-and-outputs.txt` §7 prints them).

The cycle did real work in all three: version **1** written and read back (`outcome CREATED`, `wrote true`), **66,726 B**
canonical payload, transport `HEAD` 200 with `X-Investment-Artifact-Version: 1`, transport `GET` 200 with
`version.artifactVersion = 1` and a 69,638 B body. The separate read process resolved the **same** `headReportId` that
the writing process recorded in `handoff.json` — the join is in the records, not in this sentence.

The test asserts all of it: the four steps and their order, the cycle's own numbers, `external = 0`,
`unresolved = 0`, an empty `externalDestinations` list, `determination.pass = true`, no new descriptor, and that the
instrumented channel list is complete (≥ 13 channels including `net.connect`, `net.Socket.prototype.connect`,
`tls.connect`, `http.request`, `https.request`, `dns.lookup`, `globalThis.fetch`) — so the pass cannot become vacuous by
losing its instrumentation.

Regression: the whole `frontend` suite at this commit is **142 files passed / 1 skipped, 1813 tests passed / 1 skipped
(1814)**, and both typechecks are clean (`npm run typecheck`, and `tsc -p tsconfig.investment-server.json`).

---

## 5. Limitations of this evidence — stated, not smoothed

1. **No syscall trace.** `strace`, `ltrace` and `bpftrace` are not installed in this environment (`command -v` output in
   `commands-and-outputs.txt` §0). The measurement is therefore **in-process** Node-level instrumentation plus a
   process-scoped descriptor census; it speaks for this Node process, not for the kernel. The gate's own wording — "a
   test asserts zero sockets opened" — is satisfied by exactly this, and the transcript says which half of the intended
   belt-and-braces was available.
2. **No listening socket, and therefore no loopback connection, in the cycle.** The transport is exercised through the
   real handler with a fake request/response pair, as the M-1 demonstration does, so the cycle contains neither a bind
   nor a local connect. The loopback *permission* is not exercised by the cycle itself; it is exercised by the negative
   control, which proves the class is reachable and permitted.
3. **The full cycle runs in one process**, plus a second process for the read half. The cross-process read in the M-1
   demonstration (its point 2) is not repeated; an uninstrumented child process would weaken the assertion rather than
   strengthen it.
4. **Counts bound attempts, not connections.** A layered API can report one would-be connection on two channels
   (`http.request` and the `net.Socket` beneath it). Every count here is zero, so the distinction does not affect the
   verdict.
5. **Pre-captured references.** A module that captured a `net`/`http` function before the probe was installed would not
   be intercepted directly; `net.Socket.prototype.connect` catches the socket such a path eventually creates, the
   descriptor census is the second backstop, and the control demonstrates the first one working.
6. **Scope.** This says nothing about production, multi-user or authenticated behaviour, closes neither L-004
   (synthetic dataset) nor L-009 (no real issuer), and is not a security audit of the runtime. It is the assertion the
   gate asks for, over the cycle the gate names.

---

## 6. How to reproduce

```bash
cd frontend
npx vitest run server/investment/zero-socket.test.ts server/investment/zero-socket-control.test.ts

# the same cycle in plain Node processes, with the read measured in its own process
OUT=../evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06
GIT_COMMIT=$(git rev-parse HEAD) npx tsx server/investment/cli/zero-socket-cycle.ts write \
  --handoff $OUT/handoff.json --record $OUT/zero-socket-run.json
GIT_COMMIT=$(git rev-parse HEAD) npx tsx server/investment/cli/zero-socket-cycle.ts read \
  --handoff $OUT/handoff.json --record $OUT/zero-socket-read.json
```

Both phases exit `0` only when the phase passed; the record says why when it did not.

---

## 7. Verdict

**AC-X2 — PASS, on runtime evidence.** Over a complete assess → persist → read cycle, in three executions and two
processes, the instrumented runtime observed **no attempt to reach a non-loopback destination**, no DNS call, no
`http(s)` request, no exchange-host URL, and **no new socket descriptor**, while the cycle performed its real work
(write, validated chain read, payload read, and two transport reads). The instrumentation is shown to be live by a
negative control that refuses seven external attempts, including one through a reference captured before installation.

What this changes: AC-X2 moves from **OPEN** to **PASS** (gap G-1 closes). What it does not change: L-001 … L-029, the
AC-X1 qualifications Q-1…Q-4, AC-2.6, AC-2.9, AC-4.7, and every other qualified or open criterion in the closure
record. No criterion was promoted without evidence, and no limitation was renumbered or softened.
