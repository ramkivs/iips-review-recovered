# IIPS v3.0 Direct P1 — IRR IPC Consumption Record

- **Scope:** personal, local, single-user, non-production IIPS v3.0 only
- **IRR repository:** `ramkivs/iips-review-recovered`
- **IPD repository:** `ramkivs/iips-production-market-data`
- **Authority / handoff:** `IIPS-V3-CAP03-PA-BLANKET-WAIVER-ONE-PASS-AUTHORIZATION-2026-11-01-01` and IPD PR #118's merged Direct P1 handoff
- **Status:** IRR read-only IPC composition implemented; actual Windows named-pipe runtime check remains for the operator

## 1. Exact IPD source consumed

IRR's public package pin is `iips-production-market-data#279d1eed184f5e23bbabe5c6411085e120ce9e41`, the merge commit of IPD PR #118. Its tree is `ee6a90a0c27c46c71e5b47df664e6c7d24ca5e20`. GitHub reported IPD `main` identical to that commit. The Direct P1 provisioning implementation and published handoff were consumed as an IPD-owned change; IRR does not duplicate or modify them.

The IRR dependency and lockfile pin are intentionally aligned to that exact commit even though the public package exports did not change. This provides one traceable cross-repository baseline.

## 2. User-reported Windows provisioning evidence

The following is **reported by the user as having been executed on their Windows laptop**. Arena did not access that machine, inspect the database, run the provisioning command, or independently verify these results.

- Execution: `SUCCESS`; disposition: `PROVISIONED`.
- Database: `C:\iips-data\iips\user-portfolio.sqlite`, 102,400 bytes.
- SHA-256: `e9b1d66c505eded34d1dd48ec86550026c930101709eb4901455ace6554b94f`.
- Reported checks: SQLite integrity `ok`; all four migrations verified; zero foreign-key violations; Gate E write guard enforced; audit chain valid; DP-V1 through DP-V9 passed.
- Reported binding state: active local principal, binding, tenant, owner, and membership; one initial audit event.
- Reported initial portfolio state: zero portfolios, revisions, holdings, contributions.

The expected initial IRR list result is therefore an empty array if the running IPD provider observes the same database state. Arena has not observed that IPC result.

## 3. IRR implementation and boundary

IRR now composes its existing `IpcUserPortfolioPort` into only these owner-scoped HTTP reads:

- `GET` / `HEAD /api/user-portfolios` → list
- `GET` / `HEAD /api/user-portfolios/:portfolioId` → detail
- `GET` / `HEAD /api/user-portfolios/:portfolioId/revisions` → revision history

These use the existing IPC client, framing, endpoint resolution, closed-shape validation, and one-call/no-retry behavior. They do not open SQLite, create another store, copy portfolio data, or add a network fallback. The HTTP boundary constructs an empty `G2Scope`: no tenant hint is required or sent. It does not read `Authorization`, cookies, caller identity, tenant claims, or request bodies to establish ownership. IPD resolves and validates its own active binding for every IPC request.

IRR's `IIPS_G3_IPC_BINDING_PROVISIONED=true` is a server-owned fail-closed precondition, not proof of a binding. Without it, the three reads return `503 owner-context-unavailable` before a port is constructed. A configured but unavailable IPC endpoint returns a non-disclosing 503.

Context discovery and all HTTP create/save/reset/delete operations remain `503 operation-not-admitted`; they are not forwarded to IPD. IPD Gate E W-1 continues independently to refuse writes, and no write authorization is inferred. The existing Gate C Option 2F unresolved-identity refusal remains unchanged. No other owner-scoped capability or the certified reference portfolio is altered.

## 4. Runtime configuration

On the Windows host, the IPD provider uses its operator instructions with:

```powershell
$env:IIPS_G3_DATABASE_PATH = 'C:\iips-data\iips\user-portfolio.sqlite'
$env:IIPS_G2_IPC_ENDPOINT = '\\.\pipe\iips-user-portfolio-v1'
```

IRR's server process uses:

```powershell
$env:IIPS_G2_IPC_ENDPOINT = '\\.\pipe\iips-user-portfolio-v1'
$env:IIPS_G3_IPC_BINDING_PROVISIONED = 'true'
$env:EXEC_TRANSPORT_PORT = '8787'
```

The IRR variable `IIPS_G3_DATABASE_PATH` is deliberately not used. The optional IRR tenant hint remains local-only and is omitted by the HTTP composition.

## 5. Contract reconciliation note

IPD handoff §3.3's read-shape table does not match the source implementation at the exact merged commit:

- The handoff lists a seven-field `portfolio.list` projection (`currentRevision`, `status`, `createdAt`, `updatedAt`, `deletedAt`, etc.). `src/persistence/portfolio_store.ts` instead defines the nine-field `PortfolioSummary` used by `src/ipc/dispatch.ts` (`portfolio.list` returns `store.list(owner)`), including the stored values the existing IRR adapter validates and maps.
- The handoff describes `portfolio.get` as a record or `null`; IPD `store.get` returns `PortfolioDetail` for an available record and throws `ResourceUnavailableError` for missing/tombstoned records. The IPC maps that closed refusal; IRR maps `RESOURCE_UNAVAILABLE` to its existing `NOT_FOUND` result.
- The handoff's revision projection includes fields such as `portfolioId` and `weightSumPercentage`; IPD's `RevisionEntry` source shape instead carries the stored revision fields (`revision`, `operation`, `committedAt`, optional `contentDigest`, `totalMarketValue`, `provenanceDigest`, and `holdingsCount`). The existing IRR adapter validates that source shape and applies only its recorded `committedAt` → `createdAt` mapping.

This is a handoff-document/source-contract discrepancy, not an IRR-side reinterpretation. IRR did not modify IPD. The integration follows the implementation at the exact commit, with closed-shape validation and no fabricated fields. The actual Windows provider response remains unobserved; if it differs from the merged source shape, IRR fails closed and the handoff/source record must be reconciled before claiming a populated portfolio read works.

## 6. Validation boundary, publication, and exact next action

IRR automated validation covers the real IRR HTTP handler → IPC client/adapter path against a synthetic contract-v1 Unix-socket peer. It does **not** use SQLite, run IPD provisioning, verify Windows named-pipe ACL behavior, or prove that the user's IPD provider is running.

Completed IRR validation:

- `npm ci --ignore-scripts --no-audit --no-fund` — passed with the documented `NODE_EXTRA_CA_CERTS` trust configuration; the lockfile resolves the primary package to the exact IPD commit above.
- Focused user-portfolio suite — **11 files / 169 tests passed**.
- `npm run typecheck:replay-server` — passed (the strict governed Screen replay server import-closure check).
- `npm run typecheck` — passed.
- Full `npm test` — **109 files / 1,365 tests passed**.
- `npm run build` — passed; 142 modules transformed. Vite emitted only the existing large-chunk advisory.
- `git diff --check` — passed.
- Pre-merge publication snapshot: branch `arena/2fe4bbb4-iips-review-recovered`; PR #424 was open. CI run `41329226260` passed on code commit `0e08b4ca754f1789ed189cde1448a49a8796f69c`; the later, actual PR head and successful CI are reconciled in §7 below.
- GitHub Actions CI run `41329226260` passed all workflow steps on `0e08b4c`, including lockfile install, both typechecks, full Vitest suite, non-zero test guard, and production build. The first run exposed a target-library incompatibility (`String.replaceAll` in the replay-server closure); commit `0e08b4c` replaced it with equivalent ES2020-compatible regex normalization, after which the remote run passed.

These checks establish IRR code/test behavior against synthetic IPC and the exact source pin, not the user's Windows named-pipe ACL, actual running provider, or live response.

**Next action:** on the designated Windows laptop, start the already-provisioned IPD G3 IPC provider against the reported database path, start IRR with the variables in §4, and request `GET /api/user-portfolios`. Verify the response is HTTP 200 with `{"portfolios":[]}` and that detail/revision reads are only made for IDs actually returned by IPD. Do not reprovision the database or attempt a write. Record this as operator-executed evidence; it is not an Arena observation.

## 7. Post-merge documentation reconciliation (2026-11-01)

**Stale commit/status reference reconciled without changing historical evidence.** The original publication note identified `0e08b4c` as the “current” commit. That is the code commit exercised by CI run `41329226260`, but by the time the publication note was finalized, the PR branch had advanced to `dcd9c27eb8ea0af66b8cab8d90221c8711e4ea99`; run `41329410819` passed on that exact PR head. The note above now preserves `0e08b4c` as the earlier tested code snapshot rather than current main. PR #424 was merged at `2026-11-01T17:22:44Z`.

GitHub independently reports authoritative IRR `main` at merge commit `abb5bdaf9dcae7586b2a2ab1b66c81461eca1f97`, tree `20786750a3756cf16e816a48b1e919fafc45012a`. The PR merge commit has the exact PR-head `dcd9c27…` as its second parent; no application implementation changed after the successful exact-head CI run.

## 8. Downstream status and boundaries

| Status | Item | Disposition |
|---|---|---|
| **Completed** | IPD Direct P1 source pin; IRR IPC read composition; PR #424 merge; synthetic Unix-socket end-to-end tests; exact-head GitHub CI | The merged source shape is implemented with closed validation. No duplicate IPD work is needed. |
| **Pending — operator** | Windows named-pipe smoke test | Start the already-provisioned IPD provider and IRR as in §4; issue the list GET and record status/body. This is the exact next action. Do not rerun provisioning or attempt a write. |
| **Pending — contract/documentation** | Handoff §3.3 versus exact merged IPD source schema | The discrepancy is recorded in §5. The source implementation remains the current integration basis. Reconcile the handoff/source description before claiming a populated provider response if observed wire data differs; IRR must fail closed on a mismatch. |
| **Pending — evidence/qualification** | Native endpoint-literal evidence (tracker pending item P-31) | The IRR integration peer uses a synthetic Unix-domain socket; it does not exercise `\\.\pipe\iips-user-portfolio-v1` or Windows ACL behavior. The operator smoke test is not claimed as already satisfying P-31; map and accept that evidence or record the applicable PA disposition. |
| **Pending — governance record, not a provisioning prerequisite** | Pre-Direct-P1 P1-F / G14 tracker state | The 2026-10-31 consolidated resolution still lists G6 P1-F consumption as unreconciled; its pending register still labels P-10 unspent and P-37 unreconciled. These are dated pre-Direct-P1 records. The user-reported Direct P1 provisioning evidence does not establish the separate P1-F authorization's consumption state. Preserve those historical entries and reconcile through a dated authoritative overlay if needed; do not repeat P1-F or treat it as a prerequisite to the Direct P1 IPC smoke test. |
| **Blocked — broader program gates; outside this integration** | Final G14 reconciliation / full qualification and admission | The 2026-10-31 assessment leaves G14 partial/blocked: S3, QE (0/11), DQ-4 (8/10), Gate 4 pin/acceptance, Gate 5, and identified PA decisions remain. PR #424 does not close or authorize those broader gates; this narrow personal/local read does not claim full conformance, qualification, admission, or production readiness. |
| **Not admitted / not a follow-up action** | Context discovery, HTTP writes, certified-analytics integration, other owner-scoped surfaces | Gate E W-1 and the existing fences remain unchanged. No write, broader capability, tenant/identity channel, or production/multi-user behavior is authorized by this integration. |
| **Optional** | `tenantHint` | It is omitted by this HTTP composition and is not needed for Direct P1 owner resolution. Do not add it to IPC. |
