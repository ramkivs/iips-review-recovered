# PKG-09 clean-clone command transcript

**Date:** 2026-10-18 (Asia/Calcutta). **Scope:** clean-clone instructions and direct API probes only; not browser, Windows, or human usability acceptance. The shell transcript used temporary paths under `/tmp/iips-pkg09.qX08Oz`; the actual package in the evidence record summarizes outputs without preserving owner-context contents.

## Clone and install

```sh
TMP=$(mktemp -d /tmp/iips-pkg09.XXXXXX)
REPO="$TMP/repo"
git clone --depth 1 https://github.com/ramkivs/iips-review-recovered.git "$REPO"
git -C "$REPO" rev-parse HEAD
# 9be364b11631291a8602e07fcbdd0c7a9cc6ed06
git -C "$REPO" status --porcelain | wc -l
# 0
node --version
# v22.22.3
npm --version
# 10.9.8
cd "$REPO/frontend"
NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt npm ci --no-audit --no-fund
# added 188 packages in 6s
```

Without the documented CA setting, the first `npm ci --no-audit --no-fund` failed at codeload with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`; retry with the runbook's CA setting passed. No package files were changed.

## Carrier materialization

```sh
cd /tmp/iips-pkg09.qX08Oz/repo/frontend
RUN=/tmp/iips-pkg09.qX08Oz/owner-run mkdir -p /tmp/iips-pkg09.qX08Oz/owner-run
RUN=/tmp/iips-pkg09.qX08Oz/owner-run node --experimental-strip-types -e "import('./server/owner-context-carrier.ts').then(m => console.log('carrier written:', m.materialiseOwnerContextCarrier(process.env.RUN)))"
wc -c < /tmp/iips-pkg09.qX08Oz/owner-run/owner-context.json
# 363
sha256sum /tmp/iips-pkg09.qX08Oz/owner-run/owner-context.json
# d5a79efb8f13790834f3e4047c5f19030a46d8d0365fa48b28209b1a988ebbe4  .../owner-context.json
```

The carrier file was kept outside the Git working tree and is not part of this evidence commit.

## Documented server command and probes with carrier

Equivalent runbook command with isolated test-only paths/port:

```sh
RUN=/tmp/iips-pkg09.qX08Oz/owner-run \
IIPS_OWNER_CONTEXT_PATH=/tmp/iips-pkg09.qX08Oz/owner-run/owner-context.json \
IIPS_DATA_DIR=/tmp/iips-pkg09.qX08Oz/data \
EXEC_TRANSPORT_PORT=18788 npm run server:dev
# Executive transport listening on :18788
```

GET-only probe results:

```text
200 /api/health bytes=58
200 /api/engines bytes=4725
200 /api/watchlists bytes=582
503 /api/user-portfolios bytes=170
503 /api/reports/artifacts bytes=170
404 /api/reports bytes=21
```

The bare `/api/reports` path is not a valid report route; its 404 is the documented expected result. A valid owner-scoped route `/api/reports/artifacts` returns the preserved `503` fence.

## Documented fail-closed probes without carrier

```sh
env -u IIPS_OWNER_CONTEXT_PATH \
IIPS_DATA_DIR=/tmp/iips-pkg09.qX08Oz/no-carrier-data \
EXEC_TRANSPORT_PORT=18789 npm run server:dev
# Executive transport listening on :18789
```

GET-only results:

```text
503 /api/watchlists error=owner-context-unavailable
503 /api/collaboration error=owner-context-unavailable
503 /api/settings error=owner-context-unavailable
```

No files were created in either temporary data directory after these GET-only checks. The temporary servers were stopped after each probe run.

## Limits

These direct HTTP requests were made from the clean clone inside Arena; they prove only the documented API responses in that environment. They are not manual browser acceptance, a second human's usability result, Windows checkout/ACL qualification, or Group 1 Gate C evidence.
