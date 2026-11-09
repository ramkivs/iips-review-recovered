# IRR Broker Import dependency alignment — IPD PR #145 (`709fd13`)

**Date:** 2026-11-09. **Type:** additive dependency integration/verification receipt, not a PA act or qualification.
**IRR starting `main`:** `7a330588df8e4ef3dc6ef5d948366bd101931d39` (includes PRs #535, #536).
**Authoritative IPD `main`:** `709fd13c77e90df05900859d23ba57d1004197a0` (merge commit of IPD PR #145).

## 1. Authoritative source, not an assumed moving pin

IRR `main` and IPD `main` were fetched and inspected remotely before any edit. IPD `main` was
observed at **`709fd13c77e90df05900859d23ba57d1004197a0`** — the merge commit of IPD PR #145.
The prior audit's SHAs were **not** relied upon blindly; each target below was re-derived from the
authoritative remote history.

## 2. The two outstanding alignment items

### 2.1 Broker Import alias → the authenticated master

IRR's `iips-broker-import` alias was pinned to `58fc8fb7f033650f40d61078d70e951f21dd033f`
(IPD PR #131 merge). That revision carries only the **legacy D05 broad universe** (2,250 records).
The **authenticated** universe arrived in IPD commit `60cad83` ("D05 one-time replacement:
authenticated runtime activation + full test re-pin"), which:

- adds `src/identity/d05_authenticated_universe_data.ts` (2,390 records, checksum
  `b555fd28589a03ea5cbb11c92f880468bcc4b63f449b853a18542aca5817d4c4`);
- re-pins the governed source revision to
  `AUTH-D05-REPLACEMENT-AUTHENTICATED-UNIVERSE-ACT-2026-11-08-001`;
- **retains `getGovernedBroadSecurityMaster()` as a backwards-compatible alias** that now resolves
  to the authenticated universe, and moves the frozen Wave-1 corpus (2,250 records) behind the new
  `getGovernedLegacyWave1SecurityMaster()`.

### 2.2 Primary alias → the Stage 4 identity-qualification implementation

IRR's `iips-production-market-data` alias was pinned to `73768fa83c331de1bd9f51af0a6b26e5ad489ba2`,
which is IPD PR #145's **head** commit. The Stage 4 implementation (`b269bfb`, "feat: IPD Stage 4
non-production security identity ingestion implementation") adds
`src/providers/dhan/dhan_security_identity_service.ts`, exposed through `./dhan-server` as
`SecurityIdentityQualificationResult` / `HoldingIdentityInput` / `SecurityIdentityQualified` /
`SecurityIdentityUnresolved`.

### 2.3 Why ONE revision satisfies both items

`709fd13…` is the **merge commit of IPD PR #145** and is an ancestor-of-nothing-else: it contains
**both** the authenticated universe (`60cad83`) **and** the Stage 4 implementation (`b269bfb`),
because both sit on IPD `main` ahead of the merge. Verified:

| Property | Verification |
|---|---|
| `709fd13` is IPD `main` | `git ls-remote origin refs/heads/main` |
| `60cad83` (authenticated master) is an ancestor of `709fd13` | `git merge-base --is-ancestor` → yes |
| `b269bfb` (Stage 4) is an ancestor of `709fd13` | `git merge-base --is-ancestor` → yes |
| `709fd13` contains `src/identity/d05_authenticated_universe_data.ts` | `git ls-tree` → present |
| `709fd13` contains `src/providers/dhan/dhan_security_identity_service.ts` | `git ls-tree` → present |
| `73768fa` is PR #145's head, the direct parent of the merge | `git log` → yes |

**One IPD revision is now in play for both aliases.** The two npm alias names remain distinct
dependency roots (so IRR keeps two independently materializable installs), but they resolve to the
same authoritative IPD commit.

### 2.4 Why the alias could NOT be pinned to `60cad83`

`60cad83` sits on a branch that **predates the `./dhan-server` package export** (`264549d`). At
`60cad83` the IPD manifest publishes only `./portfolio-ui`, `./pit`, `./d114-non-production` and
`./operator-drop` — `src/providers/dhan/**` does not exist there at all. Pinning the primary alias
to `60cad83` would have broken every IRR `./dhan-server` import. `709fd13` publishes all five
subpaths with an **identical export map** to the previous pin.

## 3. Compatibility of the advances

### 3.1 Broker Import consumed surface (`58fc8fb` → `709fd13`)

The **only** change to the IRR-consumed broker-import surface is
`src/identity/governed_fixture_master.ts`. No consumed module was removed or renamed, so the
18-module / 36-required-artifact profile and both runtime entrypoints are unchanged. The
`files: ["dist/package"]` contract and the **five**-subpath export map are unchanged (`./portfolio-ui`,
`./pit`, `./d114-non-production`, `./operator-drop`, `./dhan-server`; the earlier `four-subpath`
wording in this paragraph described the pre-DHAN-P3 pin `58fc8fb`, and is corrected here additively —
the dated statement above it is left as published).

IPD's own `broker_observation_resolver` execution-stage guard is re-pinned **by IPD**
(record count 2,390; the replacement act reference). IRR neither reimplements nor weakens it.

### 3.2 Primary alias consumed surface (`73768fa` → `709fd13`)

`git diff 73768fa 709fd13 -- src/providers/dhan/package.ts` is **empty**: the entire `./dhan-server`
export surface IRR consumes is byte-identical. The package export map is byte-identical. All **33**
symbols IRR imports across `./dhan-server`, `./pit`, `./d114-non-production` and `./portfolio-ui`
were enumerated from IRR's own sources and confirmed present in the `709fd13` export surfaces.

## 4. Exact dependency and consumer scope

| Integration point | Change or preserved role |
|---|---|
| `frontend/package.json` | `iips-broker-import` advances `58fc8fb…` → `709fd13…`; `iips-production-market-data` advances `73768fa…` → `709fd13…`. `iips-np04-governed-persistence` (`2e11fa3b…`) **unchanged** — it is a separate NP-04 branch, outside this scope. |
| `frontend/package-lock.json` | Exactly **5 lines**: the two root alias specifiers, the two `node_modules/…` `resolved` Git URLs, and the `iips-broker-import` `integrity` value. **No unrelated dependency movement** — a full `npm install` regeneration was explicitly rejected because it pulled newer transitive versions (1,293 changed lines). The `integrity` correction is recorded in the PR #146 reconciliation (see `WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-PR146-2026-11-09.md` §2/§7): the `iips-broker-import` entry still carried `sha512-Kum3z9…`, the SRI of the retired `58fc8fb` archive, although both aliases pack the byte-identical d5 archive whose SRI is `sha512-GwA4k…`. |
| `frontend/broker-import-package-profile.json` | Matching `aliasCommit` / `aliasSpecifier` / provenance and the compatibility rationale. Required modules and runtime entrypoints **unchanged**. |
| `frontend/broker-import-publication-manifest.json` | Regenerated from the **actually installed** bytes at the new pin: 204 published files (was 152), `packageJsonSha256` `af7d0d49fb016733492bb9d238332df6ab11f5811ec2d48d0fff24c0f065de2c`, `publishedInventorySha256` `77ad687518447552b4fe030baa447458634b541cb20bf24027ef3de22f640ea7`. The digest definition is unchanged (SHA-256 of the compact, key-sorted, path-sorted JSON array). |
| `frontend/scripts/materialize-broker-import.mjs` | **UNCHANGED** fail-closed exact-pin checker and published-byte copier. |
| `frontend/tsconfig.broker-import.json` | Current-pin comment only. No raw-IPD-source compilation or build semantics change. |
| `frontend/src/api/brokerHoldingsPreview.ts` | Current-pin comment only. Existing imported broker ingress and governed D05 master unchanged; IRR still resolves nothing itself. |
| `frontend/server/broker-import/brokerImportPackageConsumer.test.ts` | Pin constants and the publication-integrity guard updated; the rollback guards now also cover the superseded DHAN-P5 pin. The "alias SHA differs from the primary SHA" assertion was replaced by an equivalent-but-correct guard (the alias is a distinct **npm dependency root**, not a distinct IPD revision). |
| `frontend/server/market-data/dhan*.ts`, `frontend/src/api/brokerHoldingsPreview.test.ts`, `frontend/server/{reports,user-portfolio}/…`, `frontend/server/broker-import/brokerImportEvidence{Store,Restart}.test.ts` | Pin-reference comments and the assertions that encode IPD's published per-row identity outcomes. **No production behaviour change** — the only non-comment source diff in the whole change set is zero. |

**No broker-import functionality, identity mapping, fixture or governance decision was modified.**
The 68-row Dhan fixture is byte-identical; the `evidence/` tree is byte-identical.

## 5. The one observable behaviour change, and its authority

Under IPD's authenticated universe, the 68-row Dhan Web UI summary intake now resolves **3** rows
(AGI GREENPAC via its governed alias, GHCL and KROSS natively) instead of **1**; **65** rows stay
`UNRESOLVED` instead of 67, and the retained P04 quarantine inventory is 130 records instead of 134.

This is **IPD's authoritative outcome, not an IRR change**. IPD's own commit message for `60cad83`
records: *"68-row Dhan intake: resolves AGI GREENPAC (governed alias) + GHCL + KROSS; 65 stay
UNRESOLVED."* The three identities were observed directly in the installed materialized bytes and
match that record exactly. IRR continues to publish IPD's per-row outcomes and aggregates verbatim:
it does not resolve identity, rank candidates, widen a namespace, infer mappings from name
similarity, or fabricate an identifier.

> **READ WITH:** `WS-A-68-ROW-IDENTITY-ASSESSMENT-RECONCILIATION-2026-11-09.md` (Item 4), which
> separates this **3 resolved / 65 unresolved** result from two other results for the same 68
> positions, and explains why they must not be conflated:
>
> | Result | Master | Identifiers supplied | Authority |
> |---|---|---|---|
> | **1 resolved / 67 unresolved** | legacy Wave-1 (2,250) | name only | IPD `GOVERNED_B_06_WAVE1_MASTER` run |
> | **3 resolved / 65 unresolved** *(this record)* | D05 authenticated (2,390) | name only | IPD `GOVERNED_AUTHENTICATED_MASTER_2026-11-08` run |
> | **65 resolved / 3 unresolved** | D05 authenticated (2,390) | **ISIN**, from the B-04 companion export | IPD §9-A PA-authorised reassessment |
>
> The third result is **not** an outcome of the `DHAN_WEB_UI_SUMMARY_V1` CSV: that surface supplies
> no ISIN and no exchange, so the ISIN namespace is never queried on it. The three residual rows
> under §9-A are universe-scope exclusions that correctly fail closed `UNMAPPED_IDENTIFIER`; no
> identity was invented, mapped or bypassed, and their governance dispositions are unchanged.

## 6. Validation

- `npm ci` (lockfile-exact) — PASS. The lockfile installs cleanly at the new pin.
- `npm run build:broker-import` — PASS; **204** published files materialized from the pinned
  package's own published output; no IPD source recompiled.
- `npm run typecheck` — PASS.
- `npm run typecheck:replay-server` — PASS.
- `npm run build` — PASS.
- Targeted Broker Import tests — **298/298 PASS** (13 files).
- Full `npm run test:ci` — **2446 passed, 1 skipped, 0 failed** (176 files passed, 1 skipped).
- Dependency resolution asserted directly: both aliases resolve to `709fd13…` in `package.json`,
  the lockfile root and the lockfile `resolved` URL; `iips-np04-governed-persistence` is unchanged.
- Installed-byte verification: the materialized master reports 2,390 entities with the
  authenticated-universe source revision; `./dhan-server` publishes the Stage 4 qualification types.

## 7. Boundaries

IRR only. No IPD writes, branches, PRs, source edits, implementation repetition or test execution —
IPD was inspected read-only and its working tree is unmodified. No broker-import feature change, no
other package pin change, no identity-mapping, fixture or governance change, no runtime fence,
operational DB, provisioning, saved-holdings write, host qualification, QE, Gate 4 acceptance,
Gate 5/D06 admission or production activation. No production work and no production acceptance
claim. The PR is opened for review and is **not** merged by this work item.

## 8. Superseded facts

`docs/integration/WS-A-BROKER-IMPORT-PIN-ADVANCE-TO-IPD-PR127-2026-11-05.md`,
`…PR128-2026-11-05.md` and `…PR131-2026-11-06.md` remain as their dated snapshots. This receipt
supplies the current dependency currency; it does not rewrite their dated records.
