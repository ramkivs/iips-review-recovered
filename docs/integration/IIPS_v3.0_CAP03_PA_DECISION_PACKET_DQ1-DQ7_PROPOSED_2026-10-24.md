# IIPS v3.0 CAP-03 — Program Authority Decision Packet DQ-1…DQ-7

## Status: **PROPOSED — NOT EFFECTIVE**

- **Date:** 2026-10-24
- **Prepared by:** Track A item A5 of the 2026-10-24 one-pass execution instruction, from the
  dependency-aware reassessment of the same date (Deliverable 4), the CAP-03 prerequisite
  resolution register (`docs/integration/IIPS_v3.0_CAP03_PREREQUISITE_RESOLUTION_AND_DECISION_REGISTER_2026-10-23.md`,
  blob `5af2a264…`, §5.2–§5.5, §6), and the re-derived state registered in tracker §16.95.
- **Registered in:** master tracker §16.97 (`CV-CORR-80`, `CHG-2026-10-24-05`).
- **This packet renders NOTHING.** No determination in it is effective, no question is answered,
  no recommendation is an approval, and no implementation, re-pin, adoption, acceptance,
  qualification, admission, or fence change is authorized by its existence, its publication, or
  its merge. Each question below becomes effective only through a separately rendered Program
  Authority act that is merged to the designated repository's `main` with green CI and
  independently read back (see §9).
- **Identity values are already determined** by the PA's published S1 determination (IPD PR #80,
  determination file blob `b7746b5e…`, effective on publication; registered IRR-side in tracker
  §16.95.2–§16.95.3). This packet neither re-opens them, nor copies, restates, or infers any
  identity value anywhere.

---

## 1. Current-state baseline for every question (re-derived 2026-10-24, full history both repos)

| Fact | Value | Where verified |
|---|---|---|
| IRR `main` | `92b65c59…` (tree `ab1bcf0c…`) at packet preparation; fences byte-identical (`51704c12…`, `cb8db45d…`, `e6b57bb8…`, `98147054…`) | Tracker §16.95.1, §16.96.4 |
| IPD `main` | `1864f908b26322071a866cc3a3dab074faa536fd` (tree `4a28a3b8…`; substantive tip `d8568b0e…`) | Tracker §16.95.1–§16.95.2 |
| Gate A′ successor act | EFFECTIVE (IPD PR #67, blob `528de6ae…`); two residual limbs open: amended §8 H-12 language; final QE pin designation | Tracker §16.95.3 |
| S1 determination | EFFECTIVE ON PUBLICATION (IPD PR #80); values committed in `gateAPrimeValidation.ts`/`gateAPrimeProvisioning.ts`; provisioning **NOT EXECUTED** (no IPC socket/binding/store path provisioned; `dispatch.ts` still `WRITE_NOT_AUTHORIZED`) | Tracker §16.95.2–§16.95.3 |
| Gate 4 act | EFFECTIVE, **AUTHORIZED — NOT STARTED** (blob `66b56fd1…`); H-12 membership amendment (Alternative A) effective (IPD PR #76, blob `21a0f9eb…`): amended §8 = **32 + 1 + 24 = 56** | Tracker §16.95.2–§16.95.3 |
| H-12 | **NOT ADOPTED** (R1 `a169e1f7…`, R2 `9382d4b0…`); R2 stale by 3 post-G3 files + 10/1,140 `dist` entries as measured on the IPD record | Tracker §16.95.3 |
| QE (Gate E QE-1…QE-11) | **0 / 11 executed** (matrix blob `e76d4a3e…`); acceptance not rendered; Gate 5 not initiated | Tracker §16.95.3 |
| DR-2 / DR-3 / DR-4r | **UNRESOLVED** (confirmed unchanged by IPD PR #80 §9); adapter honestly refuses (`V1_TO_G2_ENVELOPE_GAP`) | CAP-03 register §5.2–§5.5 |
| CAP-03 | **BLOCKED** on CAP03-P04…P11 (host evidence, DR decisions, final pins, H-12 adoption, S3 preflight, qualification, acceptance, Gate 5) | Tracker §16.95.3 |
| IRR consumer pins | Main pin `2d9130e7…` **46 behind** IPD `main` (5-file Gate A′/Limb-A source delta; package exports unchanged); `iips-broker-import` alias pin `70b24f02…` **195 behind** (reconstruction D-02) — neither has ever moved silently | Tracker §16.95.4 |
| IPD PR #42 | Open **draft**, `CONFLICTING`, head `afa43090…`/tree `6d939cbd…`, **2 ahead / 79 behind** IPD `main` (full history) | Tracker §16.95.5 |
| G24 lineage | `arena/a2df3b85…` **7 / 503**, reference-only; `470cc698…` reachable only from it; nothing admitted | Tracker §16.95.4 |
| Reports lineage | `arena/01a0f1b3…` **28 / 626** behind IRR `main`; no promotion admitted | Tracker §16.95.5 |

**Critical path (unchanged by this packet):** administration ✓ (§16.95/§16.96) → **DQ-1…DQ-5
(this packet)** → implementation at exact manifests → freeze (DQ-4) → H-12 regeneration at freeze
→ H-12 adoption (separate act) → designated-host provisioning + S3 preflight → QE-1…QE-11 →
result acceptance (separate acts) → Gate 5 (separate act) → bounded implementation of exactly
the admitted scope. DQ-6/DQ-7 are off the critical path and must never gate it.

---

## 2. How to use this packet (separability rules)

1. **Every DQ is separately answerable.** Answering one must not silently answer another;
   DQ-6a/DQ-6b and DQ-7a/7b/7c are separate ticks within their groups.
2. **Order of consequence:** DQ-1, DQ-2, DQ-3 are independent of each other and of the host;
   DQ-4 only acquires concrete commits after DQ-1…DQ-3 implementation merges; DQ-5 is logistics
   under existing acts and pre-authorizes no result.
3. **Veto semantics:** a "No" (or deferral) on any DQ leaves the corresponding register row in
   its current honest state (refusal / absence / scope-out-by-default) and is recorded as a
   dated disposition; it does not roll back anything already effective (Gate A′ successor,
   Gate 4 act, S1 determination, H-12 amendment all stand regardless).
4. **Locus:** DR provider halves and freeze/H-12 sequencing render in the **IPD** locus; adapter
   mapping authorization and IRR re-pin determinations render in the **IRR** locus; each rendered
   act is mirrored into the other repository by dated receipt only.
5. **Nothing in §8 (express non-requests) may be granted by answering any DQ** — those remain
   future, evidence-post-dated, separate acts.

---

## 3. DQ-1 — DR-2 envelope closure (CAP03-P05) — *critical path*

### Question for the PA
Adopt a v1 minor revision (alternative **(a)**) adding the **7 missing fields** with a fixed
per-field source-of-truth, **plus** express IRR mapping authorization for the **3 renames**,
including the `isSaved` INITIAL/save/RESET/tombstone lifecycle rule, the absent-vs-null-vs-error
policy, historical-revision behaviour, and exact producer/adapter/test manifests — **or** select
alternative (b) or (c), **or** decline/defer?

### Evidence (CAP-03 register §5.2, re-verified in source; adapter refusals measured 3/1/3)

| Shape | Missing from v1 (7 across shapes) | Renamed in v1 (3) |
|---|---|---|
| `G2PortfolioSummary` (`portfolio.list`) | `weightSumPercentage`, `provenanceDigest`, `isSaved` | `holdingsCount` → `totalHoldingsCount` |
| `G2PortfolioView` (`portfolio.get`) | `isSaved` | `holdingsCount` → `totalHoldingsCount` |
| `G2RevisionEntry` (`portfolio.revisions`) | `totalMarketValue`, `provenanceDigest`, `holdingsCount` | `committedAt` → `createdAt` |

Current behaviour is honest refusal: the adapter throws `UPSTREAM_UNAVAILABLE`
(contract-envelope violation, `V1_TO_G2_ENVELOPE_GAP`) naming the missing fields and fabricates
nothing. The frozen G2 types live in `userPortfolioContract.ts` (blob `e6b57bb8…`, fence-set).

### Options
- **(a) v1 minor revision** adding the 7 fields provider-side + express IRR adapter-mapping
  authorization for the 3 renames. *(Prior records' recommendation.)*
- **(b) Duplicate G2-named fields provider-side.** *(Rejected in prior records: two names for
  one value.)*
- **(c) Replace the frozen G2 family.** *(Disproportionate: rewrites the frozen consumer
  contract and its fence.)*

### What the rendered act must fix regardless of option
Per-field source-of-truth; **`isSaved` semantics** — candidate framing for PA confirmation, not
a decision: server-derived from committed-revision lifecycle state, `false` for INITIAL-only /
tombstoned portfolios, defined explicitly for RESET; **never** inferred from `revision > 0` or
non-empty holdings; absent-vs-null-vs-error policy; historical-revision behaviour; the permitted
producer/adapter/test manifests, including re-authorizing adapter refusals to become validated
mappings **for exactly the fields decided**.

### Recommendation (for PA review; not a decision)
**Yes — alternative (a)**, with the `isSaved` lifecycle fixed in the act text as above.

### Consequences
- *If (a) rendered:* unblocks I-03 (IPD v1 fields → IRR adapter mapping → re-pin determination)
  and therefore any future admitted CAP-03 read; QE read limbs can be scoped as PASS-capable.
- *If declined/deferred:* every CAP-03 read keeps refusing honestly; QE-1/3/4/5 read-backs can
  only be recorded as limitations; Gate 5 cannot admit any read pair. No other register moves.

---

## 4. DQ-2 — DR-3 durability disposition (CAP03-P06) — *critical path*

### Question for the PA
What is the disposition of `durability` / `durable` on `PortfolioDetail` (`portfolio.get`)
before any result acceptance: **(a)** keep absent with every conformance claim worded
"ten of twelve detail fields"; **(b)** a non-claiming literal; **(c)** defer emission of true
values to the result-acceptance act — or some combination?

### Evidence (CAP-03 register §5.3)
Contract v1 §6 lists both fields; the IPD `PortfolioDetail` omits them and the conformance suite
asserts their absence (visible, not silent). `DurablePortfolioStorePort`'s
`durability:'DURABLE'` is a store-capability type property, **not** per-operation commit
evidence and not a wire value. Gate 3 act §8.4 / W-11 / Gate 4 D-10 (measurement/claim split)
bar any `durable:true` claim before acceptance.

### Recommendation (for PA review; not a decision)
**(c) + (a)** — interim: fields stay absent, every conformance claim is worded
"ten of twelve detail fields", and QE-4 carries the measurement/claim split; final values are
emitted only under the future result-acceptance act. Expressly **not (b) with `durable:false`**:
that would be a false statement about a SQLite-backed store.

### Consequences
- *If (c)+(a) rendered:* bounded implementation and honest QE-4 wording proceed; no durability
  claim exists anywhere until acceptance.
- *If deferred without the interim wording:* silent non-conformance — the interim sentence **is**
  the decision. No implementation that depends on a full-conformance claim may proceed.

---

## 5. DQ-3 — DR-4r contribution scope (CAP03-P07 residual) — *critical path*

### Question for the PA
Is the frozen `G2Contribution` consumer mapping **(a)** authorized now — including the
nullable→required policy (refuse / omit contribution list / scope-out) and the provenance of
`holdingsCount` / `totalMarketValue` — **or (b)** declared **out of the first Gate 5 read
admission's scope**, with (a) as a named follow-up?

### Evidence (CAP-03 register §5.4)
The DR-4 *schema* half is **closed**: migration `004_portfolio_contribution_provenance` is
effective on IPD `main` (act `IIPS-V3-CAP02-U2-PROVENANCE-SCHEMA-ACT-2026-10-23-01`), adding
nullable `file_name`, `source_broker`, `content_digest`, `lineage_digest`, `imported_at`,
`contribution_semantics`; historical rows stay `NULL` by design (never back-filled). The frozen
`G2Contribution` requires *non-null* `sourceBroker`, `fileName`, `contentDigest`,
`lineageDigest`, `importedAt` **plus** `holdingsCount` and `totalMarketValue`, which the IPD
projection does not carry; the IPD act §4 expressly excludes this G2 mapping.

### Recommendation (for PA review; not a decision)
**(b)** — scope contributions OUT of the first Gate 5 read admission: `portfolio.get` is
admitted without contribution mapping, QE-6 measures lineage at store tier, and (a) is recorded
as a named follow-up. *Rationale:* historical rows are `NULL` by design; a non-null mapping now
would either refuse every legacy portfolio or force fabrication — both prohibited.

### Consequences
- *If (b) rendered:* first admission is narrower and every matrix/claim must say so; QE-6 scope
  is store-tier lineage.
- *If (a) rendered instead:* the act must fix the nullable→required policy and both provenance
  fields before any mapping code; refusal behaviour for legacy rows must be specified, not
  discovered.
- *If left open:* `portfolio.get` cannot be mapped honestly and QE-6 scope stays undefined.

---

## 6. DQ-4 — Freeze & H-12 sequencing (CAP03-P08 residual limbs) — *critical path*

### Questions for the PA (four confirmations, separately recordable)
1. **Freeze designation:** confirm that the post-DQ-1…DQ-3 implementation merge commits become
   the designated **final IPD QE pin** and **IRR consumer pin** (Gate 3 acceptance identity
   `d355d904…` retained separately as history, not reused as the QE basis).
2. **H-12 regeneration:** authorize regeneration of H-12 **at that freeze** under amended §8
   (32 preserved files + 1 helper + 24 post-G3 pre-act files = 56; 7 remaining post-G3 files
   separate; 1,140 `dist` entries from a fresh build; deposit set empty), published as
   **CANDIDATE only**.
3. **Adoption order:** reconcile and fix one explicit order among the readings of record
   (Gate 4 act S2a wording vs tracker "S2 + P-1 first" reading) for: H-12 regeneration → S2 →
   P-1 provisioning → H-12 adoption → S3 preflight → QE.
4. **Drift rule:** confirm that any non-documentary drift after freeze = **STOP** for PA
   re-designation (no silent re-pin, ever).

### Evidence
Amended §8 arithmetic verified: 32 + 1 + 24 = 56 (amendment blob `21a0f9eb…`, effective IPD
PR #76). Exactly 12 of the 56 carry stale digests at `1864f908…` (1 helper + 11 post-G3:
10 changed + 1 deleted); the 32 preserved digests match `1864f908…` **32/32**. R2 is a pre-act
lineage and stale (3 + 10/1,140 per the IPD record). Neither pin (46 / 195 behind) may move
except by determination.

### Recommendation (for PA review; not a decision)
Confirm all four; adopt the **stricter order** — regen → S2 → P-1 → adoption → S3 → QE —
unless the PA directs otherwise in the act text.

### Consequences
- *If confirmed:* I-04 (freeze) and the H-12 CANDIDATE regeneration become executable exactly as
  scoped; adoption itself remains a **separate future act** (§8).
- *If not confirmed:* no freeze exists; QE pins cannot be designated; H-12 stays NOT ADOPTED
  with a stale candidate; host work cannot be scheduled against stable bytes.

---

## 7. DQ-5 — Designated-host execution confirmation (CAP03-P04) — *critical path (logistics)*

### Questions for the PA
1. Confirm the designated host remains **`desktop-no0nhtp`** (Gate A′ successor-act basis).
2. Confirm the operator-supplied runtime: **Node `>=22.13.0 <23`**, provided by the operator —
   no agent install/switch is authorized by any existing act. (Historical host Node `v24.14.0`
   is outside the required major and is not preflight evidence.)
3. Confirm the process for designating, **at execution time**, the single non-existent P-1
   store path (the path itself must not be pre-created or guessed here).
4. Consent to the **one** P-1 provisioning execution under successor-act §8, now that the S1
   determination has discharged the value blocker — single-run procedure with abort criteria,
   V-A2-1…V-A2-8 receipt, executed by the operator on the host.

### Evidence & limits
Successor act §8 conditions are the governing checklist; the value/entrypoint limbs are
discharged (§16.95.3), and provisioning has **not** been executed. This confirmation is
logistics under existing acts: it **does not** pre-authorize any QE pass, H-12 adoption,
acceptance, admission, or write. Nothing on the host can be executed or evidenced from a Linux
agent session; `IIPS_G3_IPC_BINDING_PROVISIONED` remains unset until provisioning **and**
admission direction both exist.

### Consequences
- *If confirmed:* the host session can be scheduled once DQ-4's freeze exists; S3 preflight
  (`verifyIpcBindingForRead` / `verifyIpcBinding` against the real binding) becomes runnable.
- *If not confirmed:* CAP03-P04 stays host-gated with no scheduled path; all downstream QE
  remains 0/11 regardless of DQ-1…DQ-4.

---

## 8. DQ-6 / DQ-7 — Off-critical-path dispositions (separate ticks)

### DQ-6a — IPD PR #42 fate
*Evidence:* open draft, `CONFLICTING`, head `afa43090…`/tree `6d939cbd…`, **2 / 79** vs IPD
`main`; `main`'s Gate 3 is accepted and has evolved past it (PRs #41/#45 + CAP-02 + Gate A′
line). Merging #42 as-is is prohibited; PRs #34/#41 history is untouched either way.
*Options:* **(i)** close as historical candidate, preserving head/tree on record; **(ii)**
commission a bounded hardening-port act (endpoint/entrypoint/dispatch delta vs `main`
itemized first) with fresh Windows validation.
*Recommendation:* **(i) close-with-record**, unless the PA specifically wants the hardening port.
*Consequence of inaction:* an indefinitely open conflicting draft misstates the candidate
surface.

### DQ-6b — Dual-pin direction (`iips-broker-import` alias, 195 behind; reconstruction D-02)
*Evidence:* the alias pins the same repository at `70b24f02…`; the Broker Holdings preview it
serves is live (DB-C1), and the consumer guard currently covers only the main pin.
*Options:* **(i)** re-pin the alias to the DQ-4 freeze commit and extend the guard test to both
dependencies (single re-pin event, at freeze, by determination); **(ii)** retire the alias
(only if the preview surface is retired — it is not today).
*Recommendation:* **(i)**, sequenced at freeze to avoid a double re-pin.
*Consequence of inaction:* D-02 stays open as a recorded divergence; no silent movement occurs.

### DQ-7a — Reports (CV-21)
*Options:* **(i)** record Reports **out of the v1 product surface** (or reaffirm the Option C
deferral with a dated line); **(ii)** commission Reports properly — a new product decision
needing its own design act, promotion-branch reconstruction (lineage currently **28 / 626**),
and the F-7 disposition.
*Recommendation:* **(i)**. Commissioning must not ride the durable-chain pass.

### DQ-7b — D115 (CV-43)
*Recommendation:* **retain-unwired** disposition (one dated line; wiring remains barred by D-2).

### DQ-7c — F6 inventory (CV-24)
*Recommendation:* close `F6_INVENTORY_AUTHORIZED` = **No** for non-production scope (the TD-7b
half is already excluded/deferred; no production expansion).

---

## 9. Express non-requests — NOT asked for in this packet, NOT grantable by it

The following remain **future separate acts**, each evidence-post-dated, and are not requested,
pre-approved, or implied by any answer above:

- H-12 **adoption** (DQ-4 asks only about regeneration-as-CANDIDATE and sequencing);
- Gate C / Gate 4 **result acceptance** (requires executed QE evidence that does not exist);
- **Gate 5** initiation or any read/write **admission**;
- **W-1** write enablement or any other write authorization (`WRITE_NOT_AUTHORIZED` stands);
- any **fence lift** or fence modification (503 fences remain until an admitted-scope act);
- any **`durable:true`** claim, production `durable:true`, production eligibility, or TD-7b;
- admission of G24-lineage bytes (reference-only; A-02/G24 closure admits zero off-main bytes);
- reopening any closed / deferred / out-of-scope row (8, 14, 16, 21, 23, 29, 33, 40, 41, 44,
  51; row 34 remains as-is).

## 10. Effectiveness recording (for whichever questions the PA renders)

Each rendered decision is effective only when **all** of the following exist: census-checked act
ID; verbatim determination text naming the chosen option and every fixed semantic; named
commits/trees/manifest blobs at the freeze; merge to the locus repository's `main` (`--merge`,
green exact-head CI); independent remote read-back (GitHub Contents API / fresh-fetch object
IDs); and a dated receipt mirrored into the other repository's tracker. A recommendation, a
draft, a PR description, or this packet is **never** effectiveness. Track B work remains stopped
until the rendered act(s) it depends on satisfy every element above.

## 11. Answer sheet (for PA use — blank = unanswered; nothing below is pre-ticked)

| # | Question | PA answer (option / confirm / decline / defer) | Act ID (when rendered) |
|---|---|---|---|
| DQ-1 | DR-2 envelope closure — (a) / (b) / (c) / decline | | |
| DQ-2 | DR-3 durability — (a) / (b) / (c) / (c)+(a) / decline | | |
| DQ-3 | DR-4r scope — (a) authorize mapping / (b) scope out / decline | | |
| DQ-4.1 | Freeze designation of post-DR merge commits | | |
| DQ-4.2 | H-12 regeneration at freeze (CANDIDATE only) | | |
| DQ-4.3 | Adoption order (state the exact order) | | |
| DQ-4.4 | Post-freeze drift = STOP + re-designation | | |
| DQ-5.1 | Designated host `desktop-no0nhtp` confirmed | | |
| DQ-5.2 | Operator-supplied Node `>=22.13.0 <23` confirmed | | |
| DQ-5.3 | P-1 store-path designation process confirmed | | |
| DQ-5.4 | Consent to the one P-1 execution under §8 | | |
| DQ-6a | IPD PR #42 — close-with-record / commission port / defer | | |
| DQ-6b | Alias pin — re-pin at freeze + guard both / retire / defer | | |
| DQ-7a | Reports CV-21 — out of v1 surface / reaffirm deferral / commission | | |
| DQ-7b | D115 CV-43 — retain-unwired / other | | |
| DQ-7c | F6 CV-24 — `F6_INVENTORY_AUTHORIZED` = No (non-prod) / other | | |

*End of packet — PROPOSED — NOT EFFECTIVE. Prepared 2026-10-24; registered as tracker §16.97
(CV-CORR-80). No identity value is contained in, selected by, or inferable from this document.*
