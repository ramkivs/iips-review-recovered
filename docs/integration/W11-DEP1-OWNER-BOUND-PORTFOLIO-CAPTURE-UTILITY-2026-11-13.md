# W11 Acceptance Dependency 1 — Owner-Bound Portfolio Capture Utility

| | |
|---|---|
| Date | 2026-11-13 |
| Repository | `ramkivs/iips-review-recovered` (IRR). No IPD file is changed by this work. |
| Baseline | IRR `main` `a835d4af019ab4f677ab238ec42d44326f06a771` |
| Deliverable | An executable, tested, read-only Windows capture utility |
| Windows execution | **Not performed.** Built and tested in a Linux sandbox with a mocked IPC and a synthetic test peer. |
| W11 dependency 1 | **Not satisfied by this document.** It is satisfied only by an actual consistent capture taken on the Windows host. |

## 1. What this is, and what it is not

W11 acceptance dependency 1 needs the **actual owner-bound persisted portfolio**, read from the running IPD
service through the IRR consumer path. The earlier determination
(`iips-production-market-data`, `docs/integration/IIPS-W11-DEP1-ACTUAL-OWNER-BOUND-PORTFOLIO-EVIDENCE-2026-11-13.md`)
was **BLOCKED on host access**: the read can only be made on the Windows host, and there was no instrument the
operator could run to make it.

This work removes that gap. It delivers the instrument: **one PowerShell command** that attempts the real
read-only capture and either produces a consistent capture or fails with a distinct, non-zero outcome.

It is **not** the capture. Nothing here ran against IPD, a database, an owner binding or a Windows named pipe.
Every portfolio used in the tests is fabricated and labelled so. No test result in this document is capture
evidence, and none may be presented as one.

## 2. Files

| Path | Role |
|---|---|
| `tools/windows/capture-owner-bound-portfolio.ps1` | **Operator entry point.** Checks prerequisites, observes the host, runs the CLI, exits with its exit code. |
| `frontend/server/user-portfolio/capture/capture-owner-bound-portfolio.ts` | CLI: argument and configuration validation, output files, exit codes. |
| `frontend/server/user-portfolio/capture/ownerBoundPortfolioCapture.ts` | Core: the six-step sequence, outcome classification, consistency checks, bounded recapture, exact document, sanitized summary. |
| `frontend/server/user-portfolio/capture/ownerBoundPortfolioCapture.test.ts` | Utility tests, mocked IPC (62). |
| `frontend/server/user-portfolio/capture/captureOwnerBoundPortfolioCli.test.ts` | Utility tests: CLI with mocked IPC, and the existing `callIpc` against the synthetic peer (18). |
| `frontend/server/user-portfolio/capture/captureOwnerBoundPortfolioScript.test.ts` | Static contract tests of the PowerShell entry point (22). |
| `frontend/server/user-portfolio/capture/testing/syntheticIpcPeer.ts`, `run-synthetic-peer.ts` | **Test fixture only.** A synthetic contract-v1 peer. Never imported by the utility. |
| `frontend/tsconfig.portfolio-capture.json` | Strict typecheck scope for the capture files. |
| `frontend/package.json` | Two scripts added: `portfolio:capture`, `typecheck:portfolio-capture`. No dependency change. |
| `.gitignore` | Second barrier: the LOCAL-ONLY artifact names are ignored anywhere in a checkout. |

No existing source file is modified. The existing IPC client, port adapter, owner-context module and contract
are used as they are.

## 3. Investigation of the existing IRR IPC consumer

Read at `a835d4a`: `frontend/server/user-portfolio/ipcClient.ts`, `ipcPortAdapter.ts`,
`ownerContextFromBinding.ts`, `userPortfolioContract.ts`, `userPortfolioPort.ts`, and the composition in
`frontend/server/user-portfolio-transport.ts`.

| Convention | Finding |
|---|---|
| Framing | uint32 big-endian length prefix + UTF-8 JSON. Request cap 64 KiB, response cap 256 KiB. |
| Envelope | Request keys `v`, `op`, `payload?`, `requestId?`. Response keys `v, ok, op, requestId, result` or `v, ok, op, requestId, outcome, detail`. |
| Protocol version | `IPC_PROTOCOL_VERSION = 1`. No negotiation. A response with another version is refused by the client. |
| Connection | `callIpc`: one connection, one request frame, at most one response frame, then close. `node:net` `createConnection({ path })`. |
| Timeout | Fixed `IPC_TIMEOUT_MS = 5000` per call. The override is documented "tests only" and is not used by the utility. |
| Retry | `callIpc` never retries. |
| Result classes | `SUCCESS`; `CLASS_A` (typed refusal); `CLASS_P` (zero bytes and a close; the reason is never disclosed); `OUTCOME_UNKNOWN` (`TIMEOUT` or `TRANSPORT_FAULT`). |
| Endpoint | `resolveIpcEndpoint(env)`, read per call from `IIPS_G2_IPC_ENDPOINT`. On Windows: `\\.\pipe\<name>`, or a bare name plus an absolute `IIPS_G3_LOCAL_STATE_DIR`. A URL, `host:port` or relative path is refused. |
| Owner context | `IIPS_G3_IPC_BINDING_PROVISIONED` must be `true`, `1` or `yes`. It is an IRR-local precondition, fail-closed, and not proof of a binding. No owner, tenant or binding identifier is sent or received. |
| Authority keys | A request carrying any authority or canonical-identity key is refused before sending; a response disclosing any caller-identity key is refused as a transport fault. |
| Reads | `portfolio.list` → `PortfolioSummary[]`; `portfolio.get` → `PortfolioDetail` or `LocalPortfolioDetail`; `portfolio.revisions` → `RevisionEntry[]`. |
| Mapping boundary | `IpcUserPortfolioPort` validates the v1 result and maps it to the IRR mirror (`G2PortfolioSummary`, `G2PortfolioView`, `G2RevisionEntry`): `holdingsCount` → `totalHoldingsCount`, `committedAt` → `createdAt`. Holdings pass through verbatim. A malformed result, a `durability` claim, or a non-empty governed `contributions` list is refused, not repaired. |
| Windows scripts | `tools/windows/diagnose-*.ps1`: read-only, names-not-values, Windows PowerShell 5.1, with a Vitest contract test on the script text. |
| Runtime | Node 22, ESM, server code run with `tsx`; the transport is started with `--env-file-if-exists=../.env.local --env-file-if-exists=.env.local` from `frontend/`. Tests are Vitest with `@vitest-environment node`. |

**Conclusion: the existing IPC supports a safe read-only capture.** The three admitted read operations are
sufficient for the required sequence, and no protocol change, new frame or alternate persistence path is needed.
The limits of what the existing client can tell apart are recorded in §10; none of them is worked around.

## 4. How the existing consumer is used

- Every request is built by the existing adapter: `IpcUserPortfolioPort.listPortfolios`, `getPortfolio`,
  `revisionHistory`. The utility constructs no payload and no frame.
- The adapter's own fail-closed owner-context check, its scope-never-transmitted assertions and its v1 result
  validation run unchanged. A response the adapter refuses is refused by the utility too.
- The adapter exposes a `transport` seam. The utility passes a thin **recording** wrapper whose inner call is the
  adapter's own default expression: `callIpc(op, payload, { target: resolveIpcEndpoint(env) })`. The wrapper does
  two things only:
  1. refuses any operation outside `IPC_READ_OPERATIONS` before any I/O;
  2. keeps the raw `IpcCallResult`, because the adapter collapses Class P, Class A, timeout and transport fault
     into one `G2Error`, and the capture must report them apart.
- The exact capture records the **wire result verbatim**. The mapped `G2PortfolioView` is included beside it and
  labelled as an IRR-side mirror, not an IPD wire type.
- Configuration is validated with the consumer's own functions (`readBindingPrecondition`, `resolveIpcEndpoint`)
  before any connection.

## 5. Running it on the Windows host

### Prerequisites

1. The IPD IPC service is **already running**, started the way it normally is. The utility never starts it.
2. A checkout of `iips-review-recovered` at the commit that contains this utility.
3. Node.js 22.9 or newer on `PATH`, and `npm ci` already run in `frontend\` (the same install the IRR
   transport needs). The script installs nothing and tells you if this is missing.
4. The IRR server configuration the transport already uses, either in the PowerShell session or in
   `.env.local` (repository root or `frontend\`):
   - `IIPS_G2_IPC_ENDPOINT` — the IPD pipe, `\\.\pipe\<name>`
   - `IIPS_G3_IPC_BINDING_PROVISIONED` — `true`
   - `IIPS_G3_LOCAL_STATE_DIR` — only when the endpoint is a bare name

   The script reports which names are defined and never shows a value. It sets none of them.

### The command

From the root of the `iips-review-recovered` checkout:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\windows\capture-owner-bound-portfolio.ps1
```

Optional forms:

```powershell
# Check prerequisites and configuration only. Connects to nothing, writes nothing.
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\windows\capture-owner-bound-portfolio.ps1 -ValidateOnly

# Only when IPD lists more than one portfolio: the id comes from the LOCAL-ONLY candidates file.
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\windows\capture-owner-bound-portfolio.ps1 -PortfolioId "<id>"
```

Other parameters: `-OutputRoot`, `-MaxAttempts` (1–5, default 3), `-RetryDelayMs` (0–10000, default 500),
`-IpdRepoRoot`, `-RepoRoot`.

### Outcomes

| Exit | Outcome | Meaning |
|---|---|---|
| 0 | `CONSISTENT_CAPTURE` | One attempt passed every gating check. The only outcome that is a capture. |
| 2 | `CONFIGURATION_INVALID` | Prerequisite, argument or configuration invalid. No connection was made. |
| 10 | `IPC_CONNECTION_FAILURE` | Timeout, or transport fault (nothing serving the pipe, reset, unusable response). |
| 11 | `BINDING_OR_AUTHORIZATION_REFUSAL` | IPD closed with zero bytes (Class P), which includes an absent or invalid binding; or the IRR-local precondition refused. |
| 12 | `AMBIGUOUS_OR_MISSING_PORTFOLIO` | No portfolio listed; several listed and none selected; or the selected id not listed. |
| 13 | `INCONSISTENT_READ` | Every bounded attempt failed a consistency check. Nothing was kept. |
| 14 | `PROTOCOL_CAPABILITY_UNAVAILABLE` | A typed Class A refusal, or a response the existing consumer does not admit. A blocker to report. |
| 15 | `OUTPUT_WRITE_FAILURE` | An output file could not be written. No capture is claimed. |
| 70 | `INTERNAL_ERROR` | A defect in the utility. |

Nothing synthetic is ever substituted for a failed or inconsistent read.

## 6. Output — which file is which

Default root: `%LOCALAPPDATA%\IIPS\w11-dep1-capture`. Each run creates a new directory and never overwrites.

```
<root>\w11-dep1-capture-<UTC stamp>-<id>\
    README.txt
    LOCAL-ONLY-DO-NOT-PUBLISH\
        README-LOCAL-ONLY.txt
        exact-owner-bound-portfolio-capture.json     (only for CONSISTENT_CAPTURE)
        portfolio-candidates.json                    (only when the operator must choose)
    SANITIZED-SUMMARY\
        w11-dep1-capture-summary.json                (every outcome)
        w11-dep1-capture-summary.md
```

| Artifact | Contents | Handling |
|---|---|---|
| **Exact capture** — `LOCAL-ONLY-DO-NOT-PUBLISH\exact-owner-bound-portfolio-capture.json` | The four wire results verbatim (portfolio id, name, holdings, `securityIdentity` objects, digests, amounts), per-read consumer timestamps, the IRR mirror views, the consistency report. | **Stays on the Windows host.** Never commit, upload, attach or paste. |
| **Sanitized summary** — `SANITIZED-SUMMARY\w11-dep1-capture-summary.json` / `.md` | Outcome, counts, revision number, boolean consistency results, consumer timestamps, IPD-reported stored instants, protocol and build metadata, identity counts, the SHA-256 and size of the exact capture file. | **The publishable artifact.** It is a summary. It is **not** the complete capture evidence and must never be described as such. |

The summary carries no portfolio id, portfolio name, symbol, security identifier, company id, digest value,
price, quantity, amount, file name, owner identifier, endpoint path or filesystem path. The SHA-256 binds the
summary to the local exact file without disclosing its contents.

The console shows progress and the outcome only. Candidate portfolio ids, when the operator has to choose, are
written to the LOCAL-ONLY candidates file and are not printed.

The CLI refuses an output root inside any git working tree, and `.gitignore` ignores the LOCAL-ONLY names as a
second barrier.

## 7. Consistency checks and protections

One attempt is: consumer UTC timestamp → `portfolio.list` → `portfolio.get` → `portfolio.revisions` →
`portfolio.get` → consumer UTC timestamp.

**Portfolio identification.** From the actual `portfolio.list` response. One listed: that one. Several listed:
stop, unless the operator names one and it is exactly one of those listed. None listed: stop. `DEFAULT_PORTFOLIO`
is never assumed.

**Gating checks — all ten must pass in the same attempt.**

| Check | Requirement |
|---|---|
| `GETS_NAME_THE_IDENTIFIED_PORTFOLIO` | Both gets carry the id identified from the list. |
| `GETS_SAME_REVISION` | Same `revision` in both gets. |
| `GETS_SAME_PROVENANCE_DIGEST` | Same `provenanceDigest` in both gets. |
| `HISTORY_HAS_EXACTLY_ONE_ENTRY_FOR_REVISION` | Exactly one history entry for that revision. |
| `HISTORY_ENTRY_SAME_PROVENANCE_DIGEST` | That entry's `provenanceDigest` equals both gets'. |
| `HISTORY_HOLDINGS_COUNT_EQUALS_HOLDINGS_LENGTH` | That entry's `holdingsCount` equals the holdings array length of both gets. |
| `DETAIL_HOLDINGS_COUNT_EQUALS_HOLDINGS_LENGTH` | Each detail's own `holdingsCount` equals its holdings array length. |
| `HOLDINGS_IDENTICAL_ACROSS_GETS` | Every holding equal, field for field (order-insensitive). |
| `HOLDING_IDENTITY_IDENTICAL_ACROSS_GETS` | `symbol`, `companyId`, `identityStatus`, `resolutionDisposition`, `lineageDigest` and the `securityIdentity` object, verbatim. |
| `DETAIL_IDENTICAL_ACROSS_GETS` | The two wire details identical in every other field too. |

**Reported, not gating.** Whether the listed summary agrees with the detail; whether holdings came back in the
same order; whether `provenanceDigest` is non-empty; whether the captured revision is the highest in history.
Any that is false appears under `caveats`. An empty stored digest is a valid stored fact, but the digest
comparisons then compare empty strings, and the summary says so rather than presenting a meaningful match.

**Recapture.** A failed consistency check discards the **whole** attempt, and the full sequence is repeated, at
most `-MaxAttempts` times (hard limit 5). Reads from different attempts are never combined. Every other failure
stops at once; nothing is retried.

**Protections.**

- Read-only: only `portfolio.list`, `portfolio.get`, `portfolio.revisions` can be sent; the guard is ahead of
  the transport. No process is started, no database is opened, no environment variable is set.
- Timestamps: every `...AtUtc` value comes from the **consumer** host clock and is labelled as an observation
  time, not an IPD persistence time. IPD's stored `lastUpdated` and `committedAt` are carried separately and
  labelled as IPD-reported.
- Identity: counted only from the actual `securityIdentity` object on each holding. Null or absent means
  explicitly unresolved upstream. Nothing is derived from a symbol.
- Binding: the summary states that the response does not identify the IPD binding and that the IRR-local
  precondition is not proof of one.
- Build: the wire attests no build. The IPD commit recorded is a **host observation** (git HEAD of the IPD
  checkout, found from the running process command line or `-IpdRepoRoot`) and is labelled as such.
- Scope: four agreeing sequential reads are read consistency over the observation window. They are not
  atomicity and not a cross-service transaction.
- Peer authenticity: the consumer cannot prove which process served the pipe. The summary records this as
  `NOT_ATTESTED`.
- Evidence eligibility, stated in both output files: `NO_CAPTURE` for every outcome other than a consistent
  capture; `NOT_EVIDENCE_SYNTHETIC_TEST_PEER` when the repository's test fixture answered;
  `NOT_EVIDENCE_NOT_A_WINDOWS_HOST` when the run was not on Windows; `HOST_CAPTURE_SUBJECT_TO_REVIEW` only for a
  consistent capture on a Windows host. No value means "accepted".

## 8. Tests

All of the following are **utility tests**. They are not capture evidence.

| Requirement | Where |
|---|---|
| Full sequence success | `ownerBoundPortfolioCapture.test.ts` › full capture sequence |
| Request ordering and payloads | same › "sends exactly list → get → revisions → get" |
| Ambiguous / missing portfolio | same › portfolio identification |
| Connection failure and timeout | same › connection failure and timeout |
| Binding / authorization refusal | same › binding and authorization refusal |
| Missing / malformed responses | same › missing and malformed responses (nine shapes) |
| Revision mismatch, digest mismatch | same › consistency checks |
| Missing / mismatched / duplicated history entry | same › consistency checks |
| Holdings-count mismatch | same › consistency checks |
| Bounded recapture, no combining | same › bounded recapture |
| Sanitization (summary, console, every outcome) | same › sanitization; `captureOwnerBoundPortfolioCli.test.ts` |
| No writes, no service start, no migration | same › read-only; `captureOwnerBoundPortfolioScript.test.ts` |
| LOCAL-ONLY / sanitized file split, exit codes, no overwrite, output-root refusal | `captureOwnerBoundPortfolioCli.test.ts` |
| Existing `callIpc` end to end (real framing, zero-byte close, nothing listening) | `captureOwnerBoundPortfolioCli.test.ts` › synthetic peer |
| PowerShell 5.1 constraints, read-only, exit-code propagation, documented exit codes | `captureOwnerBoundPortfolioScript.test.ts` |

Commands, from `frontend/`:

```
npx vitest run server/user-portfolio/capture/
npm run typecheck:portfolio-capture
npm run typecheck
npm run typecheck:replay-server
npm run test
npm run build
```

Results for the published commit are in the delivery report that accompanies it.

## 9. What was and was not executed

- Executed in a Linux sandbox: the Vitest suites; the strict typecheck; the production build; the CLI as a real
  process through `tsx`, against the synthetic test peer over a unix socket and against an endpoint with nothing
  listening.
- **Not executed anywhere:** the PowerShell entry point. No PowerShell was available in the sandbox. Its text is
  covered by static contract tests only. Its first real execution will be on the Windows host; `-ValidateOnly`
  exercises it without connecting to or writing anything.
- **Not executed anywhere:** a Windows named-pipe connection by this utility. The existing client's own header
  records that Windows named-pipe behaviour and ACLs are host-only facts, unverified in CI.
- **Not performed:** any read of the actual portfolio. W11 dependency 1 remains unsatisfied until the host run
  returns `CONSISTENT_CAPTURE` and the result is reviewed.

## 10. Limits of the existing IPC, recorded and not worked around

| Limit | Effect on the capture |
|---|---|
| The service attests no build on the wire. | "IPD build" in the capture is a host observation, labelled so. |
| The response does not identify the owner binding. | The capture cannot say which binding served the read, and does not claim to. |
| `TRANSPORT_FAULT` is one class in the client: nothing serving the pipe, a reset, a malformed or over-cap response, a different protocol version, or a response disclosing a caller-identity key. | Reported as `IPC_CONNECTION_FAILURE` with all causes listed. The script separately reports whether an IPD IPC process is visible. |
| Class P discloses no reason. | Reported as `BINDING_OR_AUTHORIZATION_REFUSAL`. The reason is in the IPD Class P journal on the host. |
| Response cap 256 KiB. | A portfolio whose detail exceeds it cannot be captured through this client. That would be a blocker to report, not to bypass. |
| The adapter refuses a non-empty governed `contributions` list. | On a service path that returns one, the capture ends `PROTOCOL_CAPABILITY_UNAVAILABLE`. |
| No snapshot or transaction across calls. | Consistency is established by comparison across reads, not guaranteed by the protocol. |
| Per-call timeout fixed at 5 s; no retry in the client. | The utility adds no retry within an attempt. |

## 11. After a successful host run

1. Keep `LOCAL-ONLY-DO-NOT-PUBLISH\` on the host.
2. Provide the two files under `SANITIZED-SUMMARY\` for review. Describe them as a sanitized summary.
3. The reviewer checks: `outcome` is `CONSISTENT_CAPTURE`; `evidenceEligibility` is
   `HOST_CAPTURE_SUBJECT_TO_REVIEW`; `caveats`; the host-observed build fields; and that `exactCapture.sha256`
   matches the file on the host (`Get-FileHash -Algorithm SHA256`).
4. Only then is W11 acceptance dependency 1 a candidate for acceptance. This utility does not accept it.
