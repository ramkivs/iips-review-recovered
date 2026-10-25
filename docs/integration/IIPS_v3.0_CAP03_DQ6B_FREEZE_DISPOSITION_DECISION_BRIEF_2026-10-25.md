# IIPS v3.0 CAP-03 — DQ-6b Freeze Disposition Decision Brief

**Record ID:** `IIPS-V3-CAP03-DQ6B-FREEZE-DISPOSITION-DECISION-BRIEF-2026-10-25-01`
**Date:** 2026-10-25
**Repository locus:** IRR — `ramkivs/iips-review-recovered`
**Tracker locus:** §16.121 (`CV-CORR-101`, `CHG-2026-10-25-26`)

## Status: **PREPARED — NOT EFFECTIVE. DQ-6b IS UNRESOLVED PENDING A PROGRAM AUTHORITY (PA) DECISION.**

This brief **renders no decision, answers no DQ tick, and authorizes no freeze.** It is an
evidence-backed preparation submitted to the PA. Every recommendation in §10 is a recommendation
only. Nothing in this document may be cited as approval to freeze, to modernize, to re-pin, to
adopt H-12, or to move any gate.

The paired formal gate/blocking statement is
[`IIPS_v3.0_CAP03_DQ6B_FREEZE_BLOCKER_RECORD_2026-10-25.md`](IIPS_v3.0_CAP03_DQ6B_FREEZE_BLOCKER_RECORD_2026-10-25.md)
(`IIPS-V3-CAP03-DQ6B-FREEZE-BLOCKER-2026-10-25-01`).

---

## 1. The exact question to be decided

> **DQ-6b (as it now presents itself):** May the CAP-03 final QE freeze designate and freeze the
> **qualified split primary/alias baseline** — primary `iips-production-market-data` at
> `8eec74ae27cda09f3c368b9c299895eae41554db` together with the deliberately distinct
> `iips-broker-import` compatibility alias at `70b24f029842a7e9b7f615e4d9df7376fd4ff817`, with
> that alias expressly documented and guarded — **or** must the alias first be modernized
> (eliminated as a raw-source dependency) through an authorized IPD package-surface change or an
> IRR broker-build redesign, so that the frozen baseline is a single unified IPD coordinate?

Two permitted paths are evaluated below: **Path A** (freeze the split baseline) and **Path B**
(require alias modernization first).

### 1.1 Why the question has escalated beyond its original framing

The DQ-6b tick was originally framed in the proposed packet as a routine, off-critical-path tick
with two options:

| Packet option (as framed 2026-10-24) | Present (2026-10-25) status |
|---|---|
| **(i)** Re-pin the alias to the DQ-4 freeze commit and extend the guard test to both dependencies | **Technically impossible as framed.** Re-pinning the alias to the modern freeze commit removes the raw sources the broker build requires and fails `build:broker-import` with `TS18003` (§6.2, evidence `21`). |
| **(ii)** Retire the alias | **Unavailable.** Retirement was conditioned on the Broker Holdings preview surface being retired; it is live, admitted to `main`, and PO-accepted (§7.1). |

Consequently **neither** framed option is presently executable, and the only configuration that is
both executable and fully guarded — preserve the alias as a distinct, documented, guarded
compatibility baseline — is **not among the packet's framed options at all**. DQ-6b has therefore
moved from a routine tick to a genuine freeze-blocking determination: a final QE freeze manifest
cannot be written without stating the alias disposition, and no rendered act supplies it.

---

## 2. Freshly verified authoritative baseline

Verified read-only against both remotes during this pass.

| Repository | Verified remote `main` | Tree | Open PRs | Latest `main` CI |
|---|---|---|---:|---|
| IRR `ramkivs/iips-review-recovered` | `7d2bc71559c223cc788600d8de6a5e3631e8699c` | `6d07f7a278bd53f8955ce3707d4056aa6ae01e49` | 0 | run `40204240649`, **success** |
| IPD `ramkivs/iips-production-market-data` | `8eec74ae27cda09f3c368b9c299895eae41554db` | `4eba29029f8d95cfe483e615a7047426b298ce50` | 0 | run `40196407747`, **success** |

**Candidate / dependency coordinates (IRR `main@7d2bc71…`):**

| Coordinate | Value | IPD tree | Distance to IPD `main` | Ancestor |
|---|---|---|---:|---|
| Primary `iips-production-market-data` | `8eec74ae27cda09f3c368b9c299895eae41554db` | `4eba29029f8d95cfe483e615a7047426b298ce50` | **0 behind** | yes (is `main`) |
| Broker alias `iips-broker-import` | `70b24f029842a7e9b7f615e4d9df7376fd4ff817` | `cc0f0117822850f9046e9a51bd05c1d45f80cd57` | **214 behind** | **yes** |
| Reports `iips-np04-governed-persistence` | `2e11fa3b689d1a3674a5e4ba1f1de9a559e20494` | `7c1d516a43153f9c4e1b09bfa259d16da1704bb0` | separate NP-04 boundary | — |

**Candidate repository commits for a future freeze (NOT designated):**

| Item | Value |
|---|---|
| IRR pre-DQ-4 base | `445f0f5813040ef5641af0f7e0556713629ce67a` / tree `c5be92d1ceef72a94b3b13b4de615fa44ff33654` |
| IRR DQ-4 merge candidate (PR #274) | `907e1fdac76612c9e171774aab079b4862d35ef2` / tree `0ad2ad717cdf63a9b675045e0049e8d5d1e4bac0` |
| IRR current `main` (post PR #275) | `7d2bc71559c223cc788600d8de6a5e3631e8699c` / tree `6d07f7a278bd53f8955ce3707d4056aa6ae01e49` |
| IPD candidate | `8eec74ae27cda09f3c368b9c299895eae41554db` / tree `4eba29029f8d95cfe483e615a7047426b298ce50` |

**Exact object identifiers relied upon:**

| Object | Git blob | Bytes |
|---|---|---:|
| IRR `frontend/package.json` @ `7d2bc71…` | `83058ea202ece8ec60b2674b05b7532ce9a8684b` | 1,888 |
| IRR `frontend/package-lock.json` @ `7d2bc71…` | `744355e903135fc3ebc0f75b0e122bdf1bbc8358` | 128,442 |
| IRR `frontend/tsconfig.broker-import.json` | `a339c9c4def365f0b80295bb32ad74cf2f95a9bd` | 1,005 |
| IRR `frontend/server/broker-import/brokerImportPackageConsumer.test.ts` | `0a1e58de96fae755a4d054e2aa319ab51e2caba3` | 18,716 |
| IRR `frontend/src/api/brokerHoldingsPreview.ts` | `bf079a1b587cebf582c03a7aa2c99b87cf890f73` | 2,395 |
| IRR `frontend/server/reports/reports-persistence-integration.test.ts` | `4f6024f0ca13f4552507b69e8e1d8224188de6d3` | 8,500 |
| IPD `package.json` @ `8eec74ae…` | `51796e63280c1abb368c27bf8811cc6bad46e132` | — |
| IPD `package.json` @ `70b24f02…` | `cc5616d30c0179d08abacbc5a2c253cc27d27bfd` | — |
| IPD `frontend/src/features/portfolio/import/broker-holdings-mapper.ts` @ `70b24f02…` | `6c8ab71dc9230d22d0d3fe9a13e1809371f396e4` | — |
| IPD `frontend/src/features/portfolio/import/broker-holdings-mapper.ts` @ `8eec74ae…` | `297e4a593bb575a5f3f8616788f3aa9e599707a4` | — |
| Effective CAP-03 one-pass PA decision record | `624632bb022c147e7df477a7d77d96793d484035` | 30,623 |
| DQ-1…DQ-7 packet (**PROPOSED — NOT EFFECTIVE**) | `9ccc0b0687f6a3bacad1b12189f4f022d23407c1` | 21,294 |
| DQ-4 pin-reconciliation record | `66784097e6ef8335a88eb8810b633d6b3a4ed781` | 21,082 |

---

## 3. Exhaustive search for existing authority — negative result

The instruction requires searching for existing authority **before** concluding a decision is
missing. The following searches were executed this pass; **all returned no effective DQ-6b
decision.**

| # | Search | Scope | Result |
|---|---|---|---|
| S-1 | Working-tree text search `DQ-6b` / `DQ6B` / `DQ-6` | IRR `main@7d2bc71…`, all `*.md` | Only **mentions** (registrations, receipts, non-grants). No decision record. |
| S-2 | Full-history pickaxe `git log --all -S "DQ-6b"` | IRR, full non-shallow clone (**1,038 commits**) | 9 commits; every one is a *registration/receipt/reconciliation* commit. None renders a DQ-6b determination. |
| S-3 | Added-file census `git log --all --diff-filter=A --name-only` filtered `dq` | IRR, all branches | Only the DQ-4 record, the DQ-1…DQ-7 packet, and the DQ-7a record/evidence. **No DQ-6b record exists.** |
| S-4 | Full-history pickaxe `git log --all -S "DQ-6b"` | IPD, full clone, all branches | 2 commits (IPD PR #87 `89fdc35…`, PR #88 `4b5c65a…`). Both state DQ-6b is **open and untouched**. |
| S-5 | IPD added-file census + `docs/` + `evidence/` scan | IPD `main@8eec74ae…` | Only PA act present is `IIPS-V3-IPD-PR42-CLOSE-WITH-RECORD-PA-DISPOSITION-2026-10-24-01.md`. It answers **DQ-6a** and expressly leaves DQ-6b open. |
| S-6 | `gh search issues` for `DQ-6b` | Both repositories, issues **and** PRs | **Zero** results in either repository. |
| S-7 | Open PR census | IRR **0 open PRs**; IPD **0 open PRs** | No pending vehicle carries a DQ-6b decision. |
| S-8 | Governing effective CAP-03 record | `…ONE_PASS_PA_DECISION_AND_IRR_EXECUTION_2026-10-25.md` | States verbatim: **"DQ-6 and DQ-7 are not answered or altered by this pass."** |

### 3.1 Conclusion on authority

1. The DQ-1…DQ-7 packet (`IIPS-V3-CAP03-PA-DECISION-PACKET-DQ1-DQ7-2026-10-24-01`, blob
   `9ccc0b06…`) is **PROPOSED — NOT EFFECTIVE**. Its own terms state it "renders NOTHING" and its
   DQ-6b answer-sheet row is **blank**.
2. The **effective** CAP-03 one-pass PA decision record explicitly excludes DQ-6 from its scope.
3. The only **effective** act in the DQ-6 family is the DQ-6a disposition in the IPD locus, which
   states: *"DQ-6b remains open and untouched."*

> **Therefore: no effective DQ-6b decision exists in either locus.** DQ-6b is
> **UNRESOLVED — PENDING PA DECISION**. Path A is **not authorized**. Path B is **not
> authorized**. This pass stops at that authority boundary.

---

## 4. Independently verified technical evidence

Each claim below was re-derived this pass against the current remotes, not copied from the prior
record.

### 4.1 Verified: the primary pin uses the modern published package surface — **CONFIRMED**

IPD `package.json` @ `8eec74ae…` (blob `51796e63…`) declares `exports` for exactly
`./portfolio-ui`, `./pit`, `./d114-non-production`, and `files: ["dist/package"]`. The primary pin
is at IPD `main` (0 behind). The primary supplies the governed public package boundary consumed by
IRR's PIT, D114 and portfolio-UI importers.

### 4.2 Verified: the alias is a genuinely distinct baseline — **CONFIRMED**

`frontend/package.json` (blob `83058ea2…`) and `frontend/package-lock.json` (blob `744355e9…`)
carry **two distinct specifiers into the same repository**: primary `#8eec74ae…`, alias
`#70b24f02…`. The alias is 214 commits behind and remains a full-history **ancestor** of IPD
`main`.

### 4.3 Verified: the alias supplies 14 raw source files the modern package cannot — **CONFIRMED**

`frontend/tsconfig.broker-import.json` (blob `a339c9c4…`) sets
`rootDir: node_modules/iips-broker-import` and `include`s raw TypeScript from
`frontend/src/features/portfolio/import/**`, `src/identity/{security_master,mapping_store,quarantine}.ts`
and `src/contracts/{provenance,types}.ts`. Fourteen installed source inputs are required; all
fourteen were confirmed **PRESENT** at `70b24f02…`.

**The decisive structural fact:** IPD's manifest at the alias pin `70b24f02…` (blob `cc5616d3…`)
has **no `exports` and no `files` restriction**, so the full repository — including raw source —
installs. At `8eec74ae…` (blob `51796e63…`) `files: ["dist/package"]` restricts publication to
generated output. **All fourteen required paths are `frontend/src/**` or `src/**`; zero of them
lie under `dist/package/`.** It was additionally confirmed that `dist/package/**` is not committed
to IPD at all (0 blobs); it is generated by the `prepare` script at install time. Therefore
installing a modern IPD commit under the alias **necessarily** yields none of the fourteen inputs.

### 4.4 Verified: advancing both pins fails `build:broker-import` with `TS18003` — **CONFIRMED**

Evidence `21` records the both-pins-at-`8eec74ae…` candidate: `npm install` exited `0`
(evidence `20`), but the focused run failed at
`error TS18003: No inputs were found in config file '…/tsconfig.broker-import.json'` with the exact
`include` glob list. This is not a flake — it is the necessary consequence of §4.3.

**Amplified consequence (new finding this pass):** `build:broker-import` is wired as a `pre`-script
for `predev`, `prebuild`, `pretest`, `pretest:ci` and `pretypecheck` in `frontend/package.json`.
A `TS18003` failure therefore does not degrade one feature — it **fails the entire IRR frontend
dev/build/test/typecheck toolchain.**

### 4.5 Verified: the alias preserves lineage classification that changed — **CONFIRMED**

Between `70b24f02…` (blob `6c8ab71d…`) and `8eec74ae…` (blob `297e4a59…`),
`frontend/src/features/portfolio/import/broker-holdings-mapper.ts` changes
`sourceClassification` from **`REAL`** to **`UNCLASSIFIED`** at three sites (lines 262, 337, 360).
Alias advancement is therefore **not semantically neutral** — it changes live DB-C1 preview
lineage output and would require lineage requalification.

### 4.6 Verified: the new IRR guard protects exactly the stated invariants — **CONFIRMED**

`frontend/server/broker-import/brokerImportPackageConsumer.test.ts` (blob `0a1e58de…`) declares
`EXPECTED_IPD_PIN_SHA = '8eec74ae…'`, `EXPECTED_BROKER_IMPORT_ALIAS_SHA = '70b24f02…'`, and a
14-entry `REQUIRED_BROKER_IMPORT_SOURCE_FILES` list. It asserts the exact pins, requires the alias
to remain **distinct** from the primary, rejects an alias installed as `dist/package`-only, and
verifies all fourteen raw sources exist.

### 4.7 Verified: bilateral harness passed 15/15 — **CONFIRMED**

Evidence `18` (`18-cross-repo-harness-current.txt`) records `SUMMARY | checks=15 pass=15 fail=0`,
`EXIT_CODE=0`, against IPD input `8eec74ae…`/tree `4eba2902…` and current merged IRR adapter
source. The run independently re-confirms DR-4r/DQ-3 Option B: *"populated contribution ledger is
refused under DR-4r/DQ-3"*.

**Scope caveat preserved:** this is Linux, source-level conformance evidence. It is **not** host
QE, native-Windows evidence, operational admission, or production eligibility.

### 4.8 New finding: the alias is load-bearing for a live, PO-accepted preview surface

`frontend/src/api/brokerHoldingsPreview.ts` (blob `bf079a1b…`) imports
`BrokerImportIngressOrchestrator` and `SecurityMaster` **from `../../.cache/broker-import/…`** —
i.e. from the compiled output of `build:broker-import`, which is compiled **only** from the alias
package. That module backs `BrokerHoldingsPreview.tsx` and the `/broker-holdings` route: the
bounded non-production **DB-C1** Broker Holdings Preview, admitted to `main` under
`IIPS-V3-DBC1-PR114-MAIN-ADMISSION-AND-MERGE-DISPOSITION-EFFECTIVE-2026-10-23-01` with
**PO/PR `PRODUCT-OWNER ACCEPTANCE — PASS`** (2026-10-23, PR #114, merge `271ca527…`).

This is the concrete reason the packet's option (ii) ("retire the alias") is unavailable, and it
raises the stakes of Path B: any modernization touches a preview surface that has already been
product-accepted.

---

## 5. Path A — Freeze the qualified split primary/alias baseline

### 5.1 What it means

Freeze for final QE: primary `8eec74ae…` + a **documented, guarded, deliberately distinct**
compatibility alias `70b24f02…`, with the split expressly recorded in the freeze manifest and
protected by the existing guard test.

### 5.2 Evidence in favour

| # | Evidence |
|---|---|
| A-1 | It is the **only** configuration that currently builds, typechecks and tests clean: full `npm run test:ci` **106 files / 1,350 tests**, report guard **0 failed**, both typechecks, `build` and direct strict adapter `tsc` exit `0` (evidence `40`–`46`, `49`–`50`). |
| A-2 | Bilateral DR-2/DQ-1 Option A conformance holds: current-source harness **15/15** (§4.7). |
| A-3 | The split is **already guarded** against silent drift (§4.6): exact SHAs, distinction, raw-source requirement, and all fourteen files. |
| A-4 | It **preserves** current DB-C1 preview lineage semantics (classification `REAL`), avoiding requalification of a PO-accepted surface (§4.5, §4.8). |
| A-5 | It requires **zero IPD mutation** and no cross-repository change — IRR-locus only. |
| A-6 | The alias is a **full-history ancestor** of IPD `main`, not a divergent or forked lineage. |
| A-7 | The proposal itself contemplated the alias being handled "at freeze" with an extended guard, so a freeze-time disposition is within the packet's intent. |

### 5.3 Evidence against / consequences

| # | Consequence |
|---|---|
| A-8 | **No effective act authorizes it.** DQ-6b is unanswered (§3). Freezing now would be an unauthorized act. |
| A-9 | It is **not one of the two options** the packet framed for DQ-6b; it is a third, unframed disposition (§1.1). |
| A-10 | The frozen baseline is **permanently split**: primary at IPD `main`, alias **214 commits behind** — a divergence frozen into the QE baseline by design. |
| A-11 | A **known lineage divergence** is frozen in: `REAL` (alias) vs `UNCLASSIFIED` (modern) for the same mapper (§4.5). Any future reconciliation becomes a re-qualification event. |
| A-12 | The freeze would enshrine a build that **compiles third-party raw source out of `node_modules`** — structurally fragile and dependent on an IPD manifest that has *no* `files` restriction, i.e. on IPD *not* modernizing that surface. |
| A-13 | H-12 would have to enumerate a 56-entry structure spanning **two different IPD commits**, complicating regeneration/validation. |
| A-14 | Bilateral freeze mirroring into the IPD locus becomes harder to express: IPD would be asked to freeze a baseline one part of which is 214 commits in its own past. |

---

## 6. Path B — Require alias modernization first

### 6.1 What it means

Do **not** freeze until the IRR broker build stops depending on raw IPD source installed under the
alias, so the frozen baseline is a **single unified IPD coordinate**.

### 6.2 Why the simple route is closed (verified)

Re-pinning the alias to the modern commit is **not** a viable modernization: it fails `TS18003`
(§4.4) and would break the whole toolchain via the `pre`-script wiring. Modernization therefore
requires a **substantive design change**, not a pin change.

### 6.3 Exact implementation scope

Modernization requires **one** of two mutually exclusive changes, **plus** the common tail in §6.4.

**Option B-1 — IPD package-surface change (cross-repository).**
IPD would publish an admissible broker source or built subpath suitable for IRR's broker build —
e.g. a new governed export (alongside `./portfolio-ui`, `./pit`, `./d114-non-production`) and/or a
`files` entry admitting the fourteen sources or a compiled broker package.
- *Locus:* IPD. **This is an IPD package/contract surface change and cannot be performed from IRR.**
- *Governance:* IPD-side PA authority, IPD implementation, IPD CI, and IPD-side publication.
- *Risk:* alters the published contract surface that the current freeze evidence was qualified
  against; re-opens package-export qualification.

**Option B-2 — IRR broker-build redesign (IRR locus, but still IPD-dependent).**
IRR would stop compiling installed raw IPD sources and instead consume a governed built export.
- *Locus:* IRR — but **only feasible if IPD publishes such an export**, so B-2 in practice depends
  on B-1 unless IRR re-implements or vendors the broker mapper itself.
- *Scope:* retire/replace `frontend/tsconfig.broker-import.json` (blob `a339c9c4…`), the
  `build:broker-import` script and its five `pre`-script wirings, and the
  `../../.cache/broker-import/…` import in `frontend/src/api/brokerHoldingsPreview.ts`
  (blob `bf079a1b…`).
- *Risk:* changes how the DB-C1 preview obtains its mapper — a redesign of a PO-accepted surface.

### 6.4 Common tail required under either option

| # | Required work |
|---|---|
| T-1 | **Lineage requalification** — the `REAL` → `UNCLASSIFIED` change at three sites (§4.5) must be qualified and accepted, since the modern mapper classifies differently from the alias mapper. |
| T-2 | **DB-C1 preview requalification** — re-qualification of `/broker-holdings` against the new source of the mapper (§4.8). |
| T-3 | **Guard-test change** — `brokerImportPackageConsumer.test.ts` (blob `0a1e58de…`) currently *requires* a non-`dist/package` alias and the fourteen raw sources; it must be rewritten, and `frontend/server/reports/reports-persistence-integration.test.ts` (blob `4f6024f0…`) asserts the alias specifier at line 84 and must be updated. |
| T-4 | **Toolchain re-validation** — full `test:ci`, both typechecks, `build`, report guard and strict adapter `tsc` re-run after the redesign. |
| T-5 | **Bilateral harness re-execution** and, where the IPD surface changed, IPD-side re-qualification. |
| T-6 | **H-12 impact** — regeneration/validation against whatever new coordinates result. |

### 6.5 Decision authority required for Path B

Path B is **not executable within this IRR pass**. It requires, in addition to the PA's DQ-6b
answer: (a) IPD-side PA authority and IPD-side implementation if B-1 is chosen; (b) an IRR
implementation-authority act for the broker-build redesign if B-2 is chosen; and (c) a separate
requalification/acceptance act for DB-C1 and lineage under either.

### 6.6 Evidence assessment

| # | Evidence |
|---|---|
| B-1 | Produces a **single unified IPD coordinate** — cleanest freeze manifest, cleanest H-12, cleanest bilateral mirroring. |
| B-2 | **Removes** the structural fragility of compiling third-party raw source from `node_modules` (A-12). |
| B-3 | **Removes** the frozen 214-commit split and the frozen lineage divergence (A-10, A-11). |
| B-4 | Aligns with the packet's original intent that the alias be resolved at or before freeze. |
| B-5 | **Against:** requires cross-repository governed change; cannot be done from IRR. |
| B-6 | **Against:** touches a PO-accepted preview surface (DB-C1) and changes live lineage output. |
| B-7 | **Against:** no such change is authorized, scoped, designed, costed, or implemented today; it would add a new workstream before any QE can execute (QE remains `0/11`). |
| B-8 | **Against:** it re-opens package/contract qualification already closed for the current primary surface. |

---

## 7. Comparison against established CAP-03 requirements

| Criterion | Path A (freeze split) | Path B (modernize first) |
|---|---|---|
| Freeze manifest expressible today | **Yes** (primary + documented distinct alias) | **No** — depends on unbuilt change |
| Requires IPD mutation | **No** | **Yes** (B-1) or yes-in-effect (B-2 needs a published export) |
| Requires new design/implementation act | No | **Yes** |
| Preserves DB-C1 preview lineage (`REAL`) | **Yes** | No — requalification required |
| Preserves PO-accepted DB-C1 surface as-is | **Yes** | **No** |
| Single unified IPD coordinate at freeze | **No** (split by design) | **Yes** |
| H-12 simplicity (32 IPD + 24 IRR = 56) | Harder — spans two IPD commits | Simpler post-change |
| Bilateral IPD-locus freeze mirroring | Harder to express | Cleaner |
| Structural fragility (compile third-party raw source) | **Retained** | **Removed** |
| Already fully validated in IRR | **Yes** (106 files / 1,350 tests; 15/15) | No evidence exists |
| **Authorized by an effective decision today** | **No** | **No** |

**Neither path is authorized today.** The difference is that Path A is *technically executable now*
but *legally unauthorized*, whereas Path B is *unauthorized and not yet technically executable*.

---

## 8. Operational risks and remaining gaps

1. **Authority gap (primary).** No rendered PA act answers DQ-6b. This is the blocker.
2. **Toolchain coupling risk.** Because `build:broker-import` gates `predev`/`prebuild`/`pretest`/
   `pretest:ci`/`pretypecheck`, any wrong move on the alias breaks **all** IRR frontend
   verification, not just the preview. Mitigated today only by the guard test.
3. **Lineage divergence risk.** `REAL` vs `UNCLASSIFIED` is a live behavioral difference, not a
   cosmetic one (§4.5).
4. **Preview-surface risk.** The alias is load-bearing for DB-C1 (§4.8); this was under-appreciated
   when DQ-6b was framed.
5. **H-12.** Not adopted; must be regenerated/validated (32 IPD + 24 IRR = 56) at the exact
   resulting commits, and is harder under a split baseline.
6. **Native-Windows evidence absent.** All evidence in this chain is Linux sandbox evidence.
7. **Gate 4 / CAP-03 sequencing** and host S2 remain unexecuted and unreconciled.
8. **No bilateral IPD-locus freeze mirroring exists.** IRR cannot freeze IPD.
9. **Dependency on IPD's future manifest.** Path A's viability depends on IPD continuing to publish
   no `files` restriction at commit `70b24f02…` — which is immutable (a fixed commit), so the risk
   is limited to IRR's *need* to keep using it, not to the alias changing.

---

## 9. Precise authority required

Per the DQ packet's own effectiveness rules (§9/§10), a DQ-6b decision becomes effective **only**
when **all** of the following exist:

1. A **census-checked act ID** rendered by the **Program Authority (PA)**;
2. **Verbatim determination text** naming the chosen option and every fixed semantic — for DQ-6b
   specifically: the alias disposition, whether the split is admitted permanently or only until
   modernization, and the lineage classification that is authoritative for QE;
3. **Named commits/trees/manifest blobs** at the freeze;
4. **Merge to the governing locus repository's `main`** with green exact-head CI — and, if Path B
   is selected, **also to the IPD locus**, because a package-surface change is an IPD-locus act;
5. **Independent remote read-back**; and
6. A **dated receipt** mirrored into the other repository's tracker.

A recommendation, a draft, a brief, or a PR description is **never** effectiveness. This document
is a brief.

**Minimum PA input required:** a single rendered determination selecting **Path A** or **Path B**,
plus — if Path B — designation of B-1 vs B-2 and the locus in which each act is rendered.

---

## 10. Recommendation (NOT a decision)

> **RECOMMENDATION — clearly distinguished from an approved decision.** This section has **no
> governing force**. It is the preparer's evidence-based advice to the PA and must not be cited as
> authorization.

**Recommended: Path A — freeze the qualified split primary/alias baseline for final QE, with the
compatibility alias expressly documented and guarded,** subject to the PA rendering that
determination.

**Rationale (evidence-weighted):**

1. Path A is the only path that is **technically executable and fully evidenced today** — IRR
   `106 files / 1,350 tests`, harness `15/15`, both typechecks, `build`, report guard and strict
   adapter `tsc` all green (§5.2 A-1, A-2).
2. The split is **not an unmanaged divergence**: it is ancestor-clean, pinned to exact SHAs, and
   protected by a guard asserting both pins, their distinction, the raw-source requirement and all
   fourteen files (§4.6). The packet's own option (i) already contemplated guarding both
   dependencies at freeze.
3. Path B would require a **cross-repository governed change** (IPD package-surface or IRR
   build redesign) plus lineage and DB-C1 requalification (§6.3–6.4) — a new workstream, with no
   design, cost, or authorization today, to be completed before **any** QE can execute (QE `0/11`).
4. Path B's benefit is real but **deferrable**: a later, separately authorized modernization can
   collapse the split. Nothing in Path A forecloses it, and the guard makes the split's state
   continuously visible.
5. Path A **preserves** a PO-accepted product surface (DB-C1) and its current lineage semantics,
   whereas Path B would change live preview output (`REAL` → `UNCLASSIFIED`) and require
   re-acceptance (§4.5, §4.8).

**Recommended accompanying conditions** (for the PA to adopt, reject or amend):

- C-1: The freeze manifest must **expressly** record the alias as a deliberate, guarded
  compatibility baseline — never as an oversight.
- C-2: The guard test must remain in force and be extended (not relaxed) at freeze.
- C-3: A **modernization follow-on tick** should be opened and tracked, so the split is a dated,
  owned state rather than a permanent default.
- C-4: H-12 regeneration/validation must enumerate the two IPD coordinates explicitly.
- C-5: Native-Windows canonical evidence must still be obtained before any production claim.

**If the PA instead selects Path B**, the authorized scope is §6.3 (B-1 or B-2) plus the §6.4 tail,
and the authority required is §6.5 — with the consequence that no DQ-4 freeze occurs until that
work is designed, authorized, implemented, qualified and mirrored into the IPD locus.

---

## 11. Consequences for the governed sequence

| Item | Status after this pass | Consequence of the unresolved DQ-6b |
|---|---|---|
| **DQ-4 final QE freeze** | **NOT ESTABLISHED** | Cannot be established. A freeze manifest cannot state the alias disposition without a rendered DQ-6b act. |
| **Exact final repository pins** | **NOT DESIGNATED** | IRR `907e1fda…`/tree `0ad2ad71…` and IPD `8eec74ae…`/tree `4eba2902…` remain **candidates only**. Designation must follow the disposition. |
| **Exact final npm pins** | Primary `8eec74ae…`; alias `70b24f02…` (split, guarded) | Primary is final-ready; the alias's final status is exactly what DQ-6b decides. **No npm pin changed by this pass.** |
| **H-12** | **NOT ADOPTED** | Regeneration/validation (32 IPD + 24 IRR = 56) must await the designated commits; harder under a split baseline (§5.3 A-13). |
| **Gate 4** | **AUTHORIZED — NOT STARTED** | Unchanged. QE cannot start until the freeze/pins are designated and H-12 is adopted. |
| **QE** | **0 / 11** | Unchanged. No QE credit claimed. |
| **Gate 5** | **NOT INITIATED / NOT ADMITTED** | Unchanged. |
| **Durable-read acceptance / production eligibility** | **NOT ESTABLISHED** | Unchanged. |
| **Host operations** | Not begun; package not regenerated/repackaged/republished | Unchanged. |

---

## 12. Express non-grants

This brief does **not**: render, adopt, infer or substitute for a PA decision; answer DQ-6b or any
other DQ tick; designate any final repository or npm pin; establish the DQ-4 final QE freeze;
authorize alias modernization; re-pin any dependency; modify any IRR build, tsconfig, source or
test; adopt H-12; start Gate 4; grant QE credit; initiate or admit Gate 5; lift any `503` fence;
claim durable-read acceptance or production eligibility; initiate host operations; regenerate or
repackage the host-operations package; or modify **any IPD file, branch, PR, package, manifest,
schema, migration, protocol, route or source**.

**Zero IPD writes were performed.** IPD was read only, via a fresh clone at
`8eec74ae27cda09f3c368b9c299895eae41554db`.

**Preserved in force:** DR-4r/DQ-3 **Option B** (empty contributions pass; non-empty contributions
refuse); the effective CAP-03 one-pass PA decision record (blob `624632bb…`); the DQ-4
pin-reconciliation record (blob `66784097…`) including all failed-candidate evidence; the
DQ-1…DQ-7 packet as **PROPOSED — NOT EFFECTIVE** (blob `9ccc0b06…`); all frozen G2/schema/protocol/
route/fence blobs.

---

## 13. Single next dependency-respecting action

**The Program Authority renders the DQ-6b determination** — Path A (admit the split primary/alias
freeze baseline, documented and guarded) or Path B (require alias modernization first, designating
B-1 or B-2 and its locus) — as a separately rendered act meeting all six effectiveness elements in
§9. Until that act exists, DQ-4 remains unfrozen and no downstream step may proceed.

*End of brief — PREPARED, NOT EFFECTIVE, NOT A DECISION.*
