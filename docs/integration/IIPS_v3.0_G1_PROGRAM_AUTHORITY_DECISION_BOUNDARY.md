# IIPS v3.0 — G1 Program Authority Decision Boundary (B1 / B2 / B3)

> **NON-AUTHORITATIVE INVESTIGATION OUTPUT — DECISION BOUNDARY ONLY.**
> This record prepares decision inputs for the Program Authority (PA). It records **no PA decision**, grants **no production authority**, authorizes **no implementation, merge, provider selection, or pin change**, and makes **no runtime, live-IdP, or full E2E acceptance claim**. It becomes authoritative only when (1) the PA records the decisions and (2) this record is published to `ramkivs/iips-review-recovered` `main` by the user or an authorized route.

## 0. Record control

| Field | Value |
|---|---|
| Gate | G1 — product host (B1), domain/provider authority (B2), engine taxonomy (B3) |
| Gate status | **OPEN** — decision inputs prepared; **no PA decision recorded** |
| Execution mode | NON_PRODUCTION |
| Recorded | 2026-10-09 (Asia/Calcutta) |
| Record path | `docs/integration/IIPS_v3.0_G1_PROGRAM_AUTHORITY_DECISION_BOUNDARY.md` |
| Session branch | `arena/1dcbe88d-iips-review-recovered` (the only permitted push target; introduced by the commit that adds this file) |
| Publication to IRR `main` | **Not performed.** Session policy permits pushes to the session branch only. Requires the user or an authorized route. |
| IRR `main` observed | `8877382048802702484e4297eb73b900e40fa792` |
| IPD `main` observed | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` |
| IPD pin used by IRR `main` | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` (branch `np04-governed-persistence-windows`) |
| IPD G24 candidate tip | `6828155ec6e882bbb4cabcd96b5a841d8c8a6bc4` (branches `arena/01a0e6d9-…` and `arena/01a0f308-…`) |

## 1. Decision table

| Decision | Options | Evidence (summary) | Recommended PA disposition | Blocking consequence |
|---|---|---|---|---|
| **B1 — Product host** | (a) IRR `main`; (b) IPD `main`; (c) neither | IRR `main` is the only candidate with a composed product runtime (UI shell, transport and engine composition): executive transport that imports `iips-platform` in-process and listens on `EXEC_TRANSPORT_PORT` (default 8787); OIDC code + PKCE S256 shell; `/api` dev proxy to 8787. IPD `main` has no `src/server`, `src/auth`, `src/persistence`, `src/portfolio`, no exports map and no `prepare` script; its plan's Phase 1 authorization is blocked by OQ-1/OQ-2, which carry only defaults. "Neither" would require building a new host. | **A — IRR `main` is the product host foundation**, scoped to host, transport and shell only. It is not the product definition, not a provider, not an identity authority, and not a taxonomy. | IRR-hosted surfaces that depend on IPD packages inherit the B2 blockers. The IPD §18 target diagram (`TopBar (tenant/role, NO OIDC)`) conflicts with the IRR OIDC shell; PA must resolve that in host scope. |
| **B2 — Domain / provider authority** | (A) IPD `main` sufficient; (B) designate one candidate with its exact authority basis; (C) unresolved, narrow PA decision before G2 | IPD `main` lacks the package boundary IRR consumes (no `./pit`, `./d114-non-production` or `./persistence` exports; no persistence, portfolio, server or auth source). Two sibling candidate lines each add 4 commits to a shared 22-commit base. The Reports acceptance (PA, branch-only) binds to the NP-04 pin `2e11fa3b…`; the G-2 direction (PA, accepted) names baseline `0dab1221…`, which is on the G24 line only. No single line satisfies both. See §3. | **C — unresolved.** PA to record one narrow decision: (i) dual capability-scoped admission; (ii) single designation that retires one binding; or (iii) defer both. See §3.4. | Provider-dependent G2 durable-portfolio work, Reports provider runtime and any change to the IRR pin remain **blocked**. The agent may not select, merge, cherry-pick or re-pin a provider. |
| **B3 — Engine taxonomy** | (a) 13-engine taxonomy; (b) legacy 10-engine; (c) other | IRR `main`'s `PROGRAM_v1.2_FINAL_READINESS_CERTIFICATE.md` records a 13-engine certified scope, preserves the 10 as historical, and carries a human publication sign-off dated 2026-09-05 (signer not named). Tag `program-v1.2.0` exists on origin and is an ancestor of IRR `main`. Six of the ten legacy engines have engine-level readiness certificates; IES-016/017/020 have `FREEZE_MANIFEST.json` only; banking has no engine-level artefact located. `SECTOR_IT` and `SECTOR_CHEMICALS` on IPD `main` are identifiers in e2e and lineage code, not engines. | **A — 13-engine taxonomy**, with per-engine evidence labels (§4). The legacy 10-engine set is historical for convergence and must be re-baselined in a later authorized step; no test or engine edits are made by this record. | IRR `iips-platform` scratch run shows 29 failures reporting `Unknown engine: sector.telecom`, consistent with fixtures covering only the legacy 10. Re-baselining is a later gate, not part of G1. |

**G1 status: OPEN.** Decision inputs are prepared for B1 and B3, and B2 is narrowed to one PA question. No PA decision is recorded in any repository.

## 2. B1 — Product host

**Recommended disposition: A.** IRR `main` is the product host foundation, scoped to host, transport and shell.

Evidence on IRR `main` (`8877382…`):

- `frontend/server/executive-transport.ts` imports `iips-platform` modules in-process (for example `iips-platform/src/di/Container`) and listens on `EXEC_TRANSPORT_PORT`, default 8787 (line 570).
- `frontend/src/main.tsx` describes the OIDC code flow with PKCE S256 via `core/auth/oidcClient`.
- `frontend/vite.config.ts` line 12 proxies `/api` to `http://localhost:8787`.
- `frontend/src/app/App.tsx` contains 23 route entries (the matrix records six as placeholders).
- `frontend/server/user-portfolio/ipdUserPortfolioAdapter.ts` is an HTTP adapter to a server-configured G24 base URL.
- Scratch results (NON-AUTHORITATIVE): frontend typecheck exit 0; CI exit 0; vitest 66 files passed and 3 skipped; 993 tests passed and 25 skipped (live-Keycloak files).

Evidence on IPD `main` (`4d3e1cd…`):

- No `exports` map and no `prepare` script. No `src/persistence`, `src/portfolio`, `src/server` or `src/auth`. Only `src/pit` (3 files) and `src/d114` (8 files) are present.
- Compiled tests: 542 pass, 0 fail (scratch).
- `docs/FULL_IIPS_BI08_CONVERGENCE_PLAN.md` §22 lists OQ-1 (router choice) and OQ-2 (target shell) as "blocking Phase 1 authorization". Their entries are "Default if unanswered" values, not recorded decisions.
- §18 of the same plan shows a target diagram with `TopBar (tenant/role, NO OIDC)`. This conflicts with the IRR `main` OIDC shell. The conflict is a host-scope item for the PA and is not resolved here.

Limits: B1 decides only the host foundation. It does not decide product definition, provider admission (B2), identity authority, or taxonomy (B3). A host decision does not make IPD-dependent IRR surfaces runnable, because those remain under B2.

## 3. B2 — Domain / provider authority

**Recommended disposition: C — unresolved.** PA to record one narrow decision before G2 (§3.4).

### 3.1 Candidate lines (mirror ancestry and tree inspection; scratch only)

The merge base of the pin line and the G24 line is `246cb944…`, which is 22 commits beyond IPD `main`. Each line adds 4 commits on top of that base. Neither line contains the other.

| Property | IPD `main` `4d3e1cd` | NP-04 pin `2e11fa3b` | G24 candidate `6828155` |
|---|---|---|---|
| Relation to `main` | base | main + 26 (22 shared + 4) | main + 26 (22 shared + 4) |
| Unique commits | — | `d61ff9c` NP-04 common governed persistence capability; `3137426` NP-04 governed persistence implementation; `bd5229d` merge; `2e11fa3b` expose NP-04 persistence package | `0dab1221` merge of PR #6 (IU-6 PIT population); `8c99627` NP04-G24 non-production durable persistence; `d4fdb33` migration 002; `6828155` NP04-G32 governance record (governance only) |
| `package.json` exports | none | `./pit`, `./d114-non-production`, `./persistence` | `./pit`, `./d114-non-production` (no `./persistence`) |
| `src/pit`, `src/d114` | present | identical to G24 | identical to pin |
| `src/persistence` | absent | present | present; differs from pin in 17 files |
| `src/portfolio`, `src/server`, `src/auth` | absent | absent | present (`durable-store.ts`, `http-server.ts`, `oidc-verifier.ts`) |
| Contains IRR pin `2e11fa3b` | no | yes | no |
| Contains G-2 baseline `0dab1221` | no | no | yes |

Test status: the G24 line contains `tests/g24_a…f` (present). Neither line's tests were executed in this record. Both are UNPROVEN as runtime or product evidence.

### 3.2 Authority records (IRR `main`; all branch-scoped)

| Record | Authority as stated | What it binds | Scope limits stated in the record |
|---|---|---|---|
| `docs/integration/GOVERNED-REPORTS-ACCEPTANCE-DECISION.md` | Ramki — Program Authority | Reports persistence: `GovernedArtifactStore` via pin `2e11fa3b…` (export `./persistence`) | "does NOT establish `GovernedArtifactStore` as universal IIPS persistence"; status "ACCEPTED / BRANCH-ONLY"; IRR `main` does not contain the Reports implementation |
| `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md` | Ramki / Program Authority | Architecture direction: "IPD owns the user-portfolio domain and its durable persistence boundary"; IPD baseline `arena/01a0e6d9@0dab1221` | "establishes architecture direction only"; does not authorize implementation, production activity, certification, release, migration, deployment or modification of protected foundations |
| `docs/integration/IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md` (D-2) | Ramki — Program Authority | Identity/tenant domain scope; describes the G24 tip `6828155` as "branch-only" | §13 Durability: PR `PENDING`, merge commit `PENDING` |
| `frontend/package.json` (IRR `main`) | — (dependency pin, not an authority record) | `iips-production-market-data#2e11fa3b…` | Consumer pin only |
| `docs/integration/G2-UI-CONSUMER-IMPLEMENTATION-READINESS-2026-10-08.md` (IRR `main`) | — (readiness record) | IPD baseline `main@4d3e1cd`; G24 pinned upstream `arena/01a0e6d9@6828155` | Consumer reference only |
| `evidence/np04/NP04-GOVERNANCE-AUTHORITY-RECORD.md` (IPD `6828155` only) | "Authority: RAMKI — NP04-G32 …"; "Recording Agent: Arena (recording only)" | Records G22, G24, G29, G30 and G31 decisions; includes `[AI]`-tagged entries | Present only on the G24 line and two arena branches; absent from IPD `main` and from the pin; does not reference `2e11fa3b…`; records the D115 disposition as "GOVERNANCE RECORDING LOCATION NOT ESTABLISHED". **Not treated here as a PA admission of any commit.** |

IRR `main` names two different IPD baselines: `4d3e1cd` (readiness record) and `0dab1221` (G-2 record). These designations conflict and remain unresolved.

### 3.3 Options assessment

- **A — IPD `main` sufficient: rejected.** `main` lacks the `./pit`, `./d114-non-production` and `./persistence` exports that IRR imports, and it lacks every provider source file.
- **B — designate one candidate: not available without retiring a PA-accepted binding.** The pin satisfies the Reports binding but has no durable service (`src/portfolio`, `src/server`, `src/auth` absent). The G24 line has the durable service but lacks the `./persistence` export that the Reports acceptance names. Both acceptances are branch-scoped.
- **C — unresolved: recommended.** Authority is split between two branch-scoped acceptances covering two different capabilities. The record does not support designating one line without an explicit PA choice.

### 3.4 Narrow PA question (B2)

The PA records one of:

1. **Dual capability-scoped admission.** Keep `2e11fa3b…` for the Reports `./persistence` binding only. Admit a named commit for the G24 durable service: either `0dab1221…` (G-2 baseline) or `6828155…` (IRR consumer pin). Each admission needs an IPD-side admission record and a scope that makes no universal claim.
2. **Single designation.** Designate one line and name the binding it retires (Reports or G-2).
3. **Defer.** Keep both provider bindings unresolved. Provider-dependent work stays blocked.

Reconciling the two `src/persistence` implementations into one line is a separate authorized act. It is **not** authorized by this record.

### 3.5 Blocking consequence

Provider-dependent G2 durable-portfolio work, Reports provider runtime, and any change to the IRR pin remain blocked. The agent may not select, merge, cherry-pick or re-pin a provider.

## 4. B3 — Engine taxonomy

**Recommended disposition: A — 13-engine taxonomy**, with the evidence depth shown below. The legacy 10-engine catalogue is historical for convergence purposes.

Evidence:

- `docs/v3.0/existing-capabilities.md` (dated 2026-08-09) §1, "Investment engines (v1.1 — 10 frozen)", lists banking, insurance, capital-markets, healthcare, hospitality, energy, utilities, consumer, industrials and technology.
- `program-v1.1-certification/PROGRAM_v1.1_FINAL_READINESS_CERTIFICATE.md` records "10/10 sector engines released".
- `program-v1.1-certification/PROGRAM_v1.2_FINAL_READINESS_CERTIFICATE.md` records status "PUBLICATION APPROVED — AWAITING PUBLICATION EXECUTION" with a human publication sign-off dated 2026-09-05 (signer not named). It reconciles the Gate 0 scope from 10 engines to a "13-engine current certified scope" and states "historical 10 preserved".
- Tag `program-v1.2.0` exists on origin (tag object `4ec8812…`, commit `5decdca9…`, an ancestor of IRR `main`). The certificate's "not yet tagged" line is therefore superseded. The tag's existence does not by itself establish the release decision.
- IRR `main` sector-engine directories: banking, insurance, capital-markets, consumer, energy, healthcare, hospitality, industrials, technology, utilities, telecom, auto and materials, plus cross-sector (CSIP, a separate track and not counted as an engine).

Per-engine evidence on IRR `main`:

| Engine | In legacy 10 | Engine-level readiness artefact | Evidence depth |
|---|---|---|---|
| banking | yes | none located | program-level only |
| insurance | yes | Reports readiness report only (`iips-platform/reports-insurance/…`) | program-level only |
| capital-markets | yes | Reports readiness report only (`iips-platform/reports-capital-markets/…`) | program-level only |
| healthcare | yes | Reports readiness report only (`iips-platform/reports-healthcare/…`) | program-level only |
| hospitality (IES-010) | yes | readiness certificate and `FREEZE_MANIFEST.json` | engine-level |
| energy (IES-011) | yes | readiness certificate and `FREEZE_MANIFEST.json` | engine-level |
| utilities (IES-012) | yes | readiness certificate and `FREEZE_MANIFEST.json` | engine-level |
| consumer (IES-013) | yes | readiness certificate and `FREEZE_MANIFEST.json` | engine-level |
| industrials (IES-014) | yes | readiness certificate and `FREEZE_MANIFEST.json` | engine-level |
| technology (IES-015) | yes | readiness certificate and `FREEZE_MANIFEST.json` | engine-level |
| telecom (IES-016) | no | `FREEZE_MANIFEST.json` only | manifest-only |
| auto (IES-017) | no | `FREEZE_MANIFEST.json` only | manifest-only |
| materials (IES-020) | no | `FREEZE_MANIFEST.json` only | manifest-only |

Options:

- **A — 13-engine taxonomy: recommended**, with the evidence labels above.
- **B — legacy 10-engine: rejected as current scope.** It is preserved as historical. IRR `iips-platform` scratch run shows 29 failures reporting `Unknown engine: sector.telecom`, consistent with fixtures covering only the legacy 10. Re-baselining is a later gate; no test edits are made here.
- **C — other.** `SECTOR_IT` and `SECTOR_CHEMICALS` appear as identifiers in `src/e2e/engine_revalidation.ts` and `src/e2e/lineage_verifier.ts` on IPD `main`. No engine implementation was located. Not a supported option.

Unresolved for B3: banking has no engine-level readiness artefact located; IES-016/017/020 are manifest-only; the PA should confirm the v1.2 publication-execution state; the signer of the human publication sign-off is not named.

## 5. Unresolved items preserved

1. PA decisions on D115-A, D-2 (§13 Durability `PENDING`) and G-2 implementation scope are not recorded in this review. The G-2 architecture direction is recorded as ACCEPTED on IRR `main`; that acceptance is direction only.
2. The NP04 governance record is a candidate-branch artefact. It contains `[AI]`-tagged entries and records the D115 recording location as not established. It is not on IPD `main`.
3. Identity and tenant: no cross-repo identity mapping, tenant mapping, CompanyId mapping or runtimeCompanyId binding is created by any item here. The Reports acceptance states that Reports identity is not equal to the G24 application-user identity.
4. IPD plan OQ-1 and OQ-2 remain open, with default-if-unanswered values only.
5. The IPD §18 target shell (`NO OIDC` in TopBar) conflicts with the IRR `main` OIDC shell. Resolve in host scope.
6. No Company Identity Authority is designated, and no identity-to-company relationship is inferred.
7. Candidate-line tests (pin and G24) were not executed in this record. The G24 tests are present but UNPROVEN as runtime evidence.
8. Reports fail-closed runtime behaviour, live IdP behaviour and separate-process restart/recovery remain UNPROVEN. The Reports acceptance itself lists them as conditional/unproven.
9. Items from the approved lineage act (Annex 2) are not re-evaluated here and remain as previously recorded.
10. Program v1.2 publication-execution state: the tag exists, but the certificate status line predates it. The PA should confirm.

## 6. Authorization boundary

**Authorized by this record:** documentation of the G1 decision boundary on the session branch. Nothing else.

**Not authorized by this record:**

- any PA decision;
- publication to IRR `main` by the agent;
- provider selection, merge, cherry-pick, or pin change;
- any implementation, dependency change, runtime change, or test or engine code edit (including re-baselining the legacy 10-engine fixtures);
- production authority, live Dhan use, or live OIDC/Keycloak certification;
- production or readiness claims;
- runtime route-protection claims derived from source alone;
- full E2E acceptance claims;
- Company Identity Authority designation, identity mapping, or CompanyId mapping;
- modification of the lineage package under `evidence/integration/lineage-investigation/2026-10-08/` or of any historical record.

## 7. Verification basis

- Remote refs read with `git ls-remote` (IRR `main`, the session branch, tag `program-v1.2.0`).
- IPD ancestry, diffs and tree reads on mirror clones (scratch; no repository modified).
- IRR `main` reads via `git show` and `git grep` on a mirror at `refs/heads/main`.
- Prior scratch logs read (IRR frontend typecheck, CI and vitest; IRR platform test; IPD compiled tests).
- Not executed in this record: candidate-line installs or tests, running services, and any identity provider.
- Absence of a path or commit in one ref is not proof of absence elsewhere. See §5 item 2 for the governance-record location.

## 8. Program Authority decision block (UNSIGNED — NOT RECORDED)

| Decision | Options | PA disposition | Signature |
|---|---|---|---|
| B1 — product host | A / other | [ ] | PENDING |
| B2 — provider authority | (1) dual capability-scoped / (2) single designation / (3) defer | [ ] | PENDING |
| B3 — engine taxonomy | A / B / C | [ ] | PENDING |

## 9. Next gate

- G1 remains **OPEN** until the PA records B1, B2 and B3.
- Then the PA-recorded decisions are published to IRR `main` by the user or an authorized route. Verify that `origin/main` contains this record and its blob.
- G2 may begin only for the portions authorized by the recorded B2 decision, and only after B1 is recorded.
- Provider-independent host scoping may proceed after B1 and B3 are recorded.

## 10. Historical records

This file modifies no historical record. The lineage package under `evidence/integration/lineage-investigation/2026-10-08/` is not touched.
