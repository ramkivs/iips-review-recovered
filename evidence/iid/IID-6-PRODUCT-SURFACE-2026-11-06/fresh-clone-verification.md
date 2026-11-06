# IID-6 — fresh-clone verification

The work item ends in a merged PR **and** a verification from a fresh clone, because a green branch says nothing
about a checkout that does not share the author's `node_modules`, `.cache` or database files.

## What was done

```bash
rm -rf /tmp/iid6-verify
git clone --branch main --depth 1 https://github.com/ramkivs/iips-review-recovered.git /tmp/iid6-verify
cd /tmp/iid6-verify/frontend
npm ci --no-audit --no-fund --strict-ssl=false
npm run typecheck                 # runs build:broker-import as a pretypecheck step
./node_modules/.bin/vitest run src
./node_modules/.bin/vitest run server/investment
```

## Result

| Step | Exit | Output |
|---|---|---|
| clone at `main` | 0 | `14de785 Merge pull request #481 …` — the IID-6 merge commit is `main`'s head |
| `npm ci` | 0 | clean install from `package-lock.json` (no dependency was added by this phase) |
| `npm run typecheck` | 0 | `tsc --noEmit` — clean |
| `vitest run src` | 0 | **57 files passed, 1 skipped; 546 tests passed, 1 skipped** |
| `vitest run server/investment` | 0 | **14 files passed; 199 tests passed** |

The clone contains the evidence bundle (`evidence/iid/IID-6-PRODUCT-SURFACE-2026-11-06/`, eight files) and both doc
overlays (roadmap §B.O, register §10).

## What this proves, and what it does not

**Proves.** The phase's tests do not depend on state left in the author's workspace: the two new client modules, the
five new components, the extended company/coverage/portfolio pages, the corrected coverage client and the extended
disposition list projection all pass from a clean checkout of the merged `main`.

**Does not prove.** The fresh clone ran the same targeted suites the phase ran — it is not a full-repository
regression, and no external service, exchange feed or network path was exercised (there is none to exercise: the
surfaces read the local transport). It also does not constitute a real-issuer demonstration: the fixtures are
synthetic (L-004) and no real issuer has been assessed (L-009).

## One reproducibility trap, recorded

`src/api/brokerHoldingsPreview.ts` resolves modules from `.cache/broker-import`, a build artifact that is not in the
repository. A checkout must therefore run `npm run build:broker-import` (or `npm run typecheck`, which runs it as a
`pretypecheck` step) before `vitest run src` will collect. This is pre-existing CI behaviour, not something IID-6
introduced, and it is why the command list above starts with `typecheck`.
