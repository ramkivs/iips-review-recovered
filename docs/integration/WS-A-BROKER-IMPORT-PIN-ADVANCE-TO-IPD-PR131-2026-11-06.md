# IRR broker-import alias advance — verified IPD #129/#130/#131 baseline

**Date:** 2026-11-06. **Type:** additive dependency integration/verification receipt, not a PA act or qualification. **IRR starting main:** `4fa8f6c7de860df722cdbea3595cbac7a5e75557` (includes #494 R01/F2 closure). User expressly authorized this routine IRR pin/materialization/validation/publication work.

## 1. Authoritative source, not an assumed moving pin

GitHub API inspection observed IPD main at **`58fc8fb7f033650f40d61078d70e951f21dd033f`**. Independently queried PR merge identities and compare/ancestry results establish:

| IPD PR | Merged commit | Relationship to target |
|---|---|---|
| #129 D02/D03/D05 snapshot implementation | `1cde2324ed4b4d636248af9ea3d87b10cac3d031` | ancestor |
| #130 initial D03 UNKNOWN/lost-ACK correction | `f9dac560b821476c417b963c83c80ad0e7747dc7` | ancestor |
| #131 R01-T1…T12 correction | `58fc8fb7f033650f40d61078d70e951f21dd033f` | target/main itself |

IPD #131 head `9e348adbd894c56584ce944d5cfe0964bb1c894e`; head CI42236349898 and main CI42236557560 SUCCESS. Reuse the #494 bounded engineering closure and its recorded test evidence; do not repeat IPD implementation/tests. Read-only authority/ancestry/CI records are retained in `evidence/integration/broker-import-pin-pr131-2026-11-06/authority.json`.

## 2. Exact dependency and consumer scope

| Integration point | Change or preserved role |
|---|---|
| `frontend/package.json` | Only `iips-broker-import` advances from `github:ramkivs/iips-production-market-data#07e86a4f2c105651f3097a96cb519f8611945e30` (#128) to exact `#58fc8fb7f033650f40d61078d70e951f21dd033f`. |
| `frontend/package-lock.json` | Only alias root specifier and alias node_modules Git resolved commit change; no unrelated dependency movement. |
| `frontend/broker-import-package-profile.json` | Matching aliasCommit/specifier/provenance and current record pointer; required18 modules/two runtime entrypoints/layout unchanged. |
| `frontend/scripts/materialize-broker-import.mjs` | UNCHANGED fail-closed exact-pin checker and published-byte copier; writes ignored `.cache/broker-import`. |
| `frontend/tsconfig.broker-import.json` | Current-pin comment only; no raw-IPD-source compilation or build semantics change. |
| `frontend/src/api/brokerHoldingsPreview.ts` | Current-pin comment only; existing imported broker ingress and governed D05 master unchanged. |
| `frontend/server/broker-import/brokerImportPackageConsumer.test.ts` | Updated pin comment; existing8 guards retained; new publication-integrity guard checks every published/materialized file, complete inventory, package.json hash and all four exports against recorded baseline. |
| `frontend/broker-import-publication-manifest.json` | Pin-specific complete152-file SHA256/size inventory, package.json hash, export map and canonical inventory digest; exercised by hosted full suite. |

The primary `iips-production-market-data` pin **`279d1eed184f5e23bbabe5c6411085e120ce9e41`** and `iips-np04-governed-persistence` pin **`2e11fa3b689d1a3674a5e4ba1f1de9a559e20494`** remain unchanged. This is a package baseline advance, **not v2 IRR wire/receipt/UI activation**. No source logic, identity/quarantine policy, persistence adapter, IPC write refusal or W1 fence is changed. Historic #128/current-pin facts in old records remain their dated snapshots; this receipt supplies current dependency currency.

## 3. Materialization and publication integrity

1. Read the target's package manifest, lockfile, package compiler configs and publication-verification script remotely. Package contract remains `files: ["dist/package"]`, prepare builds portfolio-ui and PIT packages; broker import is consumed as built output, not raw sources.
2. Run normal lockfile-exact **`npm ci --foreground-scripts --no-audit --no-fund`**, with TLS verification enabled and environment-only `NODE_EXTRA_CA_CERTS` for the sandbox CA. Git package prepare runs without modifying IPD. The initial missing-CA install failed TLS validation; the trusted-CA retry succeeded. No persistent npm/git/CI TLS bypass.
3. Independently install the exact target Git specifier into a fresh separate npm project. All **152 published files** match the IRR-installed package byte-for-byte. Installed package.json content matches the authoritative remote manifest.
4. Materialize through the unchanged normal IRR script. All152 installed/materialized file bytes match. The original18 modules/36 required JS+declaration artifacts and both runtime entrypoints are present. Every runtime/type target of all four exports (`./portfolio-ui`, `./pit`, `./d114-non-production`, `./operator-drop`) exists. Existing consumer guards verify runtime/type symbols and refusal contracts; new guard verifies all alias export targets and bytes.
5. Package.json SHA256: **`15a7a90faef2f1ba0305505bd64679e6f862b21a2f00265a6d32823b4f8d0a20`**.
6. Canonical published inventory SHA256: **`dea8c1c68e4be36c6840a188ffdc31ea73171b55c23cdf8be66469e2974ddda9`**. Definition: SHA256 of UTF-8 compact JSON array of all files sorted lexically by path, each object's keys sorted (`bytes`, `path`, `sha256`). This binds every published byte, not merely the36 required files.

The actual materializer's manifest is retained as `evidence/integration/broker-import-pin-pr131-2026-11-06/materialized-manifest.json`; its original-byte hash and the publication-manifest hash are in `verification.json`. Generated compiled artifacts/node_modules/cache are not committed. The Git lock entry retains npm-recorded integrity `sha512-Kum3z9GOfiXYWH2z5T3vmc0dksLCwfgJBnlh/Z4Q0HLazDovSsgS40FMSc3xNBeJa43vCYwOP+b3ORl05xj31w==`, which exactly matches the independently generated fresh-install lock entry. npm warns it skips integrity checks for Git dependencies; **no independently verified archive/SRI identity is claimed**. An optional repack of the installed dependency failed because npm attempted prepare against a source-free installed package; this is not an installation/materialization failure and is not used as integrity evidence. Exact Git identity, remote package contract, independent fresh installation and complete file hashes are the integrity proof.

## 4. Validation and independent publication

- `npm run build:broker-import`: PASS,152 published files materialized, original module/entrypoint requirements satisfied.
- Targeted package/API/UI tests: **44/44 PASS** (9 package,21 API,14 UI).
- `npm run typecheck`: PASS; `npm run typecheck:replay-server`: PASS; `npm run build`: PASS.
- Final full `test:ci` plus zero-test/failure guard, IRR static checks and scope/history validation results are recorded in `validation.txt` and `verification.json` after execution. No frontend/server coverage stronger than these configured checks is implied.
- Applicable hosted product CI runs lockfile-exact install/prepare, materialization, typechecks, full suite (including the152-file pin-specific integrity guard), zero-test guard and build. Hosted static CI also applies to this tracker/evidence change. Exact head/main runs are recorded in the final PR receipt; no check bypass or direct-main push.
- Independent post-merge API readback verifies the actual IRR merge/first parent/main, every changed blob, package+lock+profile exact target and full publication/materialization manifest. Hosted green integrity guard supplies independent runner reproduction/materialized-byte verification; no claim of separately downloading an unuploaded CI artifact. The final publication comment records the actual IRR merge hash, CI IDs and manifest digests rather than inventing a self-referential commit in this source document.

## 5. Boundaries

IRR only. No IPD writes, branches/PRs, source edits, implementation repetition or test execution. Installing the published dependency's normal prepare lifecycle is consumption, not implementation work. No unrelated broker-import feature, other package pin, runtime fence, operational DB, provisioning, saved-holdings write, host qualification, QE, Gate4 acceptance, Gate5/D06 admission or production activation. R01/F2 bounded engineering remains CLOSED; other qualification/admission/workstream statuses are unchanged. W1 remains hard-false. Historical receipts, authorities and concurrent work are preserved.
