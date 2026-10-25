# Evidence annex — NP-06 Reports resumption, pass 2 (`2026-10-25`)

| Field | Value |
|---|---|
| **Parent record** | [`IIPS_v3.0_REPORTS_NP06_RESUMPTION_PASS2_EXECUTION_RECORD_2026-10-25.md`](../../../docs/integration/IIPS_v3.0_REPORTS_NP06_RESUMPTION_PASS2_EXECUTION_RECORD_2026-10-25.md) (`IIPS-V3-REPORTS-NP06-RESUMPTION-PASS2-EXECUTION-2026-10-25-01`) |
| **Authority** | Commissioning `IIPS-V3-REPORTS-NP06-RESUMPTION-COMMISSIONING-PA-DECISION-2026-10-25-01` §2(4). **Evidence only — no authority is conferred by this directory.** |
| **Date** | `2026-10-25` (Asia/Calcutta) |
| **Baseline** | IRR `main` `67739e23108eeac0b0e9ce04427d622779f01a06`, tree `1316e8008c65095a65261add4994fc4fa4a79d56` |
| **Environment** | Node `v22.22.3`, npm `10.9.8`, Vitest `2.1.9`; `npm ci` in `frontend/` against the committed lockfile. The sandbox required `NODE_EXTRA_CA_CERTS` for the GitHub-pinned dependencies — an environment workaround, not a repository change, and not used by CI. |

## Contents

| File | What it is |
|---|---|
| `focused-reports-suites.txt` | Raw output — integration (5), canonical (46), artifact (56), fence (2), composed route (2) = **111 passed / 0 failed** |
| `restart-suite.txt` | Raw output — separate-process restart suite = **5 passed / 0 failed** |
| `full-ci-suite.txt` | Raw output — `npm run test:ci` = **102 files / 1,309 passed / 0 failed**, and the zero-test guard `assert-tests: OK` |
| `typecheck-and-build.txt` | Raw output — `typecheck` 0, `typecheck:replay-server` 0, direct strict `tsc` on the binding + harness 0, `build` 0 (138 modules; `index-Bh4vcGJI.js` 1,590.96 kB / gzip 222.05 kB) |
| `blob-digests.txt` | `git hash-object` for every path under test, plus the committed `HEAD` digests for the unchanged ones |
| `REPRODUCE.sh` | The exact commands, in order, that reproduce each file above |

## What this evidence does and does not establish

**Establishes:** the admitted `R3` persistence binding still validates its five-operation contract against the real `GovernedArtifactStore` (minting, head-only supersession, cross-owner non-disclosure, fail-closed resolver, close/reopen re-read); the HTTP `503` fence is identical across genuinely separate OS processes; the attempted durable write is refused and leaves no storage; the full current-tree suite, both typechecks, the strict server check, and the build are green at unchanged chunk identity.

**Does not establish:** `F-7` (which requires a separate-process durable **HTTP** restart against an effective `R1` owner source and a rendered `R2` contract), capability acceptance, `CV-51` authorization, production admission, or production readiness. Persistence-level close/reopen durability is not `F-7`.

**Owner data:** the integration suite uses test-only owner pairs (`test-tenant-r3` / `test-owner-r3`, `test-owner-foreign`). They are test data, not a declaration, and cannot serve as a Reports owner source.

**Historical counts not re-executed:** 32/32, 228/228 and 14/14 remain branch-scoped, auth-era, source-reported evidence for IRR `39dd43ebbd54767c4258513a5dfc2d9c1b861d28` / tip `6a8afbb2bb73ca02d2b22e6f45e9f7d27a4a4b9b`. Nothing here re-labels them.
