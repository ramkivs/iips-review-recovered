# D7-TIER3-INDEPENDENCE — RAJI ADJUDICATION DETERMINATION (OPTION-1 CLOSURE STANDARD)

- **Record ID:** `D7-TIER3-INDEPENDENCE-RAJI-ADJUDICATION-DETERMINATION-2026-09-26`
- **Title:** D7 — Tier-3 Independence: RAJI Adjudication of the SAI Verification Evidence against the D-1 OPTION 1 (Organizational / External Independence) Closure Standard
- **Class:** `GATE` / `ADJUDICATION DETERMINATION`
- **Status:** `RECORDED — DETERMINATION ISSUED: D7-TIER3-INDEPENDENCE: NOT SATISFIED — REMAINS OPEN / NEGATIVE. NO INDEPENDENCE ESTABLISHED. D7 IS NOT CLOSED. NO PRODUCT MUTATION. NO RECORD AMENDED.`
- **Date/time:** 2026-09-26 (UTC)
- **Authority relationship:** exercised under `D7-TIER3-INDEPENDENCE-CLOSURE-AUTHORITY-2026-09-26` (authority commit `425c7bb62660fb1f4452d85b1e47ca0b143da938`) — §6 D-2 (RAJI, adjudicator), §10 (adjudicator authorization/prohibitions and separation rule), §11 (exhaustive allowed determinations) and §12 step 4 (RAJI adjudication gate). Adjudicates **only** the durably recorded SAI verification evidence; it does not re-run, repeat, extend or substitute for that verification.
- **Scope:** a single determination — whether the existing SAI evidence establishes `D7-TIER3-INDEPENDENCE` under D-1 OPTION 1 for IES-016, IES-017 and IES-020. **Not in scope and not done:** re-verification; any amendment to the authority act or the SAI record; closure of D7 or of any prerequisite; product mutation; any change to `D7-TIER3-PARITY`, the A1 records, the IVM, D14/D15/D25/D36 or E2E-018; engagement or designation of any third party, verifier or adjudicator; any movement of the authoritative governance branch.
- **Provenance:** every fact relied upon was re-derived read-only in this gate from `ramkivs/iips-review-recovered` at the pinned baseline (§2), or is quoted from the two pinned source records (§3, §4). No fact is inherited from a transcript, and no out-of-repository source was consulted.
- **Supersession / revision relationship:** none. New record. Amends no dated record (authority §7(5)).

---

```text
ADJUDICATOR:
RAJI  (D-2)

EVIDENCE ADJUDICATED:
SAI VERIFICATION EVIDENCE RECORD — 21d64c647db8ba54a73dbf114221ee0edb30637c2d5150a9808478d4657e5e2c

STANDARD APPLIED:
D-1 OPTION 1 — ORGANIZATIONAL / EXTERNAL INDEPENDENCE (authority §6, §7; un-narrowed)

DETERMINATION:
D7-TIER3-INDEPENDENCE: NOT SATISFIED — REMAINS OPEN / NEGATIVE

D7-TIER3-PARITY:
UNCHANGED — SATISFIED WITH RECORDED QUALIFICATIONS

D7 STATE AFTER THIS RECORD:
OPEN / NEGATIVE — DETERMINATION ISSUED, AUTHORITATIVE-BRANCH RECORDING PENDING (§15)
```

---

## 1. Adjudicator eligibility and role separation (authority §10 — gate applied before any adjudication)

Authority §10 requires that the adjudicator **not** have authored the verification under adjudication, that RAJI not adjudicate RAJI's own work, and that any prior authoring relationship touching the adjudicated subject be disclosed. The following was established **before** any determination was made; had it failed, this gate would have stopped and produced no record.

### 1.1 Non-authorship of the SAI record — ESTABLISHED

| Test | Evidence | Result |
|---|---|---|
| Commit authorship of the SAI record | `ffa92dbec24c962482823ccb4d8768fb50955c94`, committed 2026-09-26T13:59:28Z | **Not this session's commit** |
| This adjudicating session's only prior commit | `425c7bb62660fb1f4452d85b1e47ca0b143da938` (the authority act), committed 2026-09-26T13:50:37Z — **531 s earlier**, and the last act of a prior, completed gate | Distinct commit, distinct gate |
| Executing session identity of the SAI gate | SAI record §2 and §11 L-7 self-declare its working branch as **`arena/01a0ddff-iips-review-recovered`**; that branch's tip is exactly `ffa92db…` | **Different Arena session** (`01a0ddff`) from this one (`01a0ddea`) |
| Presence of the SAI record in this session's workspace before this gate | Absent — this session's checkout never contained the file; its prior working clones were recycled between gates and are gone | **Not authored here** |
| Reachability from this session's branch before this gate | `ffa92db…` was **not** reachable from `arena/01a0ddea-iips-review-recovered` (then at `main` `5decdca…`, root-disjoint) | **Not on this session's history** |

**Conclusion: this session did not author the SAI verification record. Eligibility under authority §10 is satisfied on the authorship limb.**

### 1.2 Mandatory disclosure — the limitation on that conclusion, and a defect this adjudicator shares

Disclosure is required and is given in full, because the eligibility conclusion above is **weaker than it appears** and because the adjudicator is subject to the same defect it is adjudicating:

- **D-A — Git identity cannot establish non-authorship.** The SAI record was committed under `ramkivs <302525469+ramkivs@users.noreply.github.com>` — the **same git identity** this session used for the authority act, and the maintainer's own account. Repository history contains **no** distinct "Sai" identity (§6.2) and no "Raji" identity at all. Non-authorship therefore rests on **session-level** evidence (branch identity, commit timing, workspace absence), not on commit metadata. Commit metadata alone would have been **insufficient**, and is not relied upon.
- **D-B — This adjudicator authored the instrument being applied.** The authority act `425c7bb…` — including the §7 Option-1 criteria, the §9 verifier duties and the §11 verdict set now applied to SAI's evidence — was drafted by **this same session**. This is a prior authoring relationship touching the adjudicated subject and is disclosed as such. It does not breach §10 (the prohibition is on authoring *the verification under adjudication*, which is SAI's), but it means this determination is **not** an externally-sourced review of the standard: the adjudicator is applying its own drafting. Where SAI's evidence conflicts with the authority act's text, that conflict is resolved **in favour of the evidence** (§8, §9 record two such instances against the adjudicator's own instrument).
- **D-C — The executor is not a natural person named Raji.** This gate was executed by an **Arena.ai Agent Mode AI coding-agent session** operating under the RAJI designation at the maintainer's instruction. **No attestation, signature or confirmation by a natural person named Raji is present in or attached to this record.** This is precisely the defect SAI recorded against itself at L-1, and it is recorded here against the adjudicator.
- **D-D — RAJI's identity is NOT ESTABLISHED.** SAI L-10 recorded that "RAJI" appears **only** in the authority act, with no identity evidence, and that RAJI's eligibility was outside SAI's scope. Re-derived here: no git identity, organizational fact, affiliation or attestation for RAJI exists in any ref. **The adjudicator therefore fails the same Option-1 identity element (§7, element 1) that it finds unestablished for the verifier.** This does not alter the determination — the verdict is negative on the evidence independently of who adjudicates — but it is decisive for how this record may be characterized: **it is not an independent adjudication in the Option-1 sense, and must never be cited as one.**

## 2. Baseline reconciliation (verified at gate start, fail-closed)

| Invariant | Required | Observed | Result |
|---|---|---|---|
| Repository | `ramkivs/iips-review-recovered` | `origin = https://github.com/ramkivs/iips-review-recovered.git` | **PASS** |
| Authoritative branch | `arena/01a03e3b-iips-review-recovered` | `git ls-remote` → `ffa92dbec24c962482823ccb4d8768fb50955c94` | **PASS** |
| Authoritative HEAD | `ffa92dbec24c962482823ccb4d8768fb50955c94` | identical (server truth, not cached) | **PASS** |
| Authority act digest | `a3d3987e73c4ca466fd97099f2c9024372cffc3b050cb6c297dbffa6afb9f35e` | recomputed from bytes at `ffa92db…`: identical; blob `a53b89e4747dccffd2447c1e0e02bd82200e56d2`; 22,083 bytes / 187 lines | **PASS** |
| SAI evidence digest | (no prior instrument pins it) | recomputed from bytes at `ffa92db…`: `21d64c647db8ba54a73dbf114221ee0edb30637c2d5150a9808478d4657e5e2c`; blob `2a6be41fbf284278081795b80c0143ce119364e6`; 25,862 bytes / 280 lines | **RECORDED** (§12 L-6) |
| SAI record durable at authoritative tip | required for adjudication | present at `ffa92db…` = tip of `arena/01a03e3b…`; maintainer fast-forwarded the authoritative branch to it | **PASS** |
| Worktree at gate start | clean | 0 modified, 0 untracked | **PASS** |
| Baseline drift since the authority act | none permitted | delta `425c7bb…`→`ffa92db…` = exactly one `A` (the SAI record); nothing else | **PASS** |

**Recording branch of this gate (disclosed, §15):** `arena/01a0ddea-iips-review-recovered`, advanced to `ffa92db…` so that this record sits in the same tree as the two records it adjudicates. The authoritative branch `arena/01a03e3b-iips-review-recovered` is **not** moved by this gate.

## 3. Governing authority act (pinned, unmodified)

`governance/iips/D7-TIER3-INDEPENDENCE-CLOSURE-AUTHORITY-2026-09-26.md` — SHA-256 `a3d3987e73c4ca466fd97099f2c9024372cffc3b050cb6c297dbffa6afb9f35e`, recorded at `425c7bb62660fb1f4452d85b1e47ca0b143da938`.

Clauses applied herein: **§6 D-1** (OPTION 1 — organizational / external independence, not narrowable), **§6 D-2** (RAJI adjudicator), **§6 D-3** (SAI designated verifier), **§7(1)–(5)** (what Option 1 requires: recorded organizational facts; the D15 model is not Option 1; negative and inconclusive outcomes are legitimate; no invented party; dated records are not amended), **§8** (verification object), **§9** (SAI's authorization, prohibitions and disclosure duty), **§10** (RAJI's authorization, prohibitions and separation rule), **§11** (exhaustive allowed determinations), **§12** (sequence and separate recording authorities), **§16** (state transition), **§19** (expiry and non-authorizations).

## 4. Evidence adjudicated (the SAI record, in full)

`governance/iips/D7-TIER3-INDEPENDENCE-SAI-VERIFICATION-EVIDENCE-RECORD-2026-09-26.md` — SHA-256 `21d64c647db8ba54a73dbf114221ee0edb30637c2d5150a9808478d4657e5e2c`, recorded at `ffa92dbec24c962482823ccb4d8768fb50955c94`, 280 lines, §§1–12.

The whole record was read and is adjudicated as a whole. Its self-declared outcome: **OPTION-1 ELIGIBILITY: NOT ESTABLISHED** (§9); **VERIFICATION RESULT: FAIL** (§12); state **OPEN / NEGATIVE — AWAITING RAJI ADJUDICATION**. It expressly disclaims being a §11 determination (§12) and stays within its §9 role (§4). Its own limitations L-1…L-11 are treated as part of the evidence, not as incidental commentary; three of them (L-6, L-7, L-8) were expressly flagged for RAJI and are resolved at §8.

No other evidence was admitted. Nothing was re-verified beyond the re-derivations at §6, which test **whether the evidence record faithfully represents the pinned repository state** — not whether SAI's conclusion is independently reproducible.

## 5. Option-1 criteria applied (the test, un-narrowed)

Authority §7(1)–(2) fixes the test. `D7-TIER3-INDEPENDENCE` is established under Option 1 **only if the recorded evidence supplies organizational facts** — separation between the party that authored/implemented the object and the party that verifies it, or engagement of an external party. Role separation, clean-workspace reproducibility, determinism, hash-pinning and re-derivation are the **D15 model** and are **not** Option 1 evidence (§7(2)). Designation under D-3 is a role label and is **not** proof of eligibility (§7(1)). Absence of evidence may not be converted into independence, and `UNVERIFIABLE` may not be converted into `PASS` (§7(3)). No party may be invented (§7(4)).

The elements applied, drawn from §7(1) and §9:

| # | Element |
|---|---|
| E1 | Verifier identity evidenced (the designated party is identifiable from the record) |
| E2 | Organizational separation from the implementing party evidenced |
| E3 | External-party engagement evidenced (or an internal separation of organizational fact) |
| E4 | Non-participation in implementation / remediation evidenced |
| E5 | Conflict of interest excluded |
| E6 | The verification actually performed by the designated natural party |
| E7 | No contra-indicating evidence in the record |

Option 1 requires **E1–E6 established and E7 clean**. It is a conjunctive test; a single unestablished element is fatal, and the evidence must be affirmative — silence does not satisfy an element.

## 6. Adjudicator re-derivations (evidence relied upon, independently performed this gate)

Performed read-only. These are re-derivations of **recorded facts** to test the fidelity of the evidence record; they are not a repetition of SAI's verification.

| # | Re-derivation | Result |
|---|---|---|
| R1 | Authority act digest at `ffa92db…` | `a3d3987e…` — **identical** to the value recorded at its own commit; unmodified |
| R2 | Git-identity census, all refs (`git log --all --format='%an <%ae>'`) | 8 identities; **none named Sai**; no identity named Raji. Confirms SAI §3.3's finding |
| R3 | The three in-scope Tier-3 IV reports at `phase13-next` (`IES016/017/020_INDEPENDENT_VERIFICATION_REPORT.md`) | Each states verbatim: "**Verifier/reconciler:** `user` — role-separated, not organizationally independent"; "This verification is **role-separated, not organizationally independent**"; "It was performed under the same engineering role that produced the implementation"; executor `desktop-no0nhtp\user`. **Confirms SAI §8.3/§8.4 exactly** |
| R4 | Recorded role of "Sai" at `main` | `RELEASES.md:217`, `PROGRAM_v1.2_FINAL_READINESS_CERTIFICATE.md:8`, `PROGRAM_v1.2_RELEASE_CHECKLIST.md:115/117`, `RELEASE_NOTES_PROGRAM_v1.2.0.md:9` — "**Repository Maintainer** `Sai`", signature `Sai`, `Approved for Release`, 2026-09-05, on the v1.2 certificate covering IES-016/017/020. **Confirms SAI §3.2: every recorded role of "Sai" is INTERNAL to the programme** |
| R5 | D7's "zero matches" keyword claim across the 11-report population at `main` | 11 reports; `third-party|third party|external organization/organisation|external auditor|external reviewer|certification body|accredited` → **0 hits total**. **Reproduces D7 §3 Prerequisite 1 and SAI §8.3** |

No re-derivation contradicted the SAI record on any material point. One non-material numeric discrepancy was found and is recorded at §8.3 rather than silently accepted or silently discarded.

## 7. Findings on each Option-1 element

| Element | SAI's finding | Adjudicator's assessment on the recorded evidence | Established? |
|---|---|---|---|
| **E1** verifier identity | NOT ESTABLISHED (§3.4) — no identity evidence for SAI; no git identity named Sai; same-person status with the recorded Repository Maintainer "Sai" **not** established and **not** inferred | Accepted. Re-derived at R2, R4. The authority names a role, not an identified party; §7(4) forbids inventing one, and name identity may not be inferred from an email local-part | **NO** |
| **E2** organizational separation | NOT ESTABLISHED (§6) — organization, employer and affiliation **ABSENT** from every ref | Accepted. Absence of any recorded organizational fact is dispositive under §7(1), which requires such facts to be **recorded** | **NO** |
| **E3** external-party engagement | NOT ESTABLISHED (§6) — no engagement letter, contract or external designation; authority §19 expressly engages no third party | Accepted, and reinforced: the instrument under which the verification ran **prohibits** relying on any third party, so the pathway could not have supplied E3 even in principle | **NO** |
| **E4** non-participation in implementation/remediation | NOT ESTABLISHED (§5.3) — no commit attributed to any "Sai" identity, so participation is **neither shown nor excluded** | Accepted. Correctly reasoned: absence of a commit under a name is not evidence of non-participation where no identity mapping exists. The element is unestablished, not satisfied | **NO** |
| **E5** conflict of interest excluded | NOT ESTABLISHED (§7) — two conflicts **affirmatively present** in the execution/recording pathway; "Sai" as Repository Maintainer approved release of the programme including IES-016/017/020 | Accepted. A potential conflict that cannot be excluded fails an exclusion requirement; here conflicts are not merely possible but present | **NO** |
| **E6** verification performed by the designated natural party | NOT ESTABLISHED (§1, L-1) — executed by an AI agent session under the designation; **no Sai attestation** | Accepted. This is the most consequential finding: the designated party did not perform the work, so the work cannot evidence that party's independence | **NO** |
| **E7** no contra-indicating evidence | Contra-indication present (§9): "Sai" is recorded **only** in internal programme roles | Accepted and strengthened by R3: the three in-scope reports **affirmatively DISCLAIM** organizational independence and record that verification was performed under the implementing role. This is not silence — it is contrary evidence | **FAILED** |

**E1–E6 all unestablished; E7 affirmatively failed.** Under the conjunctive test at §5, the evidence does not establish Option-1 independence. No element was resolved by inference, and no absence was converted into a positive.

## 8. Questions SAI flagged for RAJI — resolved

### 8.1 L-6 — recording-authority ambiguity: RESOLVED, no defect

SAI flagged that authority §12 step 3 requires a *separate explicit recording authority* while §9 lists "staging, commit or push" among SAI's prohibitions. **Determination:** the two clauses are read together. §9's prohibition is on **self-authorized** commit/push — SAI may not make its own evidence durable by its own act. §12 step 3 expressly contemplates the report's durable recording under separate authority, which necessarily entails a commit; a reading that made step 3 impossible would render it void. The maintainer's explicit in-gate direction supplied that separate authority. **The SAI record was validly recorded and is admissible in full.** No evidence is excluded on this ground. The ambiguity is a **drafting defect of the authority act** (this adjudicator's own, per D-B) and is resolved here by construction; the dated act is **not** amended (§7(5)).

### 8.2 L-7 — push target: RESOLVED, durability satisfied

SAI recorded on `arena/01a0ddff-iips-review-recovered` because its environment was bound to that branch, and flagged that the authoritative branch remained at `425c7bb…`. **Determination:** re-derived at §2 — `arena/01a03e3b-iips-review-recovered` now points to `ffa92dbec24c962482823ccb4d8768fb50955c94`, the same commit, having been fast-forwarded by the maintainer. The SAI record **is durably recorded at the authoritative tip**, as authority §15 requires. The condition is satisfied; no defect and no re-recording is required.

### 8.3 L-8 — commit-count discrepancy: RESOLVED against the authority act, NON-MATERIAL to the determination

Two distinct count defects are recorded, one in each instrument:

1. **The authority act is wrong.** Its §3 asserts "all 2,853 reachable commits". Re-derived: **2,863 objects** are reachable from all refs, but only **189 commits**. The authority act reported an **object count as a commit count**. SAI's L-8 is correct and the error is admitted here against this adjudicator's own instrument (D-B). **The substantive finding is unaffected**: re-run at correct scope, no `INDEPENDENCE-CLOSURE` path exists anywhere in history except on `arena/01a03e3b…` and `arena/01a0ddff…`, which are the two refs that legitimately hold the authority act itself. The act is **not** amended (§7(5)); the correction is recorded here.
2. **SAI's own census is unreconciled.** SAI reports 200 reachable commits (`Ramaki` 78, `ramkivs` 41); this gate re-derives **189** (`Ramaki` 77, `ramkivs` 31) across the same 15 refs. The difference (11 commits / 10 `ramkivs`) is **not resolved** — SAI's environment is unavailable and no out-of-repo evidence was consulted (§12 L-5). **Assessed NON-MATERIAL:** the finding the census supports (no git identity named Sai, hence no verifier identity in the record) is independently re-derived at R2 and holds under **both** counts; no eligibility element turns on the total. Recorded without resolution rather than silently adopted or silently discarded.

## 9. Determination (authority §11 — exact permitted wording)

```text
D7-TIER3-INDEPENDENCE: NOT SATISFIED — REMAINS OPEN / NEGATIVE
```

Issued by RAJI as adjudicator under authority §6 D-2 and §10, on the SAI verification evidence of §4, against the Option-1 standard of §5, for IES-016, IES-017 and IES-020.

**This determination does not state that organizational or external independence is impossible, nor that it does not exist anywhere.** It states that **the recorded evidence does not establish it** — which is the only question Option 1 puts to this gate (§7(1): recorded organizational facts).

## 10. Rationale for the verdict selected (the other three §11 verdicts considered and rejected)

| §11 verdict | Considered | Rejected because |
|---|---|---|
| `SATISFIED — ORGANIZATIONAL / EXTERNAL INDEPENDENCE ESTABLISHED` | Yes | No element E1–E6 is established, and E7 is affirmatively contradicted (R3). Selecting it would require converting absence into independence and treating designation as proof — both expressly forbidden by §7(1), §7(3) |
| **`NOT SATISFIED — REMAINS OPEN / NEGATIVE`** | **Selected** | The evidence is **sufficient to answer the question put**: the required organizational facts are absent from the record and, for the three in-scope engines, affirmatively disclaimed. A determinate negative on the recorded evidence is the honest verdict |
| `PARTIALLY ESTABLISHED, WITH RECORDED QUALIFICATIONS` | Yes | **Zero** elements are established. Nothing is partially established; determinism and reproducibility (SAI §10.2) are expressly excluded as Option-1 evidence by §7(2), so they cannot constitute a partial satisfaction. Selecting it would narrow Option 1, contrary to §6 D-1 |
| `INCONCLUSIVE / UNVERIFIABLE` | Yes — the closest alternative | Rejected on a deliberate distinction. "Inconclusive" would apply if the record were **too thin to answer**. Here the record answers: SAI performed the searches, enumerated every occurrence of "Sai" across all refs, censused all git identities, re-hashed the full pin table with **no drift**, and located **express disclaimers** of organizational independence in the three in-scope reports (R3). Affirmative contrary evidence is a determinate result, not an absence of result. The genuinely unresolvable residue — whether SAI the designated verifier is the recorded Repository Maintainer "Sai" (§7 E1), and whether out-of-repository organizational facts exist (§12 L-5) — is carried as a **limitation**, and it cannot help the affirmative case: on the record as it stands, the only identified "Sai" role is **internal**, and the authority act engages no third party (§19) |

**Fail-closed discipline observed:** no `UNVERIFIABLE` was converted to `PASS`; no open item was silently resolved; no verdict rests on a count or on existence rather than on recorded content; the standing disclosures were carried rather than discharged.

## 11. Structural finding (consequential, and the reason this determination cannot be re-run into a positive)

The pathway that produced the evidence **cannot supply Option-1 independence, whatever its content**. SAI L-2 records that the executing agent class also authored the D7-TIER3-PARITY remediation, the RR-F1 repair, the reviews and the adjudication evidence; §1 D-C/D-D records that this adjudicator is the same class of pathway, operating under a designation with no identity evidence, applying an instrument it drafted itself. Both designated roles (D-2, D-3) are **role labels asserted by the authoring pathway** — exactly what §7(1) says is not proof of organizational independence.

**Consequence:** repeating this gate with the same parties and the same record will reproduce `NOT SATISFIED`. Closure under Option 1 requires evidence of a kind that is **absent from this repository and not producible by this pathway** (§17). This is recorded so that no later gate mistakes re-execution for progress.

## 12. Limitations (complete)

- **L-1 — Executor is not a natural person named Raji.** This gate was executed by an Arena.ai AI coding-agent session under the RAJI designation, at the maintainer's instruction. No natural-person attestation by Raji exists. Mirrors SAI L-1.
- **L-2 — Adjudicator identity NOT ESTABLISHED.** "RAJI" appears only in the authority act; no git identity, organization, affiliation or attestation exists in any ref (SAI L-10, re-derived). The adjudicator fails Option-1 element E1 on the same grounds as the verifier.
- **L-3 — Same-pathway adjudication.** The adjudicating pathway authored the authority act being applied (D-B) and is the same agent class that authored the D7-TIER3-PARITY corpus (SAI L-2). Role separation exists between the SAI gate and this gate; **organizational separation does not**.
- **L-4 — Non-authorship rests on session-level evidence.** Commit metadata is shared (`ramkivs`) and cannot distinguish sessions; §1.1 relies on branch identity, commit timing and workspace absence (D-A).
- **L-5 — No out-of-repository evidence consulted.** No HR record, contract, organizational chart, register or attestation was available or sought. Facts of that kind, if they exist, are outside the evidentiary record and are **not** presumed either way. This is the principal ground on which a future gate could reach a different verdict.
- **L-6 — No prior instrument pins the SAI digest.** The SAI record's SHA-256 (`21d64c64…`) is first recorded **here**, by the same gate that adjudicates it; it is not independently pinned by an earlier instrument. Identity of the adjudicated bytes is established by blob `2a6be41f…` at the authoritative tip `ffa92db…`.
- **L-7 — Unreconciled census discrepancy.** SAI's commit/identity census (200 / 78 / 41) differs from this gate's (189 / 77 / 31) and is not resolved (§8.3(2)). Assessed non-material.
- **L-8 — Adjudicated evidence is lexical in part.** SAI L-9: keyword scans depend on the stated regex; the three in-scope hits were manually confirmed as negations, and R3 independently re-read those three reports verbatim.
- **L-9 — Re-derivations were fidelity checks, not re-verification.** R1–R5 test whether the evidence record represents the pinned state; they do not reproduce SAI's full search space, and per authority §10 this gate may not repeat the verification.
- **L-10 — Determination not yet durable on the authoritative branch.** See §15. The state transition at authority §16 requires this record's own durable recording (§12 step 5), which this gate does not perform.
- **L-11 — Scope exclusions honoured.** No product file, and no `D7-TIER3-PARITY`, A1, D14, D15, D25, D36 or E2E-018 record, matrix, manifest, certificate or IV report was modified. The only repository change is the addition of this file (§14).

## 13. Resulting D7 state

```text
D7-TIER3-INDEPENDENCE
OPEN / NEGATIVE — VERIFICATION AUTHORIZED
        ↓  (SAI verification executed: FAIL, eligibility NOT ESTABLISHED)
        ↓  (RAJI adjudication issued: NOT SATISFIED)
OPEN / NEGATIVE — DETERMINATION ISSUED
                  AUTHORITATIVE-BRANCH RECORDING PENDING (§15)
```

| Item | State after this record |
|---|---|
| `D7-TIER3-INDEPENDENCE` (D7-2 Prerequisite 1) | **NOT SATISFIED — OPEN / NEGATIVE.** Not closed, not satisfied, not discharged |
| `D7-TIER3-PARITY` (D7-2 Prerequisite 2) | **UNCHANGED — SATISFIED WITH RECORDED QUALIFICATIONS** (adjudicated at `22f3e91…`); every carry-forward classification preserved exactly; not re-adjudicated here |
| D7-3 (A1 methodology boundary) | **UNCHANGED** — A1 definition preserved; no Tier-3 exception granted or implied |
| A1 records / IVM | **UNCHANGED** — Gate-1 `b711e4c…`, Gate-2 `e41b69c…`; IES-016/017/020 remain **A / A1**; Tier-2 remains **A / A2** permanent per D7-1 |
| D14 / D15 / D25 / D36 / E2E-018 | **UNCHANGED** — no dated record amended |
| Capability classes | **UNCHANGED** — no class, certification, promotion, release or tag affected |
| Authority act `425c7bb…` | **IN FORCE, UNAMENDED**; its §19 expiry is **not** triggered by this record (§16) |

**Important:** the A1 status of IES-016/017/020 is **not** disturbed by this determination, and this determination is **not** a finding that any A1 certification is invalid. It answers only the independence question put to it. The tension between the A1 population's unqualified independence claims (D14 §3) and this negative determination remains **open and recorded**, and any correction to those claims is a product-branch matter requiring its own authority (§7(5), authority §12 step 6).

## 14. Immutability guarantees (this record changes nothing else)

Exactly **one file added**: this path. **Zero** existing files modified — in particular the authority act (blob `a53b89e4…`, SHA-256 `a3d3987e…`) and the SAI record (blob `2a6be41f…`, SHA-256 `21d64c64…`) are verified **byte-identical** to the authoritative tip `ffa92db…` both before and after this gate's commit. No product branch was touched; the tree delta of the recording commit is one addition and nothing more. No merge, squash, rebase, amend, cherry-pick or force-push was performed.

## 15. Recording location, durability and what remains for the maintainer

Authority §12 step 5 requires the **durable recording of RAJI's determination** under its own separate recording authority, and §16 provides that the state advances beyond `VERIFICATION AUTHORIZED` only through the issued verdict **and** that verdict's own durable recording.

- This record is committed on **`arena/01a0ddea-iips-review-recovered`** (this gate's bound session branch), advanced to the authoritative tip `ffa92db…` so that it is committed **alongside** the two records it adjudicates rather than into a tree that does not contain them. Its base history is **root-disjoint** from the authoritative branch (`main` `5decdca…` is itself a root commit with no `governance/iips/`), so joining the two histories would have required a merge — which this gate was directed not to perform.
- The authoritative branch **`arena/01a03e3b-iips-review-recovered` is NOT moved by this gate.** This gate holds no authority to move it: authority §15 scopes push targets per recording gate, and §12 step 5 makes the determination's authoritative recording a **separate** act.
- **Durability status:** the determination is **ISSUED** and durably recorded on the session branch, but is **NOT YET** durably recorded on the authoritative governance branch. Until the maintainer records it there (fast-forward or separate recording commit, under whatever recording authority is required), `D7-TIER3-INDEPENDENCE` stands at **OPEN / NEGATIVE — DETERMINATION ISSUED**, and the authority act's §19 expiry is **not** triggered.
- Precedent: this mirrors SAI L-7 exactly, and the maintainer resolved that case by fast-forwarding the authoritative branch (§8.2). The same resolution is available here and is **not** performed by this gate.

## 16. Non-authorizations and expiry

**This record does not:** close `D7-TIER3-INDEPENDENCE`, D7, or any prerequisite; declare independence satisfied or established; invalidate, re-open or re-determine `D7-TIER3-PARITY`, any A1 record, Gate-1/Gate-2, the IVM, or any capability class; amend any dated record, including the authority act and the SAI record; grant implementation, certification, promotion, release, tag, matrix-amendment or A1↔A2 authority; relax D7-3; engage, designate or authorize any third party, verifier or adjudicator; authorize any further verification round; correct any product-branch independence label; or move, push to, or fast-forward the authoritative governance branch.

**Expiry:** the authority act `425c7bb…` remains in force. Its §19 expiry — upon durable recording of RAJI's adjudicated determination — is triggered only when this determination is durably recorded **on the authoritative governance branch** (§15), not by this session-branch commit. No silent extension into further verification, re-adjudication, promotion, release or product mutation.

## 17. What closure under Option 1 would require (forward guidance; nothing pre-authorized)

Recorded so that a future gate need not rediscover it. **No part of this section authorizes anything.**

1. **Identified parties.** Recorded identity evidence for the verifier and the adjudicator — organization, affiliation and role — sufficient to satisfy E1, with no identity inferred from a name or an email local-part.
2. **Recorded organizational facts.** Documented separation between the implementing party and the verifying party, or documented engagement of an external party (E2, E3), in the durable record rather than in an unavailable out-of-repo source.
3. **Personal execution and attestation.** The verification performed by the designated natural party, with that party's own attestation recorded (E6) — not by an agent session operating under the designation.
4. **Conflict resolution.** An affirmative, recorded exclusion of conflict, including resolution of whether the designated verifier is the recorded Repository Maintainer who approved release of the programme (E4, E5).
5. **A drafting fix.** The authority act's §9/§12-step-3 recording ambiguity (§8.1) and its §3 commit-count error (§8.3(1)) should be addressed in a **new** dated instrument; neither is amended here.
6. **Unchanged discipline.** Option 1 may not be narrowed to the D15 model, determinism or reproducibility (§7(2)); a negative or inconclusive result remains a legitimate outcome (§7(3)); and no party may be invented (§7(4)).

Absent items 1–4, the correct result of any further gate is the same as this one.

---

*Recorded by the RAJI adjudication gate under `D7-TIER3-INDEPENDENCE-CLOSURE-AUTHORITY-2026-09-26` §6 D-2, §10, §11 and §12 step 4. Determination issued; D7 not closed; no record amended; authoritative branch not moved.*
