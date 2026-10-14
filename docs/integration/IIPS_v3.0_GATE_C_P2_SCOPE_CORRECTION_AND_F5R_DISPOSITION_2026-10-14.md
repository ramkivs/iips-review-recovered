# IIPS v3.0 — Gate C / P-2: Program Authority Scope Correction — OIDC/Authentication Qualification Work Out of Scope; F5R Disposition and P-2 Establishment Closure (`GC-P2-SCOPE-CORR-01`)

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-REG12-GATE-C-P2-SCOPE-CORRECTION-F5R-DISPOSITION-2026-10-14-01` |
| Correction ID | `GC-P2-SCOPE-CORR-01` |
| Gate / step | **Gate C (`REG-12` / `G-2` / `F-4` / `AG-5`) — prerequisite P-2**: scope correction and disposition of the last outstanding P-2 item |
| Record type | **Program Authority scope-correction transcription + disposition + closure determination. RENDERS NO AUTHORITY BEYOND THE CORRECTION IT RECORDS; PERFORMS NO P-2, P-4, P-6 OR P-8 OPERATION.** Creates no key, issuer, runtime or database; changes no IPD byte; reclassifies no historical result; invents no new requirement. |
| Deciding authority | **Ramki** — single owner, sole user and Program Authority of the single-user, personal-use, non-production IIPS platform |
| Recording agent | Arena Agent Mode — transcription, read-only verification and publication only, under the attributed standing authorization |
| Date | **2026-10-14** (Asia/Calcutta; session ≈ UTC `2026-10-14T06:1x`) |
| Authoritative repository / ref | `ramkivs/iips-review-recovered` (IRR) / session branch `arena/47fcd3d3-iips-review-recovered`, from `main@a0caad320ac66a84e5146370f8c19d8f36792a13`; PR **#92** |
| Related repository | `ramkivs/iips-production-market-data` (IPD) — **not written; all four reference refs re-verified UNCHANGED** (§5) |
| Governing records | P-2 act `GC-D5`/`GC-D6` (`docs/integration/IIPS_v3.0_GATE_C_P2_EXECUTION_DESIGNATION_ACT_P2-A-D1_2026-10-13.md`, blob `63ef1063…` at `main`); 1A′ specification §5.2 `R-2.1…R-2.10` and §7.3 verification matrix; P-2 execution handoff (Blocks A–G; corrections `GC-P2-HANDOFF-D1-CORR-01`, `GC-P2-HANDOFF-F5-CORR-02`); establishment-evidence reconciliation (§§3–6); tracker §§15.14–15.19 |
| Status | **PA SCOPE CORRECTION RECORDED — OIDC/JWKS/KEY/ISSUER AND GLOBAL-AUTHENTICATION WORK OUT OF SCOPE FOR THIS APPLICATION — F5R CLOSED OUT OF SCOPE (NOT EXECUTED; NOT AN ACTIVE BLOCKER) — NO IN-SCOPE P-2 ACCEPTANCE CONDITION REMAINS OPEN — FOUR-ARTIFACT EVIDENCE DEPOSIT REMAINS APPLICABLE AND UNEXECUTED (OPERATOR-SIDE). P-4 NOT DONE; P-6 NOT GRANTED; P-8 NOT DONE. `/api/user-portfolios*` remains fail-closed at HTTP `503 owner-context-unavailable`.** |

---

## 1. Purpose, scope, non-goals

**Purpose.** Record the Program Authority's scope correction of `2026-10-14`; determine and dispose of the **single outstanding P-2 item** (corrected **F5R**) against it; state the resulting P-2 establishment status and the evidence-deposit status; and update the canonical tracker accordingly.

**In scope.** Transcription of the correction (§2); reassessment of the outstanding P-2 work strictly against its authorized purpose and acceptance criteria, reusing already-verified evidence (§3); the F5R determination (§4); read-only Arena-side verification of the mutable facts asserted (§5); evidence-deposit status (§6); boundaries (§7); publication (§8).

**Non-goals.** No OIDC/JWKS/key/issuer debugging or any authentication-mechanism work; no key generated or handled; no issuer/anchor/JWKS endpoint started or stopped; no runtime started; no database created or written; no credential minted or presented; no P-4 provisioning; no P-6 authority claimed or exercised; no P-8 qualification; no IPD write of any kind; no fence, route, UI, transport or application change; no new governance gate or approval step; no reclassification of any historical result; no reopening of any investigation this correction closes.

---

## 2. The Program Authority's scope correction (transcribed)

On `2026-10-14` (Asia/Calcutta) the Program Authority directed, in the operating session (transcribed in substance; the operating instruction remains authoritative and this record renders nothing it does not record):

1. **Stop OIDC/authentication work on this line.** The current IIPS application is **single-user, personal-use**. **Global authentication, OIDC, Keycloak, RBAC, multi-user/tenant infrastructure and enterprise authentication architecture are OUT OF SCOPE** for this application.
2. **Work-plan correction.** **OIDC/JWKS/key/issuer debugging and global-authentication work are removed from the active P-2 next-step sequence.** They are not to be brought into the current P-2 work, their investigations are not to be reopened, and no new authentication-related tasks are to be created. **An OIDC-related status or a historical test result is not authorization to resume that work.**
3. **F5R disposition.** If the remaining F5R item exists solely to qualify global OIDC/authentication behaviour, it is to be **marked OUT OF SCOPE for this application** and the tracker corrected accordingly; it is not to be kept as an active blocker merely because a tracker entry mentions it. Any portion with a separate, demonstrably in-scope purpose is to be identified alone and proceeded with within existing authority.
4. **Boundaries preserved.** No User Portfolios route/UI enablement; no IPD ref or lineage change; no unrelated resource provisioning; no P-4/P-6/P-8 authority inferred.
5. **Continue the next authorized in-scope work in one pass**, reusing verified evidence, without repeating the completed establishment steps and without inventing new requirements.

This direction is consistent with the recorded product-scope line (**H-18** — single-user, personal-use; no enterprise identity platform, multi-user support, RBAC, relational database or tenant-membership architecture is to be introduced). **The correction concerns the OIDC/authentication qualification work in the P-2 sequence; it does not dispose of P-4, P-6 or P-8, or of the 1A′ prerequisite chain — those remain exactly as recorded and subject to their own express acts (§7).**

---

## 3. Outstanding P-2 work reassessed against its actual authorized purpose and acceptance criteria

**Purpose of P-2 (act `GC-D5`/`GC-D6`; 1A′ specification §5).** Establish, for the single user, the **scoped non-production** trust anchor designated by `P2-A-D1`, and configure the scoped non-production G24 runtime (`IPD_OIDC_*`, `IPD_PORTFOLIO_DB_PATH`) bound to it, so that **establishment verification per P-2 request §7.3** can be evidenced **before** any P-4 provisioning is considered. The acceptance criteria are §7.3(1)–(5). Nothing in P-2 authorizes P-4 provisioning, P-6 implementation, P-8 qualification, any route/UI activation or any IPD write.

Every item below reuses the evidence already recorded at the establishment-evidence reconciliation (§3 transferred results; §4 source-derived classification) and the tracker §15.16. **No establishment step is repeated; no Windows diagnostic is re-run; no requirement is added.**

| P-2 item (as specified) | Evidence already recorded (reused) | Status now |
|---|---|---|
| Establishment steps ③–④ (key generation at the designated custody; JWKS publication; scoped runtime start from pin `6828155e…`) | Reconciliation §3 (operator-transferred): pinned checkout `6828155e…` / tree `eb07ea36…` clean; five tooling hashes matched; key-generation JSON; anchor + runtime startup JSON; state root outside both working trees | **EXECUTED on the designated host** (recorded as transferred; not repeated, not re-verified as a Windows execution) |
| §7.3(1) loader fail-closed | F6 loader matrix 8/8 PASS; D1 exit 65 preflight (`GC-P2-HANDOFF-D1-CORR-01`, Layer 1); D1b Layer 2; D2 `PERSISTENCE_CONFIGURATION_INVALID`, exit 1, no listener | **SATISFIED** |
| §7.3(2) JWKS reachable | F2 loopback JWKS reachable + loopback-only proof | **SATISFIED** |
| §7.3(2) unreachable JWKS ⇒ fail closed, no cached-trust fallback (`R-2.4`) | F5.2 observed `401 OIDC_KEY_UNAVAILABLE`; classified (reconciliation §4) as producible only when the endpoint **responded**; the corrected **F5R** action was defined but **never executed** | **CLOSED — OUT OF SCOPE** (§4) |
| §7.3(3) issuance/verification round-trip | F3 `403 IDENTITY_NOT_MAPPED` (the pre-P-4 fail-closed state); F4 eight negative controls PASS (all 401 with their named codes) | **SATISFIED** |
| §7.3(4) configuration evidence | Act designations recorded (`GC-D5`/`GC-D6`); fence/2F/F-3 blobs re-verified byte-identical (§5) | **SATISFIED** |
| §7.3(5) label discipline | Every artifact carries *non-production, single-user, self-asserted delegation*; no readiness claim anywhere | **APPLIED** |
| F5.2 observation | Preserved UNRESOLVED (not PASS, not FAIL); root cause not established; not reclassified | **PRESERVED AS HISTORY** — no longer an active blocker |
| Trust-statement wording-vs-behaviour deviation (reconciliation §4(2): act §2.2 names `OidcJwksUnavailableError` for "unreachable"; pinned code emits `INTERNAL_ERROR` for connection-refused) | Recorded for PA disposition; the substantive `R-2.4` property holds; no code change was available or authorized (an IPD source change is outside P-2) | **NO FURTHER ACTION ARISES under this correction** (its subject matter is out of scope); preserved exactly as recorded |
| Four-artifact evidence deposit (`p2-establishment-transcript.txt`, `p2-establishment-result.txt`, `p2-pin-provenance.txt`, `p2-anchor-key-public.json`) | Never transferred; the intake folder holds `MANIFEST.md` alone at `main@a0caad3…` (§5) | **REMAINS APPLICABLE — UNEXECUTED (operator-side)** (§6) |

**Determination.** The only genuinely outstanding P-2 item was F5R. With it disposed of below, **no in-scope P-2 acceptance condition remains open**, on the same operator-transferred evidence basis recorded at reconciliation §3/§6.1 — Arena verifies the reconciliation and the artifacts, and does not claim independent verification of the Windows execution itself. **P-2 establishment is therefore closed as COMPLETE FOR IN-SCOPE CRITERIA** (label: non-production, single-user, self-asserted delegation; no runtime, deployment or production readiness is claimed). This closure removes an out-of-scope condition; it does not add, widen or re-derive any requirement, and it unlocks nothing: **P-4 still requires its own sequential express act; P-6 is not granted; P-8 is not done.**

---

## 4. F5R determination — **CLOSED, OUT OF SCOPE**

**What F5R is** (handoff §6.6 as corrected by `GC-P2-HANDOFF-F5-CORR-02`). Stop the OIDC trust anchor; verify port 8421 is genuinely unreachable; mint a token whose header names an unknown `kid`; observe the scoped runtime's response; acceptance was **`500 INTERNAL_ERROR`** (fail-closed, no cached-trust fallback). Its sole governing purpose is **P-2 request §7.3(2), second half** (`R-2.4`: "unreachable JWKS ⇒ verification fails closed, no cached-trust fallback"). Its execution requires operating the anchor and exercising the OIDC verifier's `kid`-based key resolution.

**Determination.** F5R's entire subject matter is the behaviour of the **OIDC/JWKS key-resolution and verification path** of the scoped runtime, observed by operating the OIDC anchor itself. It exists **solely to qualify OIDC/authentication behaviour** — it is precisely the class ("OIDC/JWKS/key/issuer debugging") that the Program Authority's correction removes from the active P-2 next-step sequence for this single-user application.

**No portion of F5R has a separate, demonstrably in-scope purpose:**

- The substantive outcome it would evidence — *the runtime denies a credential it cannot verify* — is already covered by the **executed and recorded** §7.3(3) negative controls (F4a–F4h: eight expected 401 denials with their named codes, PASS as transferred). F5R would add no new denial property.
- The specific property it would evidence — *no cached-trust fallback when the JWKS endpoint is unreachable* — is a property **of the OIDC trust relationship itself** and has no meaning outside it.
- No application change, qualification decision, admission, capability or boundary depends on it. No code change follows from it (none was available or authorized; the pinned IPD source is untouched), and §7.3(4)'s blob-invariance evidence is unaffected.

**Disposition.** **F5R is CLOSED — OUT OF SCOPE for this application. It is NOT to be executed; no future execution is authorized.** Accordingly:

1. F5R is **not an active blocker** and does not gate anything; it is not carried in the tracker as an outstanding action.
2. **P-2 request §7.3(2)'s unreachable-JWKS clause is not an acceptance condition for this application**; no `p2-establishment-f5r.txt` artifact will be produced.
3. The **historical F5.2 observation remains preserved exactly as observed** (UNRESOLVED, not reclassified, not re-investigated here).
4. The corrected F5R text in handoff §6.6 is preserved as history with a scope-correction banner directing that it not be executed.
5. No operation on the anchor, key material, runtime or configuration is directed or performed by this disposition; the established state is unaffected and the act (`GC-D5`/`GC-D6`) remains as recorded, including its reversibility provision.

---

## 5. Verification performed (Arena, read-only, this session) — and not performed

**Performed (read-only; mutable facts only — completed S0–S5 work and the establishment steps are not repeated):**

- **IRR `main`** = `a0caad320ac66a84e5146370f8c19d8f36792a13` — merge of **PR #91** (`2026-10-14T05:57:51Z`, merged by `ramkivs`; parents `33bbb0f…` and `6cff5994…`), carrying the six recorded paths (tracker; reconciliation record; execution handoff; F-1/F-2/F-3 PA decision closure note; F-1/F-2/F-3 reconciliation record; evidence intake manifest). **No open PRs** at the start of this session.
- **Act present at `main`**: `docs/integration/IIPS_v3.0_GATE_C_P2_EXECUTION_DESIGNATION_ACT_P2-A-D1_2026-10-13.md` blob **`63ef1063…`**; `GC-D6` correction record present in the tracker; `GC-D6` closed at `main@33bbb0f…` (PR #90).
- **Fence blobs at `main`** equal their recorded values: `reports-transport.ts` `98147054…`, `user-portfolio-transport.ts` `51704c12…`, `owner-context-unavailable.ts` `cb8db45d…`.
- **Tested 2F blobs at `main`** equal their recorded values and the tested tree: `userPortfolioContract.ts` `0dec72eb…`, `translationBoundary.ts` `93f602fd…`, `userPortfolioBoundary.ts` `b8024c6b…`, `userPortfolioPort.ts` `ba0001e8…`.
- **F-3 carrier / resolver at `main`**: `a576e5af…` / `9738e9b3…` — unchanged.
- **IPD refs (live)** — all **UNCHANGED**: `main` `4d3e1cdc…`; `np04-governed-persistence-windows` `2e11fa3b…`; G24 `arena/01a0e6d9…` and `arena/01a0f308…` both `6828155e…`; act branch `arena/01a0f839…` `12c480b5…`.
- **Evidence-deposit absence confirmed**: `evidence/integration/gate-c-p2-establishment-2026-10-14/` contains **`MANIFEST.md` alone** (blob `2d29ce19…`) at `main`; no artifact of the four has been transferred by any actor.
- The authoritative P-2 records were re-read at their bytes: the act (`GC-D5`; `GC-D6` correction), the 1A′ specification §5.2/§7.3, the P-2 request §§7.2–7.4, the handoff (§6.6, §7, §10), the reconciliation record (§§3–6), and tracker §§15.14–15.18.

**Not performed (and none authorized).** No OIDC/JWKS/key/issuer debugging; no key generated, read, copied, printed or hashed; no anchor, JWKS endpoint or runtime started or stopped; no token minted; no database created, opened or written; no Windows diagnostic re-run; no establishment step repeated; no P-4 provisioning; no P-6 implementation; no P-8 qualification; no IPD write of any kind. **Nothing in this record is a claim that any of the above occurred.**

---

## 6. Evidence-deposit status (the four artifacts)

**Remains applicable.** The deposit is the durability action for the executed establishment (reconciliation §5.5–§5.6; the handed-over activity closes on the §5.6 transfer), it contains no secret material (public fields only; Manifest §1–§2), and nothing in the scope correction removes its purpose. Its file set is **unchanged and complete at four artifacts**; the F5R output file contemplated at reconciliation §6.3 (`p2-establishment-f5r.txt`) is **moot and will not be produced** (F5R is not executed).

**Not executed.** As verified in §5, the four artifacts were never transferred: the destination folder holds `MANIFEST.md` alone at `main@a0caad3…`. The artifacts exist only on the operator's designated non-production host (the raw transcript, result summary, pin-provenance output and public key JSON); **Arena has no access to that host, holds none of the four files, and fabricates nothing.** No deposit is claimed, and none occurred.

**Transport (unchanged rule; stated so the deposit stays unambiguous).** One commit, the four artifacts only, pushed to the **session branch current at deposit time** (`arena/47fcd3d3-iips-review-recovered` today; if that branch has already been merged, the deposit commit is carried by a fresh PR from the session branch, and never pushed directly to `main`), after `git fetch` + `git pull --ff-only`; `git status --porcelain` must list only the four artifact paths; commit `chore(evidence): deposit P-2 establishment evidence (P2-A-D1) with F5.2 unresolved`; push; `git ls-remote` verify. Integrity is carried by **ordinary Git verification** (remote blob SHA = local `git hash-object`), per Manifest §3 — no archives and no checksum files.

---

## 7. What this record does and does not do (boundaries preserved)

- **Does:** record the PA's scope correction; close F5R as out of scope with its basis; close P-2 establishment for in-scope criteria on the already-recorded evidence; fix the deposit status; update the tracker and annotate the handoff/reconciliation/manifest so no actor executes the removed step.
- **Does not:** render any authority beyond the correction recorded; create or operate any key, issuer, anchor, runtime or database; write IPD; change any application byte, fence, transport, route, UI, pin, lockfile or schema; enable or admit anything; repeat any completed step; reclassify F5.2; reopen any investigation; dispose of P-4, P-6, P-8 or the 1A′ chain (each requires its own express act, unchanged); or claim execution, publication or verification that did not occur.
- **Invariants (verified at §5):** `/api/user-portfolios*` fail-closed at HTTP `503 owner-context-unavailable`; `/api/reports*` unchanged; Option 2F refusal unchanged (2F blobs byte-identical to tested tree `8bb5bdae…`); F-3 remains partition semantics, not a principal/credential/membership; no caller-controlled canonical identity; no IPD write and no protected-ref change; NP-04 and G24 lineages unmerged; no route/UI activation; no consumer admission; Gate A OPEN; Gate B Option C; R3 OPEN; R4-B CLOSED; no Company Identity Authority; `D115-A` ineffective; `P2`/`P3` OPEN. **No runtime, deployment or production readiness is claimed anywhere.**

---

## 8. Publication and effectiveness

Additive documentation-only change on session branch **`arena/47fcd3d3-iips-review-recovered`** (from `main@a0caad3…`): this record (new), the canonical tracker (header `Last Updated`, §2 `REG-12` row update, new §15.19), the handoff §6.6 scope-correction banner (`GC-P2-SCOPE-CORR-01`), a supersession pointer at reconciliation §6.3, and the evidence manifest's §5 status update — **no code, test, pin, lockfile, schema, fence, transport, route, UI, tooling or runtime change; no IPD write**. Published through a pull request from the session branch. Consistent with the program rule, effectiveness follows durable `main` publication + independent remote verification, and publication coordinates are recorded post-merge, never self-embedded.

*Status: **`PA SCOPE CORRECTION RECORDED — OIDC/JWKS/KEY/ISSUER AND GLOBAL-AUTHENTICATION WORK OUT OF SCOPE FOR THIS APPLICATION — F5R CLOSED OUT OF SCOPE (NOT EXECUTED; NOT AN ACTIVE BLOCKER) — NO IN-SCOPE P-2 ACCEPTANCE CONDITION REMAINS OPEN — FOUR-ARTIFACT EVIDENCE DEPOSIT REMAINS APPLICABLE AND UNEXECUTED (OPERATOR-SIDE); F5.2 PRESERVED AS HISTORY, NOT RECLASSIFIED — P-4 NOT DONE, P-6 NOT GRANTED, P-8 NOT DONE; /api/user-portfolios* REMAINS FAIL-CLOSED AT HTTP 503 owner-context-unavailable`.***
