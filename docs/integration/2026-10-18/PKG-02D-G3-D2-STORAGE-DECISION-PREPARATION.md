# PKG-02D — G3-D2 storage-technology decision preparation (decision-ready record; no option selected)

**Status:** decision-preparation record only. This packet prepares the **G3-D2** Program Authority decision from authoritative evidence. It is **not** a Program Authority decision, **not** a Gate 3 act, and **not** implementation, qualification, admission, release, or production authority. `G3-D2` remains **`DECISION REQUIRED`**; no storage option is selected, recommended, or pre-approved here. **Gate 3 implementation authority remains `NOT GRANTED`.**
**Date:** 2026-10-18 (UTC).
**Prepared by:** Arena Agent Mode (documentation-only pass; no IPD file written, no product code, test, manifest, lockfile, pin, route, listener, CORS setting, configuration, persistence path, or fence touched in either repository).

> **Explicit non-authorization statement.** Nothing in this record selects a storage technology, designates an ownership source, lifts the IRR HTTP `503 owner-context-unavailable` fence, enables durable portfolio writes, promotes IPD `SESSION_ONLY` (`durable: false`) or any off-`main` lineage to admitted capability, changes the accepted G-2 architecture, or grants implementation, qualification, admission, release, or production authority. Consistent with the authoritative Gate 3 request §1 and §15: even a future G3-D2 selection by the Program Authority would not by itself authorize implementation, qualification, admission, or production use — a separate Gate 3 act must still pin the exact then-current IPD `main` SHA, bounded file set, tests, dependencies, restrictions, prerequisites, and acceptance evidence.

---

## 1. Current authoritative state (verified live this pass)

| Repository | Authoritative head (`main`) | How verified | Post-merge CI |
|---|---|---|---|
| **IPD** `ramkivs/iips-production-market-data` | `be32d8c95a86b3f03bd382ccde5b6398efb351c6` (PR #24 merge, 2026-10-18T19:12:01Z; "docs(g3): reconcile open IRR handoff PRs and IPD-owned scope rows (no grant)") | GitHub commits API this pass | run `39157664430` `success`; **0 open IPD PRs** |
| **IRR** `ramkivs/iips-review-recovered` | `a576b9ba05103d66f9537f920737d46af0aefb55` (PR #140 merge, 2026-10-18T20:21:10Z; "docs(tracker): §16.56 CV-CORR-39 — publication reconciled …") | GitHub commits API this pass; local checkout identical | run `39162916261` `success`; open PRs: **#114 only** (browser-only broker preview; unrelated to Gate 3; merge authority separate and ungranted — untouched) |

**Publication chain since the last registered packet (PKG-02C):** IPD PRs #23 (`0158b7a1…`, added request §14) and #24 (`be32d8c9…`, added request §15 — the IRR handoff publication read-back) are documentation-only merges under `evidence/cross-repository/`; the G3-D2 options text (request §4) is unchanged by them. IRR PRs #137 (`f7f5806e…`, PKG-02C G3-D0 registration), #138 (stacked follow-on, merged into #137's branch first), #139 (`6f115779…`, CV-32 disposition), and #140 (`a576b9ba…`, §16.56 publication reconciliation) are all **merged to IRR `main`** — the "merged G3-D0 handoff" the task names. The G3-D0 handoff patch's application identity was verified in PKG-02C §10.1 (byte-identical to the IPD-published patch `e3ab8cda…` on baseline `82431e5…`).

**Fence and boundary state at the current heads (re-verified this pass, not assumed):**

| Boundary | Current value | Verification |
|---|---|---|
| IRR `/api/user-portfolios*` | HTTP `503 owner-context-unavailable`, fail-closed, unconditional at the transport | fence blobs unchanged at IRR `a576b9ba…`: `frontend/server/user-portfolio-transport.ts` `51704c12a467cd2f718a030b5036bc55c9afa73f`; `frontend/server/owner-context-unavailable.ts` `cb8db45d668d28cee7e0a52721001d579a872733` |
| IPD portfolio persistence | `SESSION_ONLY` / `durable: false`; in-memory `PortfolioStore` only | blobs unchanged at IPD `be32d8c9…`: `frontend/src/features/portfolio/portfolioStorePort.ts` `d61f18dfdce12a7f0c4377a3c6d410026d454089`; `portfolio-store.ts` `3bf852b99e300a8dfa71d3b1b04ed0f7b947b4a5` |
| IPD `main` persistence/auth surface | 0 files under `src/persistence`, `src/ipc`, `src/user_portfolio`, `src/auth`, `src/app_identity` (450 paths total) | GitHub recursive tree API at `be32d8c9…` this pass |
| IPD dependencies | `package.json` `dependencies` = `react-router-dom` only; **no SQLite dependency of any kind**; `package-lock.json` present (blob `d3d7b12b6f7c378456c0fd45a82c0416b7d7778b`, 32,128 bytes; CI installs with `npm ci`) | contents API read this pass |
| IRR C8 (loopback/CORS posture) | **NOT MET** — `frontend/server/executive-transport.ts:693` sets `Access-Control-Allow-Origin: *`; `:926` `server.listen(port, …)` with no host (all-interfaces bind); `frontend/vite.config.ts:9` `host: '0.0.0.0'` | source read at IRR `main` this pass |
| Gate 3 implementation authority | **NOT GRANTED** | request §7/§13; PKG-02C §4; tracker §16.53–§16.56 |
| Baselines | 51-row capability matrix and 13-item inventory **unchanged** | tracker §16.56.3 (counts re-stated this pass) |

---

## 2. The exact G3-D2 question and source references

**Authoritative vehicle (single; not duplicated here):** IPD `evidence/cross-repository/IIPS_V3_G3_IMPLEMENTATION_AUTHORITY_REQUEST_2026-10-18.md`, document ID `IIPS-V3-G3-IMPLEMENTATION-AUTHORITY-REQUEST-2026-10-18-01`, blob `ac4b402573b165faa771e451bbce6faeeaa4d2e0` at IPD `main@be32d8c9…` (55,309 bytes; §§1–15). The G3-D2 decision appears in four places: **§4** (options table), **§9** (the decision block the PA answers), **§13.3** (classification), and **§15** (read-back pointer).

**The exact question (request §9, verbatim response line):**

```text
G3-D2 Storage technology (CV-20 (c)) ........................................ A (better-sqlite3) / B (node:sqlite) / C: ... / DEFER
```

**Provenance of the question:** CV-20 reservation (c) — "which **storage technology within IPD ownership** satisfies `G-2` §3" (tracker CV-20 row; CV-20 designation record R-8(c); Gate 3 request prerequisite P8, "OPEN, PA-reserved"). `G-2` §3 (IRR `docs/integration/IIPS_v3.0_G2_DURABLE_USER_PORTFOLIO_ARCHITECTURAL_DECISION.md` §3) establishes thirteen durable-portfolio requirements and states: "The storage technology is intentionally **not prescribed**. The durable storage boundary shall avoid unnecessary coupling between the portfolio domain and any particular persistence technology." Gate E write policy rev 1 (ACCEPTED, G2-D2) is **technology-neutral** (W-11: "Storage technology on an IPD-`main` basis is **not** chosen by this policy"). The choice is therefore reserved to the Program Authority and is exactly the four-token line above.

**The four alternatives, precisely as documented (request §4, verbatim substance):**

| Option | Documented definition | Documented known facts | Documented unknowns to resolve before Gate 4 |
|---|---|---|---|
| **A** | SQLite through a native Node driver (`better-sqlite3`, as in the off-`main` G24 lineage) | Used by the off-`main` lineage (source-reported at preparation). Gives IMMEDIATE transactions and a single-file store. | Adds a native dependency and a Node-ABI pin. Requires a native build on the Windows host. Must be verified there. |
| **B** | SQLite through Node's built-in `node:sqlite` module | No native dependency. The sandbox Node v22.22.3 exposes the module. | Stability and warning status on the pinned Node 22 line, and behaviour on the Windows host, are **not verified** in that pass. |
| **C** | Another embedded engine, or a non-SQL store | Not evaluated. | Would need its own evidence and authority. Not recommended by the request. |
| **DEFER** | (response token in §9) | Preserves every current fence and the fail-closed posture. | The persistence file set, any `package.json`/lockfile line item, and the migration design cannot be fixed in a Gate 3 act (§13.3). |

No option is invented, renamed, or re-scoped here; the prior reports' "Option A: `better-sqlite3` / Option B: `node:sqlite` / Option C: an alternative technology / Defer" framing matches the authoritative text exactly.

---

## 3. Comparison table of the verified alternatives

Evidence classes: **[V]** = independently verified this pass from remote/repository/runtime evidence; **[SR]** = source-reported from a cited published record, not re-executed; **[I]** = engineering inference (reasoned from verified facts, not itself a record); **[U]** = unresolved / missing evidence.

| Dimension | **A — `better-sqlite3` (native driver)** | **B — `node:sqlite` (built-in module)** | **C — alternative engine / non-SQL store** | **DEFER** |
|---|---|---|---|---|
| What it is | SQLite via a native Node addon [V: npm metadata — dependency `node-addon-api`; `node-gyp` build scripts] | SQLite via Node's built-in `node:sqlite` module [V: `lib/sqlite.js` present at nodejs/node tag v22.5.0; doc metadata `added: v22.5.0`] | Any other embedded engine or non-SQL store | No selection |
| Runtime/host compatibility | Node ≥ 22 per package `engines` [V: npm registry metadata for 13.0.3]; native addon must match the host Node ABI [I]; Windows-host behaviour unverified [U] | Present on the current Node 22 line: exposed on sandbox Node v22.22.3, `DatabaseSync` executes, **emits `ExperimentalWarning: SQLite is an experimental feature and might change at any time`** [V: executed this pass, POSIX]; module existed since v22.5.0 and emitted the same warning at that tag [V: nodejs/node source at v22.5.0]; Windows-host behaviour unverified [U] | Unevaluated [U — per the authoritative request] | n/a |
| Dependency & provisioning | Adds a native dependency and a Node-ABI pin [SR: request §4]; new `package.json`/lockfile line item required (request §6.1 "Conditional"); `npm ci` lockfile update [I]; npm 13.0.3 tarball ships `prebuilds/win32-x64.node` and `win32-arm64.node` [V: tarball listing this pass] — a matching prebuilt binary may avoid a source build, but ABI match to the host's exact Node and the `node-gyp` fallback (Python + VS Build Tools) remain host evidence gaps [U] | No native dependency [SR: request §4]; **no dependency or lockfile change** [I from "built-in"]; no package provisioning beyond the pinned Node runtime [I] | Would introduce its own dependency/provisioning surface [I]; evidence and authority required first [SR] | None; status quo (no dependency) persists |
| Persistence & durability properties | SQLite single-file store; IMMEDIATE transactions [SR: request §4; G24 branch source inspection per readiness reconciliation §3.1 verifies a `better-sqlite3` connection, IMMEDIATE transactions, migration-ledger code]; commit-on-acknowledge per Gate E W-11 is implementable on SQLite [I] | Same SQLite engine semantics (single-file, transactional) [I]; commit-on-acknowledge implementable [I]; **experimental-module status** means API/stability may change across the Node 22 line [V: warning observed; U: long-term stability on the pinned line] | Unknown — not evaluated [U] | IPD `main` stays in-memory `SESSION_ONLY` / `durable:false` [V] |
| Migration / operational / recovery | Migration-ledger pattern exists in the G24 reference (source-inspected, off-`main`, reference-only) [SR]; operator-local backup/restore of one file (W-12) [I]; no automated backup claimed (W-12) | Same ledger/backup shape feasible [I]; module's experimental status is an operational risk factor for a pinned deployment [I] | Would need its own migration/ops evidence [U] | n/a |
| Consequences for the bounded Gate 3 file set & tests | `src/persistence/*` + `src/ipc/*` authored on `main`; `package.json`/lockfile line item; tests T-A…T-J per request §6.2; existing `bi07_*` must keep passing (T-I) | Same file set **minus** the dependency line item; same tests T-A…T-J | File set/tests indeterminate until the alternative is evidenced | Persistence file set, dependency line item, and migration design **cannot be fixed** in a Gate 3 act (§13.3) |
| Windows / packaging / qualification evidence | Requires a native build (or matching prebuilt binary) on the Windows host; must be verified there [SR+U]; current CI is POSIX-only (`ubuntu-latest`) [V: IPD `ci.yml`] — so Windows behaviour is outside current CI for **both** A and B | No native build, but Windows-host behaviour and pinned-Node-line stability unverified [SR+U]; same POSIX-only CI gap [V] | All host evidence missing [U] | n/a |

---

## 4. Evidence-backed benefits, costs, risks, prerequisites, and unknowns

**Option A — `better-sqlite3`**
- *Benefits (documented):* IMMEDIATE transactions and a single-file store (request §4); a real, source-inspected implementation exists in the off-`main` G24 lineage (`DurablePortfolioStore`, better-sqlite3 connection, IMMEDIATE transactions, migration-ledger code — readiness reconciliation §3.1) as **reference evidence only**; exact pin `better-sqlite3@13.0.3` (+ `@types/better-sqlite3@9.6.0`) verified present in the G24 lineage's `package.json` [V this pass]; npm 13.0.3 ships win32-x64/arm64 prebuilds [V this pass].
- *Costs (documented/inferred):* a native dependency and a Node-ABI pin (request §4); a `package.json`/lockfile line item in the Gate 3 act (request §6.1); native build or matching prebuilt binary on the Windows host.
- *Risks:* ABI mismatch against the host's exact Node version; source-build toolchain requirement (Python, VS Build Tools) if no prebuilt binary matches [I]; dependency-provisioning and supply-chain surface that does not exist today [I].
- *Prerequisites before Gate 4:* Windows-host verification of install/build and of the store's restart/crash behaviour (request §4 "Must be verified there"; qualification QE-4/QE-7 remain Gate 4 items).
- *Unknowns:* Windows-host build/behaviour; exact Node-ABI match on the deployment host [U].

**Option B — `node:sqlite`**
- *Benefits (documented/verified):* no native dependency (request §4); no dependency or lockfile line item [I]; module exposed on the sandbox's Node v22.22.3 with a working `DatabaseSync` [V this pass]; present since Node v22.5.0 [V: nodejs/node doc metadata].
- *Costs (verified):* the module is **experimental** — Node emits `ExperimentalWarning: SQLite is an experimental feature and might change at any time` on v22.22.3 (observed this pass) and did so from v22.5.0 [V]. The request records the same gap as its Option-B unknown ("stability and warning status on the pinned Node 22 line").
- *Risks:* API/stability change across the Node 22 line under a "pinned" deployment; an experimental warning in CI/logs; unverified Windows-host behaviour [U].
- *Prerequisites before Gate 4:* evidence that the pinned Node 22 line's `node:sqlite` API surface satisfies the store's transactional needs (IMMEDIATE transactions, migration-ledger verification at startup per W-11/W-12) and behaves on the Windows host [U].
- *Unknowns:* stability/warning status resolution on the pinned line; Windows-host behaviour [U].

**Option C — alternative technology**
- *Documented status:* not evaluated; would need its own evidence and authority; **not recommended by the request**. A C answer must identify the technology and supply the evidence the request did not gather [SR].

**DEFER**
- *Documented consequence (§13.3):* the persistence file set, any `package.json`/lockfile line item, and the migration design cannot be fixed in a Gate 3 act; all fences and the fail-closed posture are preserved unchanged.

**Common to every option (preserved regardless):** Gate E W-1 keeps every write refused (`WRITE_NOT_AUTHORIZED`) until its four conditions are separately met; the IRR `503` fence stays until Gate 5; IPD `main` stays `SESSION_ONLY` / `durable:false` until a Gate 3 act is separately issued and executed; Gate E W-11's technology-neutrality means the policy itself supplies no selection.

---

## 5. Facts, inferences, and missing evidence — explicit separation

**Documented/verified facts (this pass unless noted):** the two repository heads and CI states (§1); the G3-D2 question text and the four options (request §§4/9/13.3/15); IPD `main` has no SQLite dependency and no persistence/IPC paths; IRR fence blobs and C8 NOT MET; G24's exact better-sqlite3 pin; npm 13.0.3 metadata and shipped win32 prebuilds; `node:sqlite` present since v22.5.0 and experimental-warning-emitting on v22.22.3 (POSIX); both repositories' CI run on `ubuntu-latest` only; Gate E W-1/W-11/W-12/W-13/W-16 and the accepted consumer contract v1.0.0 are technology-neutral and unchanged.

**Engineering inferences (reasoned, not recorded facts):** Option B needs no lockfile change; Option A's prebuilt Windows binaries reduce but do not eliminate its native-build risk; both options can implement W-11 commit-on-acknowledge and W-12 recovery on SQLite; the single-writer, one-file operator-local model maps to either engine.

**Missing / unresolved evidence (must not be invented):** Windows-host behaviour for **both** A and B (Gate A′/Gate C and Gate 4 qualification are operator acts on the Windows deployment host — **NOT EXECUTED**, not an Arena task); Option A's exact Node-ABI match and build-toolchain path on the Windows host; Option B's stability/warning resolution on the pinned Node 22 line and its Windows behaviour; the deployment host's exact Node version (host preconditions P15 "not recorded"); any evidence for an Option C technology. The 84/84 G24 test count and store-level restart/recovery claims remain **source-reported** (branch tests not re-run; end-to-end process restart not evidenced — readiness reconciliation §3.1). No local Windows checkout, local-browser, or localhost validation is performed or claimed anywhere in this record.

---

## 6. Dependencies: how G3-D2 relates to G3-D3–D7 and later authority (without deciding them)

| Item | Class (request §13.3) | Choices preserved verbatim | Relationship to G3-D2 |
|---|---|---|---|
| **G3-D3** write slice | **[P]** | `3a` (reads + `WRITE_NOT_AUTHORIZED` refusal only; no write code) / `3b` (write code present but disabled by default behind all four W-1 conditions) / `DEFER` | **Directly dependent.** The storage choice determines the dependency and persistence file set the act must name (§13.4); write-slice code (3b) would be authored against the chosen driver's transaction API. W-1 refusal behaviour is common to both slices and preserved under either storage option. D2 does not decide D3. |
| **G3-D4** provisioning-code scope | **[P]**; execution **[T]**/separate | `INCLUDE CODE` / `EXCLUDE` / `DEFER` (execution is always a separate one-time operator Gate A act on the Windows host — APPROVED, NOT EXECUTED; not an Arena task) | **Directly dependent.** Provisioning code creates the A-2 `local_principal_bindings` schema/migration-ledger objects in the chosen store; its file set cannot be fixed until D2 is answered. D2 does not decide D4. |
| **G3-D5** old durable-line disposition | **[A]** | `REFERENCE ONLY` / `OTHER: …` / `DEFER` — the 2026-10-07 line (`470cc698`/`6828155e`) is answerable as REFERENCE ONLY from accepted records; the **PA confirmation line is still outstanding** (CV-20 reservation (a) formally open) | **Independent of D2.** Answerable from existing accepted records (D-1/CV-50 bar it as a base; L-IPC-1 §14 row B excludes off-`main` as a base; G3-D0 makes it reference-only). The Option-A "as in the G24 lineage" phrasing is a design reference, not a re-admission of that lineage; D5's confirmation line is still required and is not supplied by any D2 answer. |
| **G3-D6** G-2 §3 interpretation | **[P]** | `CONFIRM` / `CHANGE: …` / `DEFER` — how G-2 §3's owner/isolation/auditability/durability requirements read in the single-user non-production mechanism beyond owner identity and isolation (P9 OPEN) | **Directly dependent.** Schema/audit obligations for the re-authored store (A-3 audit lines, migration ledger, retention per W-16) are scoped against the chosen engine's capabilities; D6 cannot be finally scoped before D2, and D2 does not interpret G-2 §3. |
| **G3-D7** IRR scope (§5.1) | **[P]** in the IRR capacity + **[T]** (IRR-owned) | `ACCEPT` / `ACCEPT WITH CHANGES: …` / `DEFER` for C8 loopback/CORS remediation, the IPC client adapter, and the IRR contract-version revision | **Independent in substance, dependent in sequence.** The wire contract (v1.0.0, T-1…T-8) is storage-agnostic, and C8's NOT-MET posture is unaffected by any D2 answer; but per §13.4 a conforming end-to-end path needs the PA's IRR-capacity answer too. IPD can neither decide nor execute this scope. |
| Later acts | — | Gate 3 act (pins exact then-current IPD `main` SHA, bounded file set, tests, dependencies, restrictions, prerequisites, acceptance evidence) → operator Windows acts (Gate A′ `P-1`; read-only Gate C `Q1–Q4, Q9–Q11`) → Gate 4 qualification (QE-1…QE-11 incl. QE-4 restart durability, QE-7 crash atomicity) + separate result acceptance → Gate 5 admission + any `503` lift | G3-D2 is the **first** dependency (§13.4) because the persistence file set and dependency line item that the Gate 3 act must name are determined by it. No later act is begun, implied, or authorized by this packet. |

---

## 7. The precise Program Authority decision required

One line per item, each independent (request §9), with the original choices and consequences preserved exactly. **G3-D2 first** (sequencing per §13.4):

```text
G3-D2 Storage technology (CV-20 (c)) ........................................ A (better-sqlite3) / B (node:sqlite) / C: ... / DEFER
```

- **A** selects SQLite through a native Node driver (`better-sqlite3`): accepted documented consequences — a native dependency and Node-ABI pin, a `package.json`/lockfile line item, and a Windows-host build/prebuilt-binary verification that must be evidenced before Gate 4.
- **B** selects SQLite through Node's built-in `node:sqlite`: accepted documented consequences — no native dependency, but the module's experimental/warning status on the pinned Node 22 line (observed on v22.22.3 this pass) and its Windows-host behaviour must be evidenced before Gate 4.
- **C** requires the PA to identify the alternative technology and supply its evidence and authority (the request evaluated none and does not recommend this).
- **DEFER** preserves all fences and leaves the persistence file set, dependency line item, and migration design unfixable in a Gate 3 act.

The same response must also carry the companion lines the request reserves (none answered here): `G3-D3` (`3a`/`3b`/`DEFER`), `G3-D4` (`INCLUDE CODE`/`EXCLUDE`/`DEFER`), `G3-D6` (`CONFIRM`/`CHANGE: …`/`DEFER`), the one-line `G3-D5` confirmation (`REFERENCE ONLY`/`OTHER: …`/`DEFER`), and, in the IRR capacity, `G3-D7` (`ACCEPT`/`ACCEPT WITH CHANGES: …`/`DEFER`). **No selection among these is recorded or implied by this packet.** A response instrument for the whole request exists at request §6.

---

## 8. Next authorized action after the PA decides

Per request §13.4 and §15: the PA's single response (beginning with G3-D2, then G3-D3, G3-D4, G3-D6, with the one-line G3-D5 confirmation and the IRR-capacity G3-D7 answer) is the next dependency. Only after those answers may a **separate Gate 3 act** be rendered that pins the exact then-current IPD `main` SHA (a floating `main` label and the superseded `f678363…`/`0158b7a…`/`9310b1a…` tips are each insufficient), the bounded file set, tests, dependencies, restrictions, prerequisites, and Gate-3-level acceptance evidence (CI typecheck/build/guarded tests with counts — not qualification, per §6.3). Until that act issues: no durable-store or IPC implementation, no off-`main` promotion, no fence lift, and no qualification, admission, or production claim. Windows Gate A′/Gate C execution remains an operator act on the deployment host, not an Arena task.

---

## 9. Verification performed for this packet

| # | Check | Class |
|---|---|---|
| 1 | IPD `main` `be32d8c9…` / IRR `main` `a576b9ba…` heads, PR #24/#140 merge facts, CI runs `39157664430`/`39162916261` success, open-PR states (IPD none; IRR #114 only) | **Verified** (GitHub APIs this pass) |
| 2 | Request blob `ac4b4025…` (55,309 B) at IPD `main`; §§4/9/13.3/13.4/15 read in full; §4 options text unchanged by PRs #23/#24 (both documentation-only, `evidence/cross-repository/`) | **Verified** |
| 3 | Fences: IRR blobs `51704c12…`/`cb8db45d…`; IPD blobs `d61f18df…`/`3bf852b9…`; IPD 0 persistence/IPC/auth paths; IPD `dependencies` = `react-router-dom` only; lockfile present; IRR C8 lines (`executive-transport.ts:693`/`:926`; `vite.config.ts:9`) | **Verified** (tree/contents/source reads this pass) |
| 4 | G24 lineage `6828155e` `package.json` pins `better-sqlite3@13.0.3` + `@types/better-sqlite3@9.6.0`; npm registry metadata (engines `node>=22`, `node-addon-api`, `node-gyp` scripts); npm tarball ships `prebuilds/win32-x64.node`/`win32-arm64.node` | **Verified** (GitHub contents API + registry.npmjs.org this pass); G24 store internals and 84/84 tests remain **source-reported** |
| 5 | `node:sqlite`: present at nodejs/node tag v22.5.0 (`lib/sqlite.js`, `emitExperimentalWarning('SQLite')`); on sandbox Node v22.22.3 `require('node:sqlite')` works flag-free, `DatabaseSync` executes, ExperimentalWarning emitted | **Verified** (nodejs/node contents API + local execution this pass, POSIX only) |
| 6 | IPD CI `ci.yml`: `ubuntu-latest`, `node-version: '22'`, `npm ci`, typecheck/build/guarded tests — POSIX-only, no Windows runner in either repository | **Verified** (workflow read this pass) |
| 7 | G2-D1…G2-D5 acceptance (contract v1.0.0, Gate E rev 1), G3-D0 disposition, G3-D1…D7 classification, and the CV-20 Option A designation as published records | **Source-reported** (cited published records; the PA rendering events themselves are recorded acts, not re-executed) |
| 8 | Windows-host behaviour of either storage option; deployment-host Node version; Option C evidence; G24 end-to-end restart evidence | **Unresolved / not executed** — no Windows, browser, or localhost validation performed or claimed |

**Preserved safety fences (all re-verified in force at the current heads):** IRR `/api/user-portfolios*` fail-closed at HTTP `503 owner-context-unavailable`; IPD `SESSION_ONLY` / `durable:false`; C8 `NOT MET`; Gate 3 implementation authority `NOT GRANTED`; DP-2 Option 2F in force; no off-`main` lineage promoted, merged, cherry-picked, re-pinned, or described as admitted; the 51-row baseline and the 13-item inventory unchanged.

---

*End of PKG-02D. This packet prepares the G3-D2 decision and renders none. `G3-D2` remains **DECISION REQUIRED**; Gate 3 remains **NOT GRANTED**; every fence above stands until the separate acts named in §8 issue.*

---

## 10. Dated addendum — publication record (2026-10-19 UTC, additive; §§1–9 unchanged)

1. **Published to IRR `main`:** PR #141 (`arena/7a57456f-iips-review-recovered` → `main`), merge commit `4ea7707b243506de195608cf17971804dd71d824` (2026-10-19T00:01:33Z), documentation-only — exactly three Markdown files (this packet, the packet-index row, tracker §16.57/`CV-CORR-40`); `frontend/` and every product path untouched (compare `a576b9ba…`→`4ea7707b…` = 3 documentation files). PR-head CI run `39178193044` (`Typecheck · Test · Build`) and post-merge `main` CI run `39178916001` both `success`. This packet's blob on `main`: `d6367a9eca6616a52faa014c7ec8d1adc0b54bd9`.
2. **No decision content changed by publication:** G3-D2 remains **DECISION REQUIRED**; no storage option is selected, recommended, or recorded as approved; Gate 3 implementation authority remains **NOT GRANTED**; all §1 fences stand at the merged head.
3. Registered additively in tracker §16.57 (publication line) and the packet index; zero register movement.
