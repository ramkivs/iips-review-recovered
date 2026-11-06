> **Superseded on the finding, preserved as history.** This file recorded AC-X2 as `OPEN` because no runtime
> measurement existed when the closure bundle was written. One now does: **AC-X2 is PASS** on the runtime evidence in
> `../IID-AC-X2-ZERO-SOCKET-2026-11-06/AC-X2-RUNTIME-EVIDENCE.md`, reconciled in closure §6.4, roadmap §B.Q and register
> §12. Read this file for *why it was open* and *what was missing*; read the newer bundle for the measurement itself.
> Nothing below was edited.

# AC-X2 — zero-socket evidence (reconciled): **OPEN**

**Determination:** **OPEN — the required verification does not exist in this repository.**
**No new verification was performed, and none is claimed.** This file records what exists, why it does not satisfy the
criterion, and the exact artefact that would.

Authoritative closure text: `docs/integration/IIPS_V3_IID_FORMAL_CLOSURE_2026-11-06.md` §6.

---

## 1. Gate text

| Source | Text |
|---|---|
| Design §6.8 | No network access at analysis or read time: **a test asserts zero sockets opened** during a full assess→persist→read cycle. |
| Roadmap §3 | **Zero sockets opened** during a full ingest-free assess → persist → read cycle. |

The criterion is a *measurement* requirement ("a test asserts"), not an architectural preference.

## 2. Search result — the verification is absent

```
$ grep -rn "zero socket\|zero-socket\|0 sockets\|sockets opened" --include=*.md --include=*.json --include=*.ts .
docs/integration/IIPS_V3_IID_IMPLEMENTATION_ROADMAP_2026-11-05.md:634            <- the gate definition
docs/integration/IIPS_V3_IID_INVESTMENT_INTELLIGENCE_DESIGN_REFINEMENT_2026-11-05.md:1160  <- the gate definition
docs/integration/NP-15-*.md  (3 lines: "0 providers / 0 sockets")               <- unrelated production-boundary declarations
```

The NP-15 lines are production fail-closed declarations about providers and credentials in another workstream. They do
not measure an IID cycle and cannot be borrowed for one.

## 3. The nearest artefact, and what it actually verifies

`evidence/iid/IID-3-PERSISTENCE-READ-TRANSPORT-2026-11-06/m1-demonstration.json` → `verification[]`, ten points:

| # | Point | Measured with |
|---|---|---|
| 1 | create | store |
| 2 | independent read in a separate process | store |
| 3 | payload and evidence intact | store |
| 4 | unchanged re-run writes nothing | store |
| 5 | changed input appends v2 | store |
| 6 | v1 byte-identical and readable | store |
| 7 | both versions chain-valid | store |
| 8 | corrupted chain refused on read | transport |
| 9 | sanitized static 503 | transport |
| 10 | no mutating route exists (8/8 → 405) | transport |

**None of the ten measures sockets.** There is no `net.connect` / `dns.lookup` / `http.request` instrumentation, no
syscall trace and no socket counter anywhere in the repository's evidence.

IID-1 and IID-3 evidence files were also searched (`test-log-*`, `typecheck-*`, `readiness.txt`, `runs/`); none contains
a socket assertion.

## 4. What does exist: architectural evidence (necessary, not sufficient)

| Observation | Command | Interpretation |
|---|---|---|
| No runtime server, client or socket construction in the investment code paths | `grep -rn "createServer\|\.listen(\|http.request\|https.request\|net.connect\|new Socket" frontend/server/investment/ iips-platform/src/investment/` → no matches | nothing in these paths opens a connection |
| The only `node:http` references are type-only | `grep -rn "from 'node:http'" frontend/server/investment/` → every hit is `import type http` | used for `IncomingMessage`/`ServerResponse` shapes; erased at compile time |
| Transport tests never bind a port | `frontend/server/investment/investment-transport.test.ts` header: "a fake request/response pair, the real service, a real store in a temporary directory" | the HTTP-shape tests cannot open a socket |
| IID-6 introduced no new network path | `git diff --stat 83f4511..HEAD -- frontend/server/` → only `dispositionService.ts` + 2 test files; PR #481 added no route handler; the two new clients are GET-only and call pre-existing local routes | the product surface adds requests to the existing local transport, not a new endpoint or host |

This is why the *architecture* is consistent with AC-X2. It is not the criterion: the design asks for a test that
asserts the count, and no such test exists. A static grep cannot fail a regression the way an assertion can.

**For completeness, one adjacent fact that must not be misread.** `frontend/server/broker-import/*.test.ts` *does* open
real loopback sockets by design ("drive the real exported handler over a real ephemeral loopback socket"). Those tests
belong to the broker-import / holdings workstream, are outside the IID assess → persist → read cycle, and their
existence neither satisfies nor contradicts AC-X2 — it simply shows that socket-opening tests exist in this repository
elsewhere, so a reader should not infer "no sockets anywhere" from this file. No IID test opens a socket.

## 5. Scope note — what IID-6 does to this criterion

Nothing, in either direction.

- IID-6 is a browser surface. It issues HTTP `GET`s to the same-origin local read transport (`/api/investment/...`,
  `/api/user-portfolios/...`). That traffic is the transport the design permits and is not a "socket path" the gate is
  aimed at; the gate's cycle is the server-side assess → persist → read pipeline.
- IID-6 added no route handler, no server process, no background worker and no external host (§4).
- Therefore IID-6 neither satisfies AC-X2 nor increases the risk it guards against; the criterion was OPEN before
  IID-6 and remains OPEN.

## 6. Exact missing evidence (either one closes it)

**Option A — in-process instrumentation.** A test or demonstration that wraps socket creation around one full
assess → persist → read cycle and asserts zero invocations, for example by monkey-patching before the cycle:

```ts
const net = await import('node:net');
const dns = await import('node:dns');
const calls: string[] = [];
const connect = net.connect; // then replace with a recording shim
// … run: assemble → recordAssessment → readChain → readVersion …
// assert: calls.length === 0
```

with the run's output (a small JSON: cycle steps, assertion, `socketAttempts: 0`) committed under `evidence/iid/`.

**Option B — OS-level trace.** `strace -f -e trace=network` (Linux) around the same cycle, with the trace or a summary
committed showing no `socket(`/`connect(` calls attributable to the cycle.

Neither was produced. Producing one is a bounded, single-act task — which is exactly why the gap is written down
rather than argued around.

## 7. Status history

| Date | Event | Status |
|---|---|---|
| IID-0 … IID-3 | gate defined in the design (§6.8) and roadmap (§3); never executed | OPEN (implicitly — no phase claimed it) |
| 2026-11-06 IID-6 | IID-6's own matrix asserted AC-X2 on the strength of a *static* argument ("the surface only calls the local read transport"). That assertion is corrected by `evidence/iid/IID-6-PRODUCT-SURFACE-2026-11-06/requirement-matrix.md` §6 and by this file | OPEN (explicitly) |
| 2026-11-06 closure | reconciled; missing artefact named (§6) | OPEN |
