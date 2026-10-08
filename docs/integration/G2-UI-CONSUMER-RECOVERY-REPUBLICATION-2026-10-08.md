# G-2 UI-Consumer — Authorized Implementation Recovery / Durable Re-publication Record

**Date:** 2026-10-08
**Gate:** G-2 UI-CONSUMER — AUTHORIZED IMPLEMENTATION RECOVERY / DURABLE RE-PUBLICATION
**Session branch:** `arena/627f4e40-iips-review-recovered`
**Parent commit:** `17e234a1` (ancestor of IRR main `15b28e86`, verified via remote compare API)
**Operating disposition:** NON-PRODUCTION / IRR ONLY
**Predecessor records:** G2-UI-CONSUMER-IMPLEMENTATION-READINESS-2026-10-08.md, G2-UI-CONSUMER-IMPLEMENTATION-2026-10-08.md, G2-UI-CONSUMER-DURABLE-HANDOFF-2026-10-08.md

---

## §1 Purpose and authority

The previously authorized and validated G-2 UI-consumer implementation was committed
in-sandbox as `7f53ba34d16ccfd27936865746e9608604756c08` (+ follow-up `2df48a1`), but
those commits were **Arena-only**: they were never pushed to any remote and were lost to
sandbox re-provisioning. The working-tree files survived (re-provisioning preserves
`/home/user`), and their byte-exactness was proven in the durable-handoff record via the
blob-SHA manifest (§15-J of that record).

This gate re-publishes that **exact, previously authorized scope** as a NEW commit on the
session branch. This commit:

- **supersedes** the lost Arena-only commit `7f53ba34…` (and `2df48a1`);
- claims **no new authority** — the implementation authority was already granted and
  closed at the G-2 UI-Consumer Implementation gate;
- contains **no scope expansion**: no design changes, no server seam / contract /
  adapter / translation-boundary / authorization / IPD / D115 / iips-platform /
  `/portfolio` / Dhan / persistence / write / analytics / production changes.

## §2 Premise adaptation (no STOP required)

The gate prompt asserts the owner's Windows checkout is freshly cloned at `15b28e86`
and clean. The actual sandbox differs: it holds the session branch at `17e234a1`
with the implementation present as uncommitted working-tree files. Adaptation, not
STOP, was correct because:

- the authoritative recovery source (the working tree) is present and byte-exact
  (§3);
- `17e234a1` is an ancestor of `15b28e86` (remote compare API), so a commit made on
  the session branch yields a three-dot PR diff against main of exactly the change
  set — additive, no unrelated commits;
- nothing was reset, cleaned, or destroyed; the working tree was never at risk.

## §3 Recovery verification — byte-exact

All ten files of the lost commit were re-hashed immediately before committing this
record. Every blob SHA matches the manifest recorded in the durable-handoff record:

```
aaf0d39b8b8f994c4ceb60054a4acae3ea9b07a6  frontend/src/api/userPortfolios.ts
e608f315003904551f65fcdba936c32eddf65008  frontend/src/features/user-portfolios/UserPortfolioStates.tsx
ed4025f4b65274365af7f4583520913eef9600a2  frontend/src/features/user-portfolios/UserPortfolioList.tsx
049a8e193d3d901922bbc2f7ca2f79533fb5f329  frontend/src/features/user-portfolios/UserPortfolioDetail.tsx
fd7d847440c678d96ea14d59f94d3cf95909a13e  frontend/src/features/user-portfolios/UserPortfolioList.test.tsx
4a83e6f58200bf627610363651584c1aad187c26  frontend/src/features/user-portfolios/UserPortfolioDetail.test.tsx
c8b29bbf8e8553aca3947f7630d997a83f5880f0  frontend/src/app/App.tsx        (modified, +additive)
983c46192b6b443a1b99e44edc914fb460001fab  frontend/src/app/navigation.ts  (modified, +additive)
c370a1bd6cb4f6a38476d1cbb47ccec238de5240  docs/integration/G2-UI-CONSUMER-IMPLEMENTATION-READINESS-2026-10-08.md
7d2b05af6e4ac1c379b954657d6c38b48a6b4d41  docs/integration/G2-UI-CONSUMER-IMPLEMENTATION-2026-10-08.md
```

No file was re-typed, re-derived, or approximated. There is no invention.

## §4 Scope audits (re-run this gate — PASS)

- Tracked diff is exactly `App.tsx` + `navigation.ts` modified (+15/−0 total) and six
  new files; nothing else in the tree changes.
- Client is **GET-only**: exactly two `authFetch` call sites, no method overrides, no
  mutation/persistence/Dhan surface.
- No IPD import in the change set (only pre-existing comments in tracked
  `frontend/src/api/pit.test.ts`).
- `/portfolio` and `/portfolio/*` routes untouched; `/user-portfolios` routes are
  purely additive.
- Zero protected-surface modifications (server seam, contracts, adapters, identity,
  iips-platform, IPD, D115).

## §5 Build-dependency reconstruction (NOT part of this commit)

Validation requires `frontend/node_modules`, including the GitHub-pinned dependency
`iips-production-market-data@github:ramkivs/iips-production-market-data#2e11fa3b…`,
which cannot be installed from this sandbox (codeload TLS-blocked; npm registry
works). The package was therefore reconstructed for validation only:

- Every source file of the three compiled subpaths (`./pit`, `./d114-non-production`,
  `./persistence`) plus `package.json` and both tsconfigs was fetched **verbatim**
  from `raw.githubusercontent.com` at ref `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`
  via fetch_page. An earlier attempt to write these files from in-context memory was
  detected as unfaithful (e.g. a wrong SHA-256 K-table in a draft `provenance.ts`,
  and an entirely wrong persistence API surface) and was **fully replaced** by the
  fetched content. Nothing approximated entered the build.
- Compiled with the upstream toolchain pinned in that package's devDependencies
  (`typescript ^5.8.2`, `@types/node ^22.13.9`): `tsc -p tsconfig.pit-package.json`
  → **exit 0**, emitting `dist/package/**` exactly per the package's `exports` map.
- `frontend/node_modules` assembled from a registry install mirroring
  `frontend/package.json` (react 18.3.1, react-router-dom 6.30.6, typescript 5.9.3,
  vite 5.4.21, vitest 2.1.9, jsdom 25.0.1, @types/node 26.6.4, testing-library,
  plugin-react) plus the built IPD package.
- Smoke tests (node:sqlite): governed persistence `openDatabase → createInstance →
  appendVersion → queryByOwner → listSupersededBy` (versions 1→2, single chain,
  owner-scoped) and PIT read boundary over the non-production D114 population
  (EQ-series query resolved vintage `2026-02-10T15:30:00.000Z`, ltp `4125.6`) —
  both PASS.

This reconstruction lives only in `frontend/node_modules` (git-ignored) and is **not**
part of this commit. The owner's Windows install will use the real GitHub-pinned
dependency.

## §6 ACTUAL validation results (fresh, this gate)

Reported as current evidence, independent of (and coincidentally identical to) the
historical results:

| Check | Command | Result |
|---|---|---|
| Narrow suite | `npx vitest run src/features/user-portfolios` | 2 files / 20 tests — **20 passed, 0 failed** |
| Typecheck | `npx tsc --noEmit` | **exit 0** |
| Production build | `npm run build` (`tsc -b && vite build`) | **PASS**, 93 modules transformed |
| Full suite | `npx vitest run` | 66 files passed / 3 skipped (69); **993 passed / 25 skipped / 1018 total, 0 failed**, exit 0 |

Runtime: Node v22.22.3 (`node:sqlite` experimental), Linux sandbox, 2026-10-08.

## §7 This commit (§9 of the gate)

Contents — the 10 manifest files of §3 plus two governance records:

**Application paths (8):**
1. `frontend/src/api/userPortfolios.ts` (new)
2. `frontend/src/features/user-portfolios/UserPortfolioStates.tsx` (new)
3. `frontend/src/features/user-portfolios/UserPortfolioList.tsx` (new)
4. `frontend/src/features/user-portfolios/UserPortfolioDetail.tsx` (new)
5. `frontend/src/features/user-portfolios/UserPortfolioList.test.tsx` (new)
6. `frontend/src/features/user-portfolios/UserPortfolioDetail.test.tsx` (new)
7. `frontend/src/app/App.tsx` (modified, additive)
8. `frontend/src/app/navigation.ts` (modified, additive)

**Governance records (4), enumerated separately:**
9. `docs/integration/G2-UI-CONSUMER-IMPLEMENTATION-READINESS-2026-10-08.md`
10. `docs/integration/G2-UI-CONSUMER-IMPLEMENTATION-2026-10-08.md`
11. `docs/integration/G2-UI-CONSUMER-DURABLE-HANDOFF-2026-10-08.md`
12. `docs/integration/G2-UI-CONSUMER-RECOVERY-REPUBLICATION-2026-10-08.md` (this record)

Excluded: all prior-gate records (P8, UI-*, evidence/, download/), `node_modules`,
build output.

## §8 Remote publication — disposition B

This session is platform-closed: remote GitHub operations (push, PR, `gh`) are
prohibited and cannot be executed. The commit is therefore **locally durable only**.

**Disposition: B — LOCAL DURABLE COMMIT, REMOTE PUBLICATION PENDING.**

Owner-side action (from the Windows checkout at `15b28e86`):

1. Apply the 12 files above (verifiable against the §3 manifest) or pull this
   commit; commit on a **new branch** (e.g. `g2-ui-consumer-recovery-2026-10-08`).
   Do NOT push to the remote session branch name `arena/627f4e40-iips-review-recovered`:
   its remote tip `5e59910` is on a different lineage path, so a push would be
   non-fast-forward.
2. Open a PR to main from that branch. The three-dot diff vs `15b28e86` is exactly
   the change set of §7 (parent `17e234a1` is an ancestor of main).
3. Verify the 8 application paths byte-exact against §3; governance records
   enumerated separately (§7.9–12).
4. Run the Windows non-production acceptance gate (next gate, owner-side) before
   any further stage.

## §9 Supersession statement

- Lost Arena-only commit `7f53ba34d16ccfd27936865746e9608604756c08` (and `2df48a1`)
  are **superseded** by this commit. The lost SHA is not treated as an immutable
  target and was never recreated.
- Prior authority: G-2 UI-Consumer Implementation gate (authorized, validated,
  closed). No new authority is claimed here.
- Scope: read-only User Portfolio list/detail consumer. Non-production only.

**Gate disposition: B.**
