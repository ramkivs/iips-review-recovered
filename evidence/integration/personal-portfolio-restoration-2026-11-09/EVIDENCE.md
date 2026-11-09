# Personal Portfolio restoration — verification evidence (2026-11-09)

**Repository:** `ramkivs/iips-review-recovered` (IRR) — branch
`arena/c5730469-iips-review-recovered`
**Baseline restored from:** IRR branch `arena/d34cd4d1-iips-review-recovered`
@ `cb8e63ebf5b93caa95d9e0d829e0186681315d4b`
**Counterpart read-only:** `ramkivs/iips-production-market-data` (IPD) `main`
@ `ae393aa` (merge of PR #144). **IPD was not modified.**

---

## 1. What was restored

| File | Change |
|---|---|
| `frontend/src/features/personal-portfolio/PersonalPortfolio.tsx` | **new** — the editor component (was absent from `main`) |
| `frontend/src/features/personal-portfolio/PersonalPortfolio.test.tsx` | **new** — editor surface tests |
| `frontend/src/app/App.tsx` | `/personal-portfolio` route + import restored |
| `frontend/src/app/navigation.ts` | **Personal Portfolio** nav entry restored |
| `frontend/src/api/userPortfolios.ts` | write client (`createUserPortfolio`, `saveUserPortfolioHoldings`, `deleteUserPortfolio`) restored |
| `frontend/src/api/userPortfolios.test.ts` | **new** — write client tests |
| `frontend/server/user-portfolio-transport.ts` | personal-use write routes (create/save/delete) restored |
| `frontend/server/user-portfolio-transport.test.ts` | transport tests restored + extended |
| `frontend/server/user-portfolio/ipcPortAdapter.ts` | v1 save-receipt mapping + create-with-holdings restored |
| `frontend/server/user-portfolio/ipcPortAdapterIntegration.test.ts` | restored |
| `frontend/server/user-portfolio/userPortfolioPort.ts` | `G2CreateParams.holdings` restored |
| `frontend/server/user-portfolio/ipcContractAlignment.test.ts` | **new** — pins the canonical IPD v1 contract alignment |
| `frontend/src/app/personalPortfolioRoute.test.tsx` | **new** — route + visible-navigation tests |
| `docs/LOCAL-PERSONAL-USE-PERSISTENCE.md` | restored and rewritten for the current contract |
| `evidence/integration/personal-portfolio-restoration-2026-11-09/` | **new** — this evidence set |

Unrelated routes (`/portfolio`, `/broker-holdings`, `/user-portfolios`) were not
replaced or renamed.

## 2. The IPC contract mismatch: found, and how it was resolved

### 2.1 The report

> "IPD v2 reportedly requires `expectedRevision >= 1` and supports `MERGE`.
> IRR v1 reportedly accepts `expectedRevision >= 0` and advertises `REPLACE`."

### 2.2 What the authoritative source actually says

Both halves are literally true, but they describe **two different wire channels**,
not one contract disagreeing with itself. IPD serves `v = 1` and `v = 2` over the
same socket:

| | IPD **v1** | IPD **v2** |
|---|---|---|
| `expectedRevision` | **≥ 0** (`src/persistence/manualPersonalPortfolio.ts` → `requireExpectedRevision`: `value < 0` refuses) | **≥ 1** (`src/ipc/protocol.ts` v2 framing; `src/persistence/portfolio_store.ts` → `validateSnapshotFraming`) |
| Save mode | **`MERGE` or `REPLACE`** (`src/ipc/dispatch.ts`: `options.mode === 'REPLACE' \|\| payload.operation === 'REPLACE' ? 'REPLACE' : 'MERGE'`) | MERGE-only (complete snapshot) |
| `portfolio.reset` / `portfolio.delete` | present and dispatched | absent from `IPC_V2_OPERATIONS` |
| Writes reachable? | **yes**, under the authorized local personal-use path | **no** — the dispatcher refuses every v2 write with `WRITE_NOT_AUTHORIZED` before any store mutation |

The v2 snapshot path is exercised only by isolated synthetic fixtures; it is
disconnected from the product dispatcher.

### 2.3 The resolution

IRR speaks **v1** — `frontend/server/user-portfolio/ipcClient.ts` fixes
`IPC_PROTOCOL_VERSION = 1` and `encodeRequestFrame` refuses any other version.
The canonical contract for the personal-use write path is therefore the **v1**
contract, and the baseline implementation was already correct on the wire:

- `expectedRevision ≥ 0` is the v1 rule. IRR enforces exactly it and no looser:
  a missing guard is `400`; a negative, fractional or non-numeric guard is `400`.
- `REPLACE` is a genuine v1 mode, not a label — IPD v1 resolves the mode from
  `options.mode` and `store.save` then writes a `REPLACE` revision row and starts
  a new contribution set. `MERGE` is equally admitted; IRR forwards either
  unchanged and refuses anything outside the closed pair with `400`.
- `portfolio.reset` and `portfolio.delete` exist only in v1, which is why v1 is
  the only channel that can serve this path at all.

**No label was renamed and no validation was loosened.** No IPD authorization
boundary was touched. The alignment is now pinned by
`frontend/server/user-portfolio/ipcContractAlignment.test.ts` (13 assertions),
so a future change on either side that breaks it fails in CI.

### 2.4 The one implementation change made during the restoration

`IpcUserPortfolioPort` now accepts an `env` option and the IRR transport passes
its own server-owned environment into it. Previously the adapter resolved the IPC
endpoint from `process.env` while the transport resolved the binding precondition
from the injected `env`. In production these are the same object, but the two
could in principle disagree, so the endpoint and the precondition would come
from different sources. Threading the environment makes the server-owned
environment authoritative for the whole call chain. The default remains
`process.env`, which is the production posture. No other behavioural change was
made to the restored implementation.

## 3. Authorization behaviour preserved

- `IIPS_LOCAL_PERSONAL_USE=1` is read **server-side only** (process environment
  via `handleUserPortfolioRequest(..., { env })`), never from a request header,
  cookie or body.
- With the switch absent or not exactly `1`, every write route refuses
  byte-for-byte as before: `503 {"error":"operation-not-admitted"}`, **no port
  constructed, no body read**.
- The `IIPS_G3_IPC_BINDING_PROVISIONED` precondition still fails closed
  independently (`503 owner-context-unavailable`, no port constructed).
- **W-1 was not weakened.** IPD's `evaluatePortSaveGuard` still returns
  `authorized: false` with the W-1 reasons for every caller that does not hold
  the local personal-use authorization. The cross-repository run proves this
  directly: with the switch off **upstream**, IPD itself refuses the write.
- `isLocalPersonalUseEnabled()` and `LOCAL_PERSONAL_USE_SETTING` are IPD-side
  and were read, not reimplemented, in IPD.
- IPD's persistence implementation (PR #144) was consumed as-is. **No second
  persistence implementation, no repeated Direct P1 provisioning, no change to
  IPD.**

## 4. Targeted tests and results

Run in `frontend/` (the package CI runs):

```
npx vitest run server/user-portfolio-transport.test.ts \
                  server/user-portfolio/ipcContractAlignment.test.ts \
                  server/user-portfolio/ \
                  src/api/userPortfolios.test.ts \
                  src/features/personal-portfolio/ \
                  src/app/personalPortfolioRoute.test.tsx \
                  src/app/App.test.tsx
```

| Requirement (task §5) | Where verified | Result |
|---|---|---|
| 1. route and navigation rendering | `src/app/personalPortfolioRoute.test.tsx` (6) | PASS |
| 2. portfolio creation and retrieval | transport (2), API client (2), editor (2) | PASS |
| 3. holdings replacement/update on the canonical contract | `ipcContractAlignment.test.ts`, transport (2), editor (1) | PASS |
| 4. revision increment and optimistic concurrency | transport (2), API client (2), editor (1), e2e 4/10c | PASS |
| 5. duplicate/no-op save | transport (1), API client (1), editor (1), e2e 5 | PASS |
| 6. stale revision → expected conflict | transport (2), editor (1), e2e 6 | PASS |
| 7. authorization disabled → write denied | transport (2), e2e 7 + 7b | PASS |
| 8. authorized local personal use → permitted write | transport (6), e2e 2/3 | PASS |
| 9. delete and subsequent retrieval | transport (2), editor (1), e2e 9a–9d | PASS |
| 10. persistence survives an IPD restart | e2e 10a–10c | PASS |

## 5. End-to-end results — sandbox, against the real IPD `main`

**This is sandbox verification, not host-runtime verification.** It runs on Linux
in the Arena environment; the designated Windows host was not used.

The harness (`cross-repo-e2e-harness.mjs`, driven by `run-cross-repo-e2e.sh`)
clones the authoritative IPD repository read-only, compiles it, seeds a scratch
SQLite store with a local binding, starts the **real IPD IPC server** over a
real unix socket, composes **this repository's IRR transport** as the HTTP
layer, and exercises the full sequence.

**Result: 23/23 checks passed.** Verbatim output:
`cross-repo-e2e-results.txt`.

Sequence covered: read-before-create (404) → create (201, revision 1, weights
exactly 100, `MANUAL:<SYMBOL>` identity) → retrieval → list → REPLACE save
(revision 2) → duplicate/no-op save (200, revision unchanged, `isDuplicate`) →
stale guard (409) → invalid payload (400, no partial state) → revision history
(`INITIAL`, `REPLACE`) → **full IPD process stop and restart** → the portfolio,
its holdings and its revision are intact → a write on the restarted process
increments the revision → delete with a stale guard (409) → delete with the
correct guard (200, `deletedAt`) → read after delete (404) → tombstoned id not
reusable → audit chain verifies.

Authorization was verified in both directions: the IRR server without the switch
returns `503 operation-not-admitted`; and with the switch off **upstream**, IPD's
own W-1 refusal is what stops the write.

### 5.1 Not verified here (host-runtime items)

The following require the designated Windows host and were **not** performed:

- the Windows named-pipe transport and its flush-guard settlement policy;
- the real Windows startup sequence of both services;
- the browser talking to the real Windows IPD named pipe end-to-end;
- Windows PowerShell acceptance fixtures.

This is stated explicitly rather than claimed as passed.

## 6. Reproducing

```
bash evidence/integration/personal-portfolio-restoration-2026-11-09/run-cross-repo-e2e.sh
```

The script clones IPD read-only, installs and compiles it, and runs the harness.
It requires network access to `github.com` and `registry.npmjs.org`.

## 7. Scope confirmation

- No IPD modification — IPD was cloned, read, compiled and consumed.
- No new IPD persistence implementation; the existing PR #144 implementation is
  the one that was exercised.
- No repeated Direct P1 provisioning.
- No weakening or bypassing of W-1.
- No production deployment or production acceptance.
- No unrelated DHAN API or Broker Holdings work.
- No redesign of Personal Portfolio — the restored component is the baseline's,
  with the baseline's design and terminology preserved.
- No new governance documents or approval gates; one documentation file was
  restored and updated in place.
