# IIPS v3.0 — Gate 3: Disposition of `g3-connection-release.patch`

**Date:** 2026-10-21 (UTC). **Author:** Arena Agent. **Session branch:** `arena/17d363e9-iips-review-recovered`.
**Disposition: BLOCKED — as to acceptance only. The candidate is authorized within scope and contract-compliant; it does not require correction.**
**Gate 3 status: BLOCKED / NOT ACCEPTED** (unchanged).

---

## 0. Candidate identity (verified)

| Field | Value |
|---|---|
| Artifact | `docs/integration/artifacts/g3-connection-release.patch` |
| Size | **18,900 bytes** |
| SHA-256 | **`5745647e32b1da67fb984a7748406921aefb495000dfcbfdd9255133cad5fe0a`** |
| Base | `3eb13ed637ac61bd971da1a06883da4b4564447b` |
| Candidate commit | `5fb7efe7b50b73d90651b09bfe2bdd4ff7210787` (tree `1200a701…`) |
| Durable location | IRR `44dd7cfb64004371561ed4109eb8b3823b414ca8`, PR #176 (open) |

Re-verified this pass: applying the artifact to a pristine `3eb13ed` checkout yields tree
`1200a701f731ead4554dd93e28140fbbfe1cd7ce`, byte-identical to the candidate commit's tree; the remote
blob is `cbfa4509…`, 18,900 bytes.

---

## 1. Authoritative governance decision

### 1.1 The operative instrument

`docs/integration/IIPS_v3.0_G3_GATE3_IMPLEMENTATION_AUTHORITY_ACT_EFFECTIVE_2026-10-19-02.md`
(act EFFECTIVE, tracker §16.62). Gate 3 acceptance is defined at **§10.1** as seven conditions "at the
exact named commits"; **§10.2** states that "Both repositories' CI runs `ubuntu-latest` only" and that
"Windows named-pipe/ACL behaviour, C5.1/Q9 zero-bytes on the host" are **Gate 4 / Gate C items executed
by the operator and accepted by a separate act**.

### 1.2 Is destroying the flush-guard connection after the response write authorized?

**Yes — within scope, and the act's own protocol text describes exactly this.**

- §4.2 item 13 (`src/ipc/dispatch.ts`) requires: "Class P refusals with **zero bytes and connection
  close**; Class A typed non-disclosing outcomes; C7 rejection …". All preserved.
- §4.2 item 11 (`src/ipc/protocol.ts`) requires: "one request and at most one response per connection;
  pipelined frames refused". Preserved.
- That same act-named protocol file states the post-flush case verbatim (`protocol.ts:267–273`):

  > "Transport-imposed residual (Windows named pipes): … a non-conforming peer that keeps the pipe open
  > and delivers a second frame only AFTER the single response has already flushed to the OS **cannot
  > have that delivery prevented; its connection is still closed after exactly one response and its
  > second frame is never dispatched.** … This is a platform limit, not a protocol change."

No act text prohibits close-after-flush, and no act text requires the handle to remain open.

### 1.3 PKG-11 / PKG-12 — the explicit answer

**Neither is an operative record, and the asserted PKG-12 requirement is therefore NOT BINDING —
it is not superseded either, because it cannot be shown to have existed as a governing record.**

Verified exhaustively this pass:

| Search | Result |
|---|---|
| `PKG-11` / `PKG-12` across **all refs** of `ramkivs/iips-production-market-data`, **all file types** | one hit: `src/ipc/dispatch.ts` lines **65** and **282** — a code comment |
| `PKG-11` / `PKG-12` across **all refs** of `ramkivs/iips-review-recovered` | only this session's own reports/artifacts and tracker §16.69 |
| IRR `git log --all -S"PKG-11"` / `-S"PKG-12"` | only `44dd7cf` — the commit that quotes the comment |
| Any file ever named `PKG-11*` / `PKG-12*` in IRR history | **none** |

The IRR `PKG-*` series is real but runs `PKG-01…PKG-09`, `PKG-02A…02G`, then dated `PKG-03/06/08`
records (`docs/integration/2026-10-18|19|20/`). **There is no PKG-10, PKG-11 or PKG-12.**

The citation originates in the base source comment (`dispatch.ts:65`): *"The response cannot be
un-sent (platform impossibility — see IRR PKG-11 §E)"*. That is a **comment citing a document that
does not exist in either repository**. A requirement sourced only to an unresolvable citation cannot
govern. If a PKG-11/PKG-12 record exists outside these two repositories, only the Program Authority
can produce it; until then the act (§4.2/§4.3, §10.1) and `protocol.ts` are the governing text.

### 1.4 Does the manifest permit the three changed files?

**Yes — all three are manifest paths, and no path is added.**

| Path | Manifest basis |
|---|---|
| `src/ipc/dispatch.ts` | act §4.2 item 13 |
| `tests/g3_ipc_framing.test.ts` | act §4.3 row **T-A** |
| `tests/g3_binding_resolution.test.ts` | act §4.3 row **T-C** |

§10.1 condition 1 pins the **path set** ("the IPD manifest of §4.2/§4.3 is present and **no path
outside the §4 manifest** differs from `be32d8c9`"), not content hashes; condition 5 requires the §4.3
tests "present in the executed sets". Content change within manifest paths is the act's subject matter.

**Contrast with the superseded artifact:** `g3-flush-guard-release.patch` added
`tests/g3_flush_guard_connection_release.test.ts` — a **ninth** test file against §4.3's fixed set of
eight. That artifact was outside the manifest on that ground alone.

### 1.5 Does one-request/at-most-one-response permit removing the post-flush diagnostic?

**Yes. The requirement does not reach the post-flush case, and this is a textual determination, not a
new rule.**

§4.3 row T-A requires, for "oversize …, malformed, `v ≠ 1`, unknown `op`, truncated frame and
pipelined frames": "**zero bytes** and connection close; plus audit-line assertions for refused frames
recorded only in the bounded local diagnostic sink".

Post-flush, T-A's own observable — **zero bytes** — is unsatisfiable: a valid response has already been
delivered. A requirement whose stated observable cannot obtain in a case cannot govern that case.
The refusal duty therefore attaches to frames the server can still observe, which is the pre-flush
pipelined case, and that path is **unchanged** by the candidate (guard race → `refuseClassP` →
zero bytes, connection close, `MALFORMED_FRAME` in the sink).

Retaining a post-flush sink record requires an open handle, which consumes the only C5.4 capacity slot
and reinstates the defect. Capacity release and post-flush observation are mutually exclusive at
capacity 1. No act text prefers the record over the release; §4.2 item 11's file prefers the release
verbatim (§1.2 above).

### 1.6 Do write-callback + destroy satisfy delivery and capacity?

- **Capacity — established.** `Socket._destroy` is the sole `server._connections--` path; the candidate
  closes the handle on every flush-guard exit. Measured: `accepted = closed = 5`,
  `getConnections() = 0`.
- **Delivery — expected sound, NOT verified on Windows.** The write callback fires once the frame is
  in the OS pipe buffer; `CloseHandle` does not discard buffered data, so a reader drains the frame and
  then observes `ERROR_BROKEN_PIPE`. This is consistent with documented Windows pipe semantics but is
  **not** empirical evidence. It is a Gate 4 operator item (§10.2).

---

## 2. Repository and patch findings

The candidate changes exactly three manifest paths, and nothing else:

| File | Change |
|---|---|
| `src/ipc/dispatch.ts` | flush-guard response written with `writeFrame` (no half-close); handle closed as soon as the frame flushes; `attachPostFlushWatch` and the unused `responded` flag removed; `finally` closes any remaining flush-guard exit |
| `tests/g3_ipc_framing.test.ts` | three emulation assertions re-pointed from "socket stays open" to "handle released"; real-socket Windows branch asserts exactly one response frame and no second response bytes |
| `tests/g3_binding_resolution.test.ts` | new T-C describe: five sequential requests on one server, capacity released to zero, recovery after a zero-byte Class P refusal |

Untouched: `scripts/run-tests.mjs`, `.github/workflows/ci.yml`, `src/ipc/protocol.ts`,
`src/ipc/endpoint.ts`, all persistence sources, all fence files. §10.1 condition 6 (29-key guard,
`SESSION_ONLY`/`durable:false`, `503` fence and fence blobs) is unaffected by a three-file IPC change.

---

## 3. Verification evidence — and what it does not cover

All figures re-executed **this pass**, from a pristine `3eb13ed` checkout with the **published artifact**
applied (not from the prior workspace):

| Check | Result |
|---|---|
| Artifact → tree equality with `5fb7efe` | `1200a701…` = `1200a701…` ✔ |
| `git apply --check` vs `3eb13ed` | CLEAN ✔ |
| `npx tsc` | exit `0` ✔ |
| `npm test` (guarded runner) | **754 executed, 753 passed, 0 failed, 1 skipped**, 95 suites, `[test-guard] OK` ✔ |
| `node --test dist/tests/g3_*.test.js` | **198 / 197 / 0 / 1** ✔ |
| `g3_ipc_framing` + `g3_binding_resolution` | **43 / 43** ✔ |

§10.1 condition 3's threshold (non-zero executed count, ≥ 556 tests, zero failures) is met **on POSIX**.

**Native Windows: zero evidence for this candidate.** See §4.

---

## 4. Reconciliation with the reported native-Windows results

The reported run — **33 tests, 31 passed, 2 failed** — was executed against the **superseded** artifact
`g3-flush-guard-release.patch`, not this one. The arithmetic confirms it: that artifact's own suites are
`g3_ipc_framing` (30) + `tests/g3_flush_guard_connection_release.test.ts` (3) = **33**. The current
candidate's comparable set is `g3_ipc_framing` (30) + `g3_binding_resolution` (13) = **43**.

| Reported failure | Applies to | Status in the current candidate |
|---|---|---|
| **A** — `releases the single capacity slot between requests`: expected `0`, actual `1` | superseded only | **Not applicable** — that test file does not exist here (it was a ninth file outside §4.3). The T-C regression instead waits on the server's own `close` events, bounded at 5 s, so a leak fails loudly rather than passing on timing. |
| **B** — `a second frame delivered in a separate write/event is refused over a real socket`: diagnostic `undefined` | superseded **and** the base | **Addressed by contract, not by deletion.** This suite builds its own handler (`readSingleFrame` + `socket.end`) and never `createConnectionHandler`, so it has never recorded a post-flush diagnostic. IPD PR #34's body records this same test failing at `3eb13ed` with `MALFORMED_FRAME` expected / `undefined` received — i.e. the assertion predates both candidates. The Windows branch now asserts the observables §1.2/§1.5 establish: exactly one response frame, no second response bytes. The pre-flush refusals still assert the sink record. |

Neither reported failure was established against the current candidate. **No native-Windows result of
any kind exists for `5fb7efe7…`.**

---

## 5. Disposition

**BLOCKED — acceptance-blocked, not correction-blocked.**

| Question | Determination |
|---|---|
| Authorized within the act's scope | **Yes** (§1.4) |
| Contract-compliant | **Yes** (§1.2, §1.5) |
| Requires correction | **No** — no governing record requires the post-flush diagnostic; the asserted PKG-12 requirement is not an operative record (§1.3) |
| Ready for the next required acceptance step | **No — blocked**, for two independent reasons |

**Blocking condition 1 — the act's Gate 3 acceptance cannot be evaluated.** §10.1 requires the seven
conditions "at the exact named commits", including condition 1 (IPD manifest present) and condition 3
(IPD `tsc`/`build`/`npm test`). The candidate commit is **not on the IPD remote**: the active App token
has no `contents:write` on `ramkivs/iips-production-market-data` (`git push` → `403 Permission … denied`;
API ref creation → `403 Resource not accessible by integration`), while the same token writes IRR. IPD
PR #34 remains **open, unmerged, head `3eb13ed`**. No IPD CI run can exist for a commit that is not there.

**Blocking condition 2 — no native-Windows evidence for this candidate.** Required before any runtime
claim, and it does not exist. (Per §10.2 this is formally a Gate 4 / operator item, not a §10.1 Gate 3
condition — see §6.)

**Smallest authorized next step:** grant `contents:write` on the IPD repository (or have the operator
push artifact tree `1200a701…` to `3/gate3-node-sqlite-ipc-d30003d`), then run the single Windows
validation in the handoff. No code change is required to unblock.

---

## 6. Tracker reconciliation

The tracker (§16.68.6 and §16.69) states Gate 3 remains blocked "pending operator-owned native-Windows
acceptance". That framing is **inaccurate against the act**: §10.2 places Windows named-pipe/ACL and
host zero-byte behaviour in **Gate 4 / Gate C**, and §10.1 defines Gate 3 acceptance in terms of CI at
named commits on `ubuntu-latest`.

The correct position is that Gate 3 is blocked because **§10.1 conditions 1, 3 and 5 cannot be
evaluated** — the manifest is absent from the IPD remote — and separately because no Windows evidence
exists for any candidate (a Gate 4 precondition). Gate 3 remains **BLOCKED / NOT ACCEPTED** either way;
the corrected framing is recorded at tracker §16.71. No status is changed and nothing is accepted.

---

## 7. Status

**Gate 3 remains BLOCKED / NOT ACCEPTED.** The candidate is preserved unchanged; no implementation was
modified, no artifact replaced, and no PR merged in producing this disposition.
