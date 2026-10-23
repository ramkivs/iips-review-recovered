# PKG-09 clean-clone command transcript

**Execution date:** 2026-10-18 UTC. **Tested repository/ref:** `ramkivs/iips-review-recovered` `main` at **`e9bb64c2e5aa5c888b689f6e40fc5ae3875ccab6`**, the independently verified PR #132 merge commit. Its first parent is `9be364b11631291a8602e07fcbdd0c7a9cc6ed06`; its second parent is PR #132 head `c8fe209ec691dd3673ba9fbd14fb2dd7fba70ec3`. The merge tree and PR-head tree are identical (`4bfa34f5f53a243bc63c75b1ab624875423a6bf2`).

**Scope/disposition:** PASS for the documented clean-clone install, carrier materialization/integrity, PKG-09 GET-only API probes, fail-closed responses, and unintended data-file checks on the exact merged commit. This is not full WP-1 acceptance, a full replay of every runbook route, a browser or independent-reader test, Windows qualification, Gate C evidence, qualification, admission, or production authorization.

The fresh clone and temporary files used in this run were under `/tmp/iips-pkg09-main-e9.CbqtHQ`; the carrier, response captures, and data directories were outside the Git working tree. This path identifies the original run; it is not durable storage. At execution, remote `main` resolved to the pinned `e9bb64c…` merge SHA. For a later replay after `main` advances, fetch and check out that exact commit before installing; do not substitute the then-current `main` for the tested commit.

## 1. Clone, commit identity, and install

Commands:

```sh
TMP=$(mktemp -d /tmp/iips-pkg09-main-e9.XXXXXX)
REPO="$TMP/repo"
RUN="$TMP/owner-run"
DATA="$TMP/data"
NO_CARRIER_DATA="$TMP/no-carrier-data"
git clone --depth 1 --branch main --single-branch \
  https://github.com/ramkivs/iips-review-recovered.git "$REPO"
git -C "$REPO" rev-parse HEAD
git -C "$REPO" status --porcelain | wc -l
node --version
npm --version
cd "$REPO/frontend"
NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
  npm ci --no-audit --no-fund
```

Observed:

```text
HEAD=e9bb64c2e5aa5c888b689f6e40fc5ae3875ccab6
branch=main
status entries=0
node=v22.22.3
npm=10.9.8
npm ci: added 188 packages in 9s; exit 0
post-install git status entries=0
```

The install used the operator runbook's documented CA-bundle workaround; TLS verification was not disabled. npm emitted a Git-dependency integrity warning and an existing deprecation warning, but no install failure and no tracked-file change.

## 2. Governed carrier materialization and integrity

The repository helper wrote only to a temporary directory outside the clone:

```sh
mkdir -p "$RUN"
cd "$REPO/frontend"
node --experimental-strip-types -e \
  "import('./server/owner-context-carrier.ts').then(m => console.log('carrier written:', m.materialiseOwnerContextCarrier(process.argv[1])))" \
  "$RUN"
wc -c < "$RUN/owner-context.json"
sha256sum "$RUN/owner-context.json"
```

Observed:

```text
carrier written: /tmp/iips-pkg09-main-e9.CbqtHQ/owner-run/owner-context.json
bytes=363
sha256=d5a79efb8f13790834f3e4047c5f19030a46d8d0365fa48b28209b1a988ebbe4
canonical byte-length + pinned SHA-256 check: PASS
```

No carrier contents were copied into this transcript. The file remained outside the Git working tree.

## 3. Server with the valid carrier; GET-only probes

Documented `npm run server:dev` was run with isolated temporary paths and port `18788`:

```sh
IIPS_OWNER_CONTEXT_PATH="$RUN/owner-context.json" \
IIPS_DATA_DIR="$DATA" \
EXEC_TRANSPORT_PORT=18788 npm run server:dev
# Executive transport listening on :18788 (0.0.0.0)
```

Observed direct HTTP results:

| Request | Result | Observed response |
|---|---:|---|
| `GET /api/health` | `200` | 58 bytes; `{"status":"ok","transport":"program-v3.0 executive (dev)"}` |
| `GET /api/engines` | `200` | 4,731 bytes; 13 certified engines; SHA-256 `bece9821e0a2d98f71d470fa67ea1f594763e69e72966549b7b807a6bdaa9f9c` |
| `GET /api/watchlists` | `200` | 582 bytes; `data` array empty on this clean data home |
| `GET /api/user-portfolios` | `503` | 170 bytes; `{"error":"owner-context-unavailable"}` |
| `GET /api/reports/artifacts` | `503` | 170 bytes; `{"error":"owner-context-unavailable"}` |
| `GET /api/reports` | `404` | 21 bytes; `{"error":"not found"}` — bare `/api/reports` is not a valid artifact route |

The two valid owner-scoped `503` responses are the expected preserved fences, not a failed probe. All requests were GET-only; no portfolio, report, watchlist, or other data mutation was attempted. The transport was stopped after the probes.

## 4. Fail-closed probes without a carrier

A second documented server start omitted the carrier, used a separate temporary data home, and listened on port `18789`:

```sh
env -u IIPS_OWNER_CONTEXT_PATH \
  IIPS_DATA_DIR="$NO_CARRIER_DATA" \
  EXEC_TRANSPORT_PORT=18789 npm run server:dev
# Executive transport listening on :18789 (0.0.0.0)
```

Observed GET-only results (each response was 170 bytes):

```text
503 /api/watchlists     {"error":"owner-context-unavailable","detail":{"reason":"No non-authentication ownership source has been established. No owner is inferred; no data is read or changed."}}
503 /api/collaboration  {"error":"owner-context-unavailable","detail":{"reason":"No non-authentication ownership source has been established. No owner is inferred; no data is read or changed."}}
503 /api/settings       {"error":"owner-context-unavailable","detail":{"reason":"No non-authentication ownership source has been established. No owner is inferred; no data is read or changed."}}
```

The server was stopped after the probes. No response was treated as evidence to lift a fence.

## 5. Targeted reconciliation of the earlier `engines` byte count

The earlier pre-merge transcript recorded `GET /api/engines` as 4,725 bytes at `9be364b…`. That count was not reproduced. Because the exact PR #132 merge contains no application-runtime or package-lock changes relative to its first parent, a targeted parent-vs-merge check was run with the same installed lockfile and the same server code path:

```sh
git -C "$REPO" fetch --deepen=1 origin main
# first parent of e9bb64c... = 9be364b11631291a8602e07fcbdd0c7a9cc6ed06
git -C "$REPO" diff --name-only 9be364b11631291a8602e07fcbdd0c7a9cc6ed06 e9bb64c2e5aa5c888b689f6e40fc5ae3875ccab6
# application runtime and package manifests/lockfile: no diff
git -C "$REPO" checkout --detach 9be364b11631291a8602e07fcbdd0c7a9cc6ed06
# start only the API server on :18790, GET /api/engines, stop it
git -C "$REPO" checkout main
```

Observed at both `9be364b…` and `e9bb64c…`:

```text
bytes=4731
sha256=bece9821e0a2d98f71d470fa67ea1f594763e69e72966549b7b807a6bdaa9f9c
certified engines=13
parent and merge response bodies: IDENTICAL
```

The prior `4,725` byte count has no saved response body or hash to compare; its six-byte variance remains unexplained and is treated as a transcript measurement discrepancy, not as a route or response-contract failure. Both commits return the expected `200` and the same 13-engine payload in this targeted comparison.

## 6. Unintended data-file and clean-clone checks

After both servers and the parent comparison server were stopped:

```text
/tmp/iips-pkg09-main-e9.CbqtHQ/data                  absent (0 files)
/tmp/iips-pkg09-main-e9.CbqtHQ/no-carrier-data       absent (0 files)
/tmp/iips-pkg09-main-e9.CbqtHQ/parent-comparison-data absent (0 files)
carrier is outside the clone: YES
git -C "$REPO" checkout main: main is e9bb64c2e5aa5c888b689f6e40fc5ae3875ccab6
final clean-clone git status entries=0
```

No application data files were created by these GET-only checks.

## 7. Final disposition and limits

**PKG-09 exact-commit verification: PASS** for the scripted clone/install/carrier/API/fence/integrity/no-data-creation procedure above, tested at the exact PR #132 merge commit `e9bb64c2e5aa5c888b689f6e40fc5ae3875ccab6`. The prior run at `9be364b…` is not used to infer this result; the exact merge was cloned and exercised directly.

This closes the post-merge clean-clone verification gap. It does **not** close the broader WP-1 independent-reader criterion or capability-matrix row 47: no independent human reader participated, this was the PKG-09 probe subset rather than every runbook route, and there was no Windows or browser acceptance. No product qualification, portfolio/Reports admission, release, or production eligibility is claimed.
