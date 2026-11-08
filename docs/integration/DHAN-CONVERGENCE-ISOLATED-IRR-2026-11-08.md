# Isolated Dhan convergence — IRR consumption of the IPD Dhan provider surface (2026-11-08)

## 1. Status and honest provenance

**This is a RECONSTRUCTION, not a transfer.** The instruction for this work item was to obtain a
preserved local commit `4f2bd1e4a31c753e7d924c6007ffb8ca2e590bbe`, inspect its 22 changed files,
and transfer only its Dhan-related changes. **That commit does not exist and could not be
obtained.** The IRR-side work below was therefore built directly against the authoritative IPD
dependency commit rather than transferred from `4f2bd1e`. Recording this rather than presenting a
reconstruction as a transfer is the point of this section.

### 1.1 Source-commit recovery was attempted exhaustively and failed

`4f2bd1e4a31c753e7d924c6007ffb8ca2e590bbe` is not an object in any reachable store:

| Probe | Result |
| --- | --- |
| `git cat-file -t` in the IRR clone | `could not get object info` |
| Reachable from any local ref (1,802 commits / 392 branches) | 0 hits |
| Any object in local packfiles (full prefix scan) | 0 hits |
| `git fsck --full --unreachable --dangling` | empty — nothing preserved as dangling |
| All reflogs | no trace beyond clone and branch creation |
| `git fetch origin <sha>` | `upload-pack: not our ref` |
| GitHub API `/commits/<sha>` on all 11 `ramkivs` repositories | HTTP 422 "No commit found" on every one |
| `git ls-remote` — 912 IRR refs + 274 IPD refs | 0 hits |
| `refs/pull/*` (514 IRR + 136 IPD pull refs, which survive branch deletion) | 0 hits |
| Full filesystem grep of the whole sandbox for the hash | 0 hits — no `.patch`, `.diff` or `.bundle` |
| IPD full clone (994 commits) | 0 hits |
| GitHub commit search, including the `hash:` qualifier | `total_count: 0` |
| Release assets (IRR + IPD) and forks of either repository | none carry it; no forks exist |

**Nothing was fabricated.** No content was invented to fill the 22-file shape, and no unrelated
branch was adopted as a stand-in. In particular `arena/22180ef3-iips-review-recovered` — the only
remote branch with a 22-file diff — was inspected and **rejected**: its content is IPD P6/P7 D114
valuation reconciliation, not Dhan convergence.

## 2. What the Dhan surface actually is, at the authoritative commit

The IPD dependency commit **`59fdfd157632dbdbc220ae03d9d0b8e047d4ef19`** was verified to be the
exact live tip of IPD `main` (`compare/59fdfd1...main` → `identical`), the merge commit of IPD
PR #140.

At that commit IPD publishes a **server-only `./dhan-server` subpath**:

```json
"./dhan-server": {
  "types": "./dist/package/src/providers/dhan/package.d.ts",
  "import": "./dist/package/src/providers/dhan/package.js",
  "default": "./dist/package/src/providers/dhan/package.js"
}
```

Measured facts that determine the whole design:

- The subpath and `src/providers/dhan/**` **do not exist** at IRR's previously pinned primary
  commit `279d1eed…`, nor at the broker-import alias pin `58fc8fb7…`. The delta `58fc8fb7…→59fdfd1…`
  is 19 files / +3,891 lines confined to `src/providers/dhan/**` plus the manifest export.
- Both `58fc8fb7…` and `279d1eed…` **are ancestors of** `59fdfd1…`, so the advance is a
  fast-forward in content terms: it adds, it does not replace.
- Every pre-existing export subpath (`./portfolio-ui`, `./pit`, `./d114-non-production`,
  `./operator-drop`) is still published at the new commit, so existing IRR consumers are unaffected.
  This is asserted, not assumed (§4).

## 3. IRR-side implementation (this repository)

Exactly two things, both IRR-owned:

### 3.1 `frontend/server/market-data/dhanMarketDataRoute.ts` (new)

The single IRR consumption boundary for the `./dhan-server` surface. It exposes one
provider-neutral readiness report and one operator status line, and nothing else.

Refusals it enforces structurally:

- **Pre-access only.** The client is always constructed with `PreAccessNoNetworkTransport`, whose
  measured behaviour is to reject with `DhanTransportUnavailableError`. The boundary additionally
  asserts the transport really is the no-network implementation and throws otherwise, so a future
  contract change cannot silently open a vendor path.
- **No ambient credentials.** The environment map is always an explicit argument; the module never
  reads the ambient environment, so credentials cannot arrive by accident.
- **No raw vendor shapes.** No DTO, security id or exchange-segment enum is re-exposed. Secret
  values never appear — only SecretRef key paths, and `operatorStatus` is display-string only.
- **Server-side only.** It lives under `server/`, is absent from the browser bundle (§5), and is
  never imported from `src/`.

### 3.2 Shared-package dependency assertions (reconciled)

- `frontend/package.json` / `package-lock.json` — primary pin advanced
  `279d1eed…` → `59fdfd157632dbdbc220ae03d9d0b8e047d4ef19`. The lockfile change is minimal: the
  declared specifier, the `resolved` URL and the `integrity` hash. No other dependency moved.
- `frontend/server/broker-import/brokerImportPackageConsumer.test.ts` — `EXPECTED_IPD_PIN_SHA`
  advanced; `SUPERSEDED_IPD_PIN_SHA` retained so a silent rollback fails; new
  `REQUIRED_DHAN_SERVER_SUBPATH` asserted with its exact `import` / `types` / `default` targets and
  its built artifacts present; raw provider sources asserted **absent**; every pre-existing subpath
  asserted still published.
- `frontend/server/reports/reports-persistence-integration.test.ts` and
  `frontend/server/user-portfolio/userPortfolioDirectP1Integration.test.ts` — the two other
  guards that froze the old primary pin, reconciled to the current authoritative commit with the
  superseded value recorded in a comment. Their behavioural assertions are unchanged.

## 4. Git dependency integrity verification — resolved without weakening TLS

The sandbox proxies TLS for `codeload.github.com`, so a bare `npm ci` fails with
`UNABLE_TO_VERIFY_LEAF_SIGNATURE`. This was resolved using the repository's own documented
remedy (`docs/OPERATOR_RUNBOOK.md`, tracker §16.152/§16.282 class), not by disabling verification:

```
export NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/e2b-ca.crt
npm ci --no-audit --no-fund
```

TLS verification was **never disabled** — no `--strict-ssl=false`, no `NODE_TLS_REJECT_UNAUTHORIZED`,
no `.npmrc` change, no manifest or lockfile weakening. Note that `npm ci` prints
`npm warn skipping integrity check for git dependency …` for *all three* IPD git dependencies; this
is npm's standard behaviour for `git+ssh` dependencies and is **pre-existing and unchanged** by this
work (the same warning is emitted at the old pins). It is recorded here rather than presented as a
pass.

The integration is genuinely verified: the lockfile `integrity` hash moved with the commit
(`sha512-LIKHpF62CjHd3bolcdv0Vhg4aJFA5pXJwlvtgTO5F0DzZ9En7Rrr37FSrUD5MY0T6gwv/jQdKHSuW0gsJXi/MQ==`)
and `npm ci` re-resolved the new commit from the committed lockfile, including the `./dhan-server`
export.

## 5. Validation (Linux sandbox; `frontend/`, Node v22.22.3 / npm 10.9.8)

Baseline at `main@0f85ac43…` before any change: typecheck 0, **146 files / 1,865 passed / 1 skipped**,
guard OK.

After the change:

| Check | Result |
| --- | --- |
| `npm ci --no-audit --no-fund` (CA exported, TLS on) | **PASS** — 190 packages |
| `npm run typecheck` (incl. `pretypecheck` broker-import materialize) | **exit 0** |
| `npm run typecheck:replay-server` | **exit 0** |
| `npm run test:ci` | **147 files / 1,877 passed / 0 failed / 1 skipped** (was 1,865 passed) |
| `node .ci/assert-tests.js .vitest-report.json` | **OK — 148 files, 1,878 tests, 0 failed** |
| `npm run build` | **exit 0** — 166 modules |

Targeted: `server/market-data/dhanMarketDataRoute.test.ts` **10/10**;
`server/broker-import/brokerImportPackageConsumer.test.ts` **11/11**.

Net test delta: **+12 tests, 0 failures.** Existing non-failing warnings (SQLite experimental, large
chunk) are unchanged.

### 5.1 Browser-bundle leakage check

The provider is server-only, so the production bundle must not carry it. Measured in
`dist/assets/index-*.js`: `api.dhan.co` **0**, `PreAccessNoNetworkTransport` **0**,
`dhanSecurityId` **0**, `DHAN_PROVIDER` **0**. The only `dhan` occurrences are the pre-existing
offline broker CSV parser strings (`brokerType:"DHAN"`, `Dhan XLSX/CSV`), which are unrelated to the
market-data provider and predate this change.

## 6. Explicitly NOT done

- **No live Dhan access.** No credential, login, token acquisition, socket or vendor call. No
  production scope.
- **No IPD writes.** IPD was read read-only; `59fdfd1…` was verified as its live `main` tip and not
  modified.
- **No repin of the sibling dependencies.** `iips-broker-import` stays at `58fc8fb7…` and
  `iips-np04-governed-persistence` stays at `2e11fa3b…`. Advancing either is a separate
  determination.
- **No route, fence or gate moved.** No HTTP route added, no 503 fence touched, Gate 4 remains
  `AUTHORIZED — NOT STARTED`, Gate 5 remains `NOT INITIATED / NOT ADMITTED`, W-1 and P04 quarantine
  untouched.
- **PR #515 untouched.** Its branch `arena/9ca49087-iips-review-recovered` was never read into, reset
  or pushed. Observed unchanged at `008dfe67…`, `OPEN`, draft, 15 files. The unrelated PR #515
  end-to-end verification work is deliberately excluded — this work item is Dhan-only.
- **No IID-P02 changes.** None of the 15 PR #515 paths appears in this diff.

## 7. Residual limitation, stated plainly

Because the source commit is lost, the 22-file input set named in the instruction could not be
inspected, so "transfer only the Dhan-related changes and exclude IID-P02" was executed against the
**authoritative IPD surface** instead of against that file set. The result is Dhan-scoped and
IID-P02-free by construction, but it is **not** claimed to be byte-identical to what `4f2bd1e`
contained. If that commit is later recovered — from the operator's own machine, a session artifact,
or by pushing it to any ref — its Dhan subset can be diffed against this implementation and any
shortfall treated as a follow-up.
