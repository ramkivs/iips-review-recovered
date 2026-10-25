# IIPS v3.0 CAP-03 — DQ-6b Program Authority Decision: **Path A** (interim, guarded split primary/alias baseline)

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01` (census before this record: **0** occurrences in IRR and IPD) |
| **Record type** | Rendered **Program Authority (PA) decision act** — answers DQ-6b and fixes its semantics |
| **Decision-maker** | Program Authority — Ramki (Ramakrishnan) |
| **Decision date** | `2026-10-25` (UTC) |
| **Decision source** | The PA's explicit one-pass determination issued to the operating session on `2026-10-25`, quoted verbatim at §2 |
| **Authority basis** | The PA's **standing grant of global decision and execution authority** (F-3 record §1.2, blob `c4c9f79…`→`c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`) as interpreted by tracker §16.70 (`CV-CORR-53`), **plus** the current named PA instruction — the two-element basis used by NP-18 and IRR PR #124/#125/#126 |
| **Governing locus** | **IRR** — `ramkivs/iips-review-recovered`. Path A changes **no IPD file**; the IPD locus is read-only to this act and receives a dated receipt mirror as a separate IPD-locus step (§5, element 6) |
| **Tracker locus** | §16.122 (`CV-CORR-102`, `CHG-2026-10-25-27`) |
| **Supersedes (as a decision input, not as a text)** | The DQ-6b row of the DQ-1…DQ-7 packet (`IIPS-V3-CAP03-PA-DECISION-PACKET-DQ1-DQ7-2026-10-24-01`, blob `9ccc0b0687f6a3bacad1b12189f4f022d23407c1`) remains **blank and PROPOSED — NOT EFFECTIVE**; it is answered **here**, not there |
| **Status** | **DECIDED — PATH A.** Effective in the IRR locus on publication with effectiveness elements **1–5** verified. **NOT claimed as fully effective:** element **6** (dated receipt mirrored into the IPD tracker) is outstanding because this session is IRR-bound and may not write to the IPD locus. No consequence that depends on the complete six-element set is claimed (§6) |

> **Rendered determination — DQ-6b: PATH A.**
>
> The CAP-03 final QE freeze may designate the **qualified split primary/alias baseline**: primary
> `iips-production-market-data` at `8eec74ae27cda09f3c368b9c299895eae41554db` **together with** the
> deliberately distinct `iips-broker-import` compatibility alias at
> `70b24f029842a7e9b7f615e4d9df7376fd4ff817`, with the alias expressly documented and guarded.
>
> This is an **interim, guarded configuration — not a permanent architecture decision.**

---

## 1. Authority test — why this record may be rendered, and exactly where the boundary is

The instruction for this pass is conditional: record the determination **if** the standing
authorization permits it; otherwise prepare the exact act and stop at the authority boundary. The
test is therefore stated explicitly rather than assumed.

### 1.1 The grant's own words

> "The single user is the Program Authority and has explicitly granted global decision and execution
> authority for this project. This standing authorization covers the necessary decisions, governance
> records, implementation, testing, corrections, and publication within the established scope. Do not
> request repeated approval for individual decisions or routine implementation steps. The authorization
> does not permit fabricated evidence, weakened safeguards, unrelated scope expansion, or claims of
> success without verification."
> — F-3 record §1.2, transcribed verbatim (blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`)

### 1.2 The five-part test

| # | Question | Answer | Basis |
|---|---|---|---|
| T-1 | Does the grant cover **decisions**, not only implementation? | **Yes** — "necessary **decisions**, governance records, implementation, testing, corrections, and publication" | Grant text |
| T-2 | Is DQ-6b **within the established scope**? | **Yes** — CAP-03's own decision register. The effective CAP-03 one-pass record left DQ-6 **open**, not excluded; the DQ packet poses DQ-6b by name. This is not an unrelated expansion (grant limit 3) | §16.117; packet §8 |
| T-3 | Does a general grant alone **perform** the specific act? | **No** — R-3 (`§16.70.4`): authorization ≠ act ≠ proof. A general grant is not a substitute for a rendered determination | §16.70.4 |
| T-4 | Has the **PA rendered the specific act** with verbatim text and every fixed semantic? | **Yes** — quoted at §2: chosen option, both exact pins, interim status, preservation of lineage classification and guards, and the reason the alias is preserved | PA instruction, 2026-10-25 |
| T-5 | Does recording it weaken any safeguard or claim unverified success? | **No** — no guard is relaxed, no pin moves, no gate moves, no effectiveness element is asserted without verification (§5) | This record |

### 1.3 Determination on authority

**The standing authorization expressly permits this substantive DQ-6b determination, and the PA has
rendered it.** T-1/T-2 establish scope; T-3 is satisfied because T-4 supplies the specific act; T-5
adds nothing new. **No authority boundary is crossed by recording Path A, and none is reached.**

The boundary that *is* reached is a **locus boundary, not an authority boundary**: effectiveness
element 6 requires a dated receipt mirrored into the **IPD** tracker. This session is bound to the
IRR branch and, per the governing CAP-03 record §10, "may not create/push an IPD branch". Element 6
is therefore **outstanding** (§5), with its exact text prepared at
[`IIPS_v3.0_CAP03_DQ6B_IPD_MIRROR_RECEIPT_PREPARED_2026-10-25.md`](IIPS_v3.0_CAP03_DQ6B_IPD_MIRROR_RECEIPT_PREPARED_2026-10-25.md)
(`IIPS-V3-CAP03-DQ6B-IPD-MIRROR-RECEIPT-2026-10-25-01`, **PREPARED — NOT PUBLISHED**).

---

## 2. Verbatim determination text

Recorded exactly as rendered by the PA on `2026-10-25`, without addition, narrowing or
reinterpretation:

> **Path A: permit the split primary/alias baseline as an interim, guarded configuration.**
>
> - Primary IPD pin: `8eec74ae27cda09f3c368b9c299895eae41554db`
> - Broker-import alias: `70b24f029842a7e9b7f615e4d9df7376fd4ff817`
> - Preserve the alias because it supports the live DB-C1 preview and required raw-source build.
> - Record that this is interim, not a permanent architecture decision.
> - Preserve lineage classification and existing compatibility guards.

### 2.1 Fixed semantics (every semantic the determination fixes)

| Semantic | Fixed value |
|---|---|
| Chosen option | **Path A** — admit the split baseline. Path B (require alias modernization first, B-1 or B-2) is **not selected** |
| Primary IPD coordinate | `8eec74ae27cda09f3c368b9c299895eae41554db`, IPD tree `4eba29029f8d95cfe483e615a7047426b298ce50` — is IPD `main`, **0 behind** |
| Broker-import alias coordinate | `70b24f029842a7e9b7f615e4d9df7376fd4ff817`, IPD tree `cc0f0117822850f9046e9a51bd05c1d45f80cd57` — **214 behind**, full-history **ancestor** |
| Alias disposition | **Preserved**, expressly documented, expressly guarded — **never** treated as an oversight |
| Split status | **INTERIM.** Not a permanent architecture decision. A separately authorized modernization stays open as a tracked follow-on |
| Why the alias is preserved | It supplies the raw sources required by `frontend/tsconfig.broker-import.json` and backs the live, PO-accepted **DB-C1** `/broker-holdings` preview (evidence: `V687`/`V688`, re-verified this pass) |
| Lineage classification for QE | **Preserved as-is.** The alias keeps `sourceClassification: 'REAL'` at the three mapper sites; the primary keeps `'UNCLASSIFIED'`. No reclassification, no re-acceptance, no requalification is authorized or performed |
| Compatibility guards | **Preserved in force**, and extended only in the sense of remaining binding at the freeze. Not relaxed, not narrowed, not deleted |
| Alias movement | **None.** The alias is **not** re-pinned, **not** modernized, **not** retired by this act |
| Freeze effect | The final QE freeze **may** designate this split baseline. It is **not** established by this act (§6) |

---

## 3. The conflict: "DQ-6 is off the critical path" versus "DQ-6b blocks the final freeze"

Both statements are on the record. The instruction requires addressing the conflict explicitly rather
than letting either be quietly dropped.

| Statement | Source | Its actual scope |
|---|---|---|
| "**DQ-6/DQ-7 are off the critical path and must never gate it.**" | DQ packet §1, `PROPOSED — NOT EFFECTIVE` (blob `9ccc0b06…`), aligned with §8's heading *"DQ-6 / DQ-7 — Off-critical-path dispositions (separate ticks)"* | A **sequencing assertion premised on the packet's own two framed options** |
| "DQ-6b has therefore escalated … to a **freeze-blocking determination**" | Blocker record `IIPS-V3-CAP03-DQ6B-FREEZE-BLOCKER-2026-10-25-01`; tracker §16.121.5 | A **technical/structural finding** verified against the current remotes |

### 3.1 Resolution

1. **The premise of the packet's sequencing claim failed, so the claim cannot carry forward as
   stated.** The packet placed DQ-6 off the critical path because it assumed both of its own options
   were available at freeze. Neither is:
   - Option **(i)** — re-pin the alias to the freeze commit and guard both — is **technically
     impossible**: `build:broker-import` fails `TS18003` because the modern package publishes only
     `dist/package` and supplies none of the 14 required raw sources (evidence `21`; re-verified
     `V682`/`V683`).
   - Option **(ii)** — retire the alias — is **unavailable**: retirement was conditioned on the
     Broker Holdings preview being retired, and DB-C1 is live, admitted to `main` and PO-accepted
     (`V687`).
2. **The two statements are therefore not contradictory in kind — they differ in what they were
   about.** The packet asserted that DQ-6 need not be *worked* on the critical path (§3.1's premise
   was that a cheap, executable option existed). The finding is that DQ-6b must be *decided* before a
   freeze manifest can be written, because the manifest must state the alias disposition and no
   rendered act supplied one. **A decision requirement is not work; it is a gate.** DQ-6b became
   critical path as a **decision**, never as an implementation workstream.
3. **The packet's own recommendation is withdrawn on evidence, not on preference.** Its recommended
   option (i) cannot execute; its residual consequence ("D-02 stays open as a recorded divergence; no
   silent movement occurs") is preserved — no alias movement has occurred.
4. **DQ-6a remains genuinely off the critical path** and is untouched: it was disposed 2026-10-24
   (`IIPS-V3-IPD-PR42-CLOSE-WITH-RECORD-PA-DISPOSITION-2026-10-24-01`, IPD locus) and carries no
   freeze dependency. The same holds for DQ-7a/DQ-7b/DQ-7c.
5. **Effect of Path A on the critical path, stated prospectively:** DQ-6b is **removed from the
   freeze's critical path** because the question is now answered — *for the interim period only, and
   only while the guards hold*. Under Path B it would have remained on the critical path
   indefinitely, ahead of all QE (currently `0/11`). The modernization follow-on re-enters as a
   tracked, non-blocking item; if the guards are ever relaxed, or the alias is moved without
   authority, the freeze's premise fails and DQ-4.4's STOP-and-re-designate rule applies.

---

## 4. Technical basis re-verified during this pass

Every claim below was re-derived against the current remotes during this pass — none is copied from
the brief.

| ID | Claim | Result | Evidence |
|---|---|---|---|
| `V689` | Remote bases current | IRR `main@ba64b2d5927c2f872560710cf1474c25a5cde0d5` / tree `5e4262f1cd75bf13b76ced5b45058f31434b5dad`, CI run `40210071402` **success**, **0** open PRs. IPD `main@8eec74ae…` / tree `4eba2902…`, CI run `40196407747` **success**, **0** open PRs | `30-freeze-coordinate-blobs.txt`; `gh run list` / `gh pr list` |
| `V690` | Primary pin is IPD `main`, 0 behind; alias is a distinct coordinate, ancestor, 214 behind | **PASS** | `git merge-base --is-ancestor`; `git rev-list --count 70b24f02..8eec74ae` = 214 |
| `V691` | Both pins are carried in IRR's manifest and lockfile simultaneously | **PASS** — `frontend/package.json` blob `83058ea2…`, `frontend/package-lock.json` blob `744355e9…` at `ba64b2d…` | `30-freeze-coordinate-blobs.txt` |
| `V692` | The alias is load-bearing: it supplies the 14 raw sources compiled by `tsconfig.broker-import.json` (blob `a339c9c4…`), whose output backs the live DB-C1 preview (`brokerHoldingsPreview.ts`, blob `bf079a1b…`) | **PASS** — 14/14 present at `70b24f02…` | `20-h12-r5-validation.txt`; §4.1 |
| `V693` | **New finding** — the split is wider than "old commit, same bytes": of the 14 alias raw sources, **10 are byte-identical** at both coordinates and **4 diverge**: `broker-holdings-mapper.ts`, `broker-import-ingress.ts`, `src/identity/security_master.ts`, `src/contracts/types.ts` | **PASS** | `split_baseline` block of the R5 manifest; `20-h12-r5-validation.txt` |
| `V694` | **New finding** — `src/identity/security_master.ts` is simultaneously a **qualified-tree H-12 entry at the primary** (blob `60030e0c…`) and a **required alias raw source** (blob `e260fd90…`). The qualified IRR build therefore contains **two distinct `SecurityMaster` byte-sets** | **PASS** | Recorded explicitly in H-12 R5 `split_baseline.overlap_finding` |
| `V695` | Lineage classification is preserved under the alias: `REAL` at three sites (`6c8ab71d…`) versus `UNCLASSIFIED` at the primary (`297e4a59…`) | **PASS** — the Path A determination preserves `REAL` for the DB-C1 preview | IPD blob comparison |
| `V696` | The guard test protects both pins, their distinction, and the 14 sources | **PASS** — blob `0a1e58de…`; guard suite `6 files / 75 tests` green | `01-irr-broker-import-guard.txt` |
| `V697` | The toolchain is green at the designated IRR coordinate | **PASS** — `106 files / 1,350 tests`, guard `OK — 106 file(s), 1350 test(s), 0 failed`, `typecheck` 0, `typecheck:replay-server` 0, `build` 0, strict adapter `tsc` 0 | `02`–`07` logs |
| `V698` | The IPD coordinate is green on its own terms | **PASS** — `build:tsc` 0; suite `924 tests, 923 pass, 1 skipped, 0 fail`, exit 0 | `10`, `11` logs |
| `V699` | Bilateral conformance holds at the **designated** coordinates (not a pre-merge basis) | **PASS — 15/15, exit 0** — real IRR adapter at `ba64b2d…` against the real IPD provider at `8eec74ae…` over the real AF_UNIX IPC endpoint; DR-4r/DQ-3 Option B still refuses a populated contribution ledger | `12-cross-repo-harness.txt` |

### 4.1 Divergence inventory (the split, stated exactly)

| Alias raw source | Alias blob (`70b24f02…`) | Primary blob (`8eec74ae…`) | State |
|---|---|---|---|
| `frontend/src/features/portfolio/import/broker-format-detector.ts` | `8887457b…` | `8887457b…` | identical |
| `frontend/src/features/portfolio/import/broker-holdings-mapper.ts` | `6c8ab71d…` | `297e4a59…` | **DIVERGENT** (`REAL` → `UNCLASSIFIED` ×3) |
| `frontend/src/features/portfolio/import/broker-import-ingress.ts` | `12824fbb…` | `0742401f…` | **DIVERGENT** |
| `frontend/src/features/portfolio/import/types.ts` | `cac1a58f…` | `cac1a58f…` | identical |
| `…/adapters/csv-parser-helper.ts` | `eb36ce4c…` | `eb36ce4c…` | identical |
| `…/adapters/dhan-holdings-adapter.ts` | `067ce993…` | `067ce993…` | identical |
| `…/adapters/groww-holdings-adapter.ts` | `6f7c97fc…` | `6f7c97fc…` | identical |
| `…/adapters/index.ts` | `ae5422d3…` | `ae5422d3…` | identical |
| `…/adapters/zerodha-holdings-adapter.ts` | `d16bebcd…` | `d16bebcd…` | identical |
| `src/identity/security_master.ts` | `e260fd90…` | `60030e0c…` | **DIVERGENT** (alias lacks `GovernedSourceRevision` / `sourceRevision`) |
| `src/identity/mapping_store.ts` | `eec60c09…` | `eec60c09…` | identical |
| `src/identity/quarantine.ts` | `70c6f658…` | `70c6f658…` | identical |
| `src/contracts/provenance.ts` | `459c77a4…` | `459c77a4…` | identical |
| `src/contracts/types.ts` | `11f86dca…` | `a644c833…` | **DIVERGENT** |

**Why this matters and is not softened:** the split is *not* a single divergent file. Four alias
sources differ from the primary, and one of them is also a qualified-tree entry. That is precisely
why DQ-6b required a rendered act rather than an inference, and why the H-12 regeneration must
enumerate **both** IPD coordinates explicitly rather than assume one.

---

## 5. Effectiveness — the six required elements, each verified or explicitly outstanding

Per the packet §10 / brief §9, a rendered decision is effective only when all six exist. **A
recommendation, a brief, a draft or a PR description is never effectiveness.**

| # | Element | Status | Evidence |
|---|---|---|---|
| 1 | Census-checked act ID rendered by the PA | **SATISFIED** — `IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01`; `0` prior occurrences in either repository | §16.122 census; this record |
| 2 | Verbatim determination text naming the option and every fixed semantic | **SATISFIED** — §2 and §2.1 | §2 |
| 3 | Named commits / trees / manifest blobs at the freeze | **SATISFIED** — §2.1, §4; freeze manifest `IIPS-V3-CAP03-DQ4-QE-FREEZE-MANIFEST-2026-10-25-01`; H-12 R5 manifest SHA-256 `d0be8bef3281ae6a296b8700265fe134b5088dd84b102b77ca8a157c8275cb76` | §4, §6 |
| 4 | Merge to the governing locus `main` (`--merge`) with green exact-head CI | **SATISFIED ON PUBLICATION** — the IRR locus only; Path A requires no IPD merge because it changes no IPD file. Exact coordinates are **not self-embedded**; they are established post-merge and recorded in the tracker publication receipt | tracker §16.122 receipt; see §9 |
| 5 | Independent remote read-back | **SATISFIED ON PUBLICATION** — blob/commit re-read from the remote after merge | tracker §16.122 receipt |
| 6 | A dated receipt mirrored into the **other** repository's tracker (IPD) | **OUTSTANDING** — blocked by locus, not by authority. This session is IRR-bound (governing CAP-03 record §10) and may not create or push an IPD branch. Exact text prepared at `IIPS-V3-CAP03-DQ6B-IPD-MIRROR-RECEIPT-2026-10-25-01`, **PREPARED — NOT PUBLISHED** | `IIPS_v3.0_CAP03_DQ6B_IPD_MIRROR_RECEIPT_PREPARED_2026-10-25.md` |

> **Effectiveness status, stated without rounding:** the determination is **effective in the IRR
> locus** at publication (elements 1–5). It is **not claimed to satisfy the complete six-element
> set**, because element 6 requires an IPD-locus publication this session cannot perform. Nothing in
> §6 that depends on complete effectiveness is asserted.

---

## 6. Consequences — what this act releases, and what it does not

| Item | After this act | Reason |
|---|---|---|
| **DQ-6b** | **ANSWERED — Path A** | §2 |
| Exact final npm pins | **DESIGNATED** — primary `8eec74ae…`, alias `70b24f02…` | Named by the PA determination; DQ-4 §5's precondition (DR-2…DR-4r landed in both loci) is satisfied |
| Exact final QE repository pins | **DESIGNATED** — IPD `8eec74ae…`/tree `4eba2902…`; alias `70b24f02…`/tree `cc0f0117…`; IRR consumer `ba64b2d…`/tree `5e4262f1…`, re-verified byte-identical at the freeze-publication merge | DQ-4 §5 "at that later freeze, record the exact commits and trees; no silent re-pin" |
| Freeze manifest | **PREPARED AND VALIDATED — NOT ESTABLISHED** | §7 |
| **DQ-4 final QE freeze** | **NOT ESTABLISHED** | Two independent reasons, each sufficient: (a) element 6 of this decision is outstanding; (b) the freeze's own required sequence — H-12 adoption act → S2 → one P-1 provisioning execution → S3 preflight — is unexecuted |
| **H-12** | **REGENERATED AND VALIDATED (R5 CANDIDATE) — NOT ADOPTED** | 56/56 present and digest-verified at the designated coordinates; adoption is a separate PA act |
| Gate 4 | **AUTHORIZED — NOT STARTED**; QE `0/11` | Unchanged; subject to its host sequence |
| Gate 5 | **NOT INITIATED / NOT ADMITTED** | Unchanged |
| Durable-read acceptance / production eligibility | **NOT ESTABLISHED** | Unchanged |
| Alias modernization | **NOT AUTHORIZED** — recorded as an open, tracked follow-on | §2.1 |

---

## 7. Freeze status — why "prepared and validated" is not "established"

The freeze manifest
([`IIPS_v3.0_CAP03_DQ4_QE_FREEZE_MANIFEST_2026-10-25.md`](IIPS_v3.0_CAP03_DQ4_QE_FREEZE_MANIFEST_2026-10-25.md),
`IIPS-V3-CAP03-DQ4-QE-FREEZE-MANIFEST-2026-10-25-01`) now states the alias disposition explicitly,
which is what DQ-6b was blocking. It is therefore **writable, prepared and validated**. It is **not
established**, because establishment requires criteria that this act does not satisfy:

1. effectiveness element 6 (§5);
2. a distinct **H-12 adoption** act (the R5 candidate is `NOT ADOPTED`);
3. the host sequence — **S2 → one P-1 provisioning execution → S3 preflight** — which requires the
   designated native-Windows host and cannot be executed or evidenced from this Linux sandbox;
4. native-Windows canonical worktree evidence, absent for this chain.

Nobody is asked to accept a freeze on weaker terms than those. **QE remains `0/11` and no QE credit
is claimed.**

---

## 8. Preserved boundaries and express non-grants

**Preserved in force, unchanged:** DR-4r/DQ-3 **Option B** (empty contributions pass; non-empty
contributions refuse — re-verified `15/15`, `V699`); the effective CAP-03 one-pass PA decision record
(blob `624632bb…`); the DQ-4 pin-reconciliation record (blob `66784097…`) including every failed
candidate; the DQ-1…DQ-7 packet as **PROPOSED — NOT EFFECTIVE** (blob `9ccc0b06…`); the DQ-6a IPD
disposition (blob unchanged in the IPD locus); every frozen G2/schema/protocol/route/fence blob; all
`503` fences; `SESSION_ONLY` / `durable:false`; `WRITE_NOT_AUTHORIZED`; Gate 3 acceptance for bounded
scope; production non-eligibility.

**This act does not:** modernize, re-pin, retire or otherwise move the `iips-broker-import` alias;
reclassify any lineage value; relax or delete any compatibility guard; establish the DQ-4 final QE
freeze; adopt H-12; start Gate 4; grant QE credit; initiate or admit Gate 5; lift any `503` fence;
claim durable-read acceptance or production eligibility; initiate any host operation; regenerate or
republish the host-operations package; or modify **any IPD file, branch, PR, package, manifest,
schema, migration, protocol, route or source**.

**Zero IPD writes were performed.** IPD was accessed read-only through a fresh scratch clone at
`8eec74ae27cda09f3c368b9c299895eae41554db`; the alias was read at
`70b24f029842a7e9b7f615e4d9df7376fd4ff817` from the same clone. `--strict-ssl=false` was used only
for `npm ci` inside `/tmp` because the sandbox CA bundle cannot verify `codeload.github.com`; no
repository file, lockfile, script or pin was altered by it.

**Preserved, not rewritten:** the packet's DQ-6b answer row stays **blank**. This record answers
DQ-6b; it does not retro-tick a proposed packet. The superseded tracker current-state row at §16.121
is preserved verbatim and superseded by a dated pointer, per the established practice.

---

## 9. Single next action

**A separately authorized act establishes the freeze** — after (a) the IPD-locus mirror receipt
(element 6) is published by an IPD-capable session, and (b) H-12 R5 is adopted by its own act and the
host sequence (S2 → one P-1 provisioning execution → S3 preflight) executes on the designated
native-Windows host. Until then the freeze remains **prepared and validated only**, DQ-6b stays
**answered**, and nothing downstream may proceed.

*End of `IIPS-V3-CAP03-DQ6B-PA-DECISION-2026-10-25-01` — DECIDED, PATH A; effective in the IRR locus
at elements 1–5; element 6 outstanding; freeze not established; H-12 not adopted.*
