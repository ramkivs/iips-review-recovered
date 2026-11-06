# IID remaining acceptance evidence — 2026-11-06

Two acceptance criteria left as `OPEN`/`qualified` by the IID closure record, resolved with evidence produced at
`HEAD aaf1f0c` (the PR #483 merge). This bundle contains the runtime measurement for one and the size/class
determination for the other; it does not touch product code.

| File | What it is |
|---|---|
| `AC-X2-RUNTIME-EVIDENCE.md` | AC-X2 → **PASS**: the requirement's exact scope (external vs loopback), the execution path, the two-layer instrumentation, the negative control, results, limitations |
| `AC-X6-G8-DETERMINATION.md` | AC-X6 → **PASS**, G-8 → **closed as not a breach**: the 100 KB fixture bound belongs to the fixture class, not to `golden-tech.json` (109,948 B), which is committed test evidence |
| `zero-socket-run.json` | Full cycle (analysis → persistence → both reads) in a plain Node process, under instrumentation — machine-written record |
| `zero-socket-read.json` | The read half repeated in a **separate process** against the store the run above wrote |
| `zero-socket-test.json` | The same full cycle inside the test runner (the committed assertion, `frontend/server/investment/zero-socket.test.ts`) |
| `zero-socket-control.json` | Negative control: seven external attempts refused, a real loopback round trip permitted, classifications recorded (`zero-socket-control.test.ts`) |
| `handoff.json` | The store path and written head id the read process used |
| `commands-and-outputs.txt` | Every command with its verbatim output: tool availability, typechecks, the test run, both CLI phases, the whole-suite regression run, record hashes, and the size measurements for AC-X6 |

## The one-line result

Over a complete assess → persist → read cycle, three executions in two processes: **0 external connection attempts,
0 DNS calls, 0 `http(s)` requests, 0 new socket descriptors** — while the cycle wrote version 1, read the chain back
through the service and through the HTTP-shape transport handler, and returned a 66,726 B canonical payload. A negative
control proves the instrument registers what it claims (7 external attempts refused, including one through a reference
captured before the probe was installed; a loopback round trip permitted and recorded).

## Reproduce

```bash
cd frontend
npx vitest run server/investment/zero-socket.test.ts server/investment/zero-socket-control.test.ts
OUT=../evidence/iid/IID-AC-X2-ZERO-SOCKET-2026-11-06
GIT_COMMIT=$(git rev-parse HEAD) npx tsx server/investment/cli/zero-socket-cycle.ts write --handoff $OUT/handoff.json --record $OUT/zero-socket-run.json
GIT_COMMIT=$(git rev-parse HEAD) npx tsx server/investment/cli/zero-socket-cycle.ts read  --handoff $OUT/handoff.json --record $OUT/zero-socket-read.json
```

## Not claimed here

Syscall-level tracing (no `strace`/`ltrace`/`bpftrace` in the environment — named as missing, not approximated); a
listening socket or loopback connection inside the cycle (there is none); production, multi-user or authenticated
behaviour; any real issuer (`L-009`) or real dataset (`L-004`).
