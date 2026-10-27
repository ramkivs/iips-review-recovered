# Execution log — `2026-10-27`

Every line was produced by running the command in the sandbox clone of the stated ref. Nothing here is
copied from a prior record. Working copies: IRR full clone at `origin/main@f74af6d4…`
(`/tmp/irr-full`), IRR shallow worktree for builds (`/tmp/irr-main`, same HEAD), IPD clone at
`main@888eb375…` (`/tmp/ipd`).

## Baseline reads

```bash
git rev-parse origin/main                       # f74af6d4f488ebf6d3e3a94f612a0d831b6b765a
git rev-parse origin/main^{tree}                # ed424ffbe4e3b3863ff00a47aa25fa0ca4e0c62f
git rev-list --count origin/main                # 850
git for-each-ref --format=x refs/remotes/origin | wc -l   # 240
git tag -l --format='%(refname:short) %(objecttype)'      # program-v1.2.0 tag, v3.0-phase12-certified tag
git rev-parse program-v1.2.0^{commit}           # 5decdca9…
git rev-parse v3.0-phase12-certified^{commit}   # 7325aeda…
git rev-parse --is-shallow-repository           # true (workspace checkout) — full clones used instead
```

IPD: `888eb375eebee01640e44ccdcbb138a71e8c4513` / tree `cf3b90482fa7ed1f9780f20a9286164686885d2b`,
328 commits, 89 remote branches, 6 tags.

## IRR build and test (`/tmp/irr-main/frontend`)

| Command | Result |
|---|---|
| `npm ci` (with `NODE_EXTRA_CA_CERTS=…/e2b-ca.crt`) | exit 0 |
| `npm run typecheck` | exit 0 |
| `npm run typecheck:replay-server` | exit 0 |
| `npx vitest run --reporter=json` | 106 files / 365 suites / 1,350 tests / 1,350 passed / 0 failed |
| `npm run build` | exit 0 — 142 modules, 1,609.84 kB (gzip 226.69 kB) |
| `npx vitest run` — restart block (4 files) | 15 passed |
| `npx vitest run` — fence/adapter/boundary block (6 files) | 112 passed |
| `npx vitest run` — reports block (3 files) | 20 passed |

The runbook's restamped figures (`docs/OPERATOR_RUNBOOK.md:176`) were reproduced exactly: 106 files /
1,350 tests / 1,609.84 kB / 226.69 kB gzip.

## IPD build and test (`/tmp/ipd`)

| Command | Result |
|---|---|
| `npm ci` | exit 0 |
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | exit 0 |
| `node scripts/run-tests.mjs` | 924 tests / 923 passed / 1 skipped / 0 failed; `[test-guard] OK` |
| `npm run test:package-consumer` | PASS — browser pack `1,729,700` B, `forbiddenHits: []`, strict typecheck (`skipLibCheck:false`) PASS |

## Ref and ancestry reads

| Command | Result |
|---|---|
| `git merge-base --is-ancestor 470cc698 origin/main` | exit 1 — **NOT** an ancestor |
| `git branch -r --contains 470cc698` | `origin/arena/a2df3b85-…` only |
| `git rev-list --left-right --count origin/main...origin/arena/a2df3b85-…` | `692 7` |
| `git cat-file -t 470cc698` | `commit` |
| `git rev-parse origin/main:frontend/server/reports-transport.ts` | `775d282b…` |
| `git rev-parse origin/main:frontend/server/user-portfolio-transport.ts` | `51704c12…` |
| `git rev-parse origin/main:frontend/server/owner-context-unavailable.ts` | `cb8db45d…` |
| `git rev-parse origin/main:frontend/server/user-portfolio/userPortfolioContract.ts` | `e6b57bb8…` |
| `git ls-tree -r --name-only origin/main frontend/server/reports/` | 10 files (7 modules + 3 tests) |
| `grep -rn durablePortfolioStorePort\|brokerImportPersistence` (IPD) | test-only consumers |
| `grep -rn d115-runtime` (IRR) | own test file only — zero runtime consumers |
| package export census in `node_modules` | `./pit`, `./portfolio-ui`, `./d114-non-production`, `./persistence`; np04 entry name reports `iips-production-market-data`; `iips-broker-import` exports `[]` |

## Live transport probe

See `02-probe-matrix.md` (server started with `npx tsx server/executive-transport.ts`, `127.0.0.1:8787`).

## Artefact build and self-check

```bash
python3 build_matrix.py     # 51 rows, numbering 1–51, headers in order, arity 17, 0 empty cells,
                            # 0 unexplained NA, CSV round-trip equal  -> 00-artefact-checks.json
python3 sectionE.py         # section E counts from the same source
python3 build_report.py     # assembles the report, 12 internal checks, all PASS
python3 verify_publication.py --local   # bundle integrity before publication
```
