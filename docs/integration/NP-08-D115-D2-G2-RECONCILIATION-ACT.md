# D115 / D-2 / G-2 Reconciliation Act

> **Status:** NOT AUTHORITATIVE until the commit containing this file is reachable from `refs/heads/main` of `ramkivs/iips-review-recovered` and that publication is independently verified under §14. Line references are to the named file on `origin/main` at the review point stated in §5.

## 1. Title

D115 / D-2 / G-2 Reconciliation Act — additive clarification.

## 2. Artifact ID

`NP-08-D115-D2-G2-RECONCILIATION-ACT-01`

## 3. Date

2026-10-09 (Asia/Calcutta)

## 4. Program Authority

Ramki (Ramakrishnan), IIPS Program Authority, as recorded in the D115-A header (line 7) and the D-2 header (line 9). The decisions in §6 and §7 are the Program Authority's decisions communicated in session on 2026-10-09.

## 5. Authoritative repository and ref

- Repository: `ramkivs/iips-review-recovered`
- Ref: `origin/main`
- Observed at `899ecd71d68e5aac09f539f3b918222745c25b9e` at candidate preparation. E2, E4, and E6 were re-checked against that ref. The commit itself was not re-verified.

## 6. Decisions (final for this step)

- **D1 = A** — D115-A remains ISSUED BUT NOT EFFECTIVE.
- **D2 = A** — CIA REMAINS UNDESIGNATED.
- **D3 = A** — G-2 §2 denotes instrument/security-master identity only.
- **D4 = B** — D-2 does not supersede D115-A; explicit reconciliation is required.
- **D5 = A** — clarification/amendment only; no new authority designation.

## 7. Procedural decisions

- **P1 = A** — publish ONE additive reconciliation act; do not rewrite historical records.
- **P2 = A** — complete D-2 §13 publication coordinates before the act cites them (recorded in E4; the D-2 text is not edited).
- **P3 = A** — exclude NP-04 from this act; retain it as a follow-on review item.
- **P4 = A** — retain the `278835f` versus `b1db08c` implementation provenance discrepancy as OPEN.
- **P5 = A** — retain the missing D115 closure independent-verification record as OPEN.

## 8. Evidence basis

- **E1 — Authoritative ref.** `origin/main` = `899ecd71d68e5aac09f539f3b918222745c25b9e` (read-only `ls-remote`). The commit was not re-verified.
- **E2 — Required records present and unchanged.** Each blob equals the blob at the commit the record cites, or the previously established value:
  - D-2 `ec80ef89…` (0a36dee)
  - closure `d284fcd3…` (4869d26)
  - D115-A `4ab8c649…` (previously established)
  - D115-I `61847b41…` (c25c4ac)
  - completion record `cdbc3124…` (b1db08c)
  - G-2 `7e83946b…` (b7ed35e)
  - G2-UI `c370a1bd…` (44d1556)

  Re-checked at candidate preparation: all matched, including the SHA-256 values for D-2 and the closure.
- **E3 — Ancestry on `origin/main`.** 0a36dee ✓; 4869d26 ✓; b1db08c ✓; 278835f ✗ (not an ancestor; Open 5). Carried from the review step.
- **E4 — D-2 §13 publication coordinates** (remote evidence; the D-2 text is not edited under P1). Re-checked at candidate preparation: all matched.
  - Repository `ramkivs/iips-review-recovered`; ref `refs/heads/main`.
  - Baseline main `561cc85fdbc929e68e798b1e97dda76a64262b9e` (parent of the PR head; first parent of the merge).
  - Branch `governance/d2-identity-tenant-option-b` (remote head `0a36dee60637e14f8cc092bfcd44bf786bda4d21`).
  - PR `#39`: closed, merged 2026-10-06T20:11:59Z (https://github.com/ramkivs/iips-review-recovered/pull/39).
  - Merge commit `f89f1904d619eb7bad01db0e2ead4bcb5c91414d` (parents `561cc85f…` and `0a36dee…`; on main's first-parent line).
  - Tree `cd1ef894caf797a11df168b52383826bb312d6cb` (identical for the PR head and the merge commit).
  - Record path `docs/integration/IDENTITY-TENANT-DOMAIN-SCOPE-DECISION.md`; blob `ec80ef89aba3deb2ef1c7ae26afb52e9b8085ee9`; SHA-256 `4078d79a84d993454bee5be86df1ccd62faa3019bedac1d133d4654646d1c55c`.
- **E5 — Closure identifiers.** Closure SHA-256 `51ec1eb420ac38476448c4138c2c971d43494e2d6e6b88e639e7e3e7bc8f0db4` (blob `d284fcd351e1634ed0c5a0b063da488ec61e6c13`). D115-I contains `4869d26`, `d284fcd3`, and `51ec1eb4`. No commit message on any ref contains them. Carried from the review step.
- **E6 — Term sweep** (affected records and whole tree). Re-checked at candidate preparation:
  - "designated Company Identity Authority": D115-A (2). "already-designated": D115-I (1).
  - "Company Identity Authority": D-2 (7), closure (14), D115-A (5), D115-I (9), completion record (8), G2-UI (2); runtime code `d115-runtime.ts` and its test (7 each).
  - "canonical company" appears in 7 affected records; "canonical CompanyId" in 4; "SecurityMaster" in 6; "companyId" in 8. The `companyId` occurrences are field-name uses, classified by pattern rather than line by line.
  - Whole tree: one further occurrence, NP-12 line 266 ("No company identity authority", a negation). NP-04 has one occurrence (line 221). None in the lineage-investigation evidence package.
- **E7 — NP-04 narrow review** (not an amendment target). Lines 35–39 are a citer list. Lines 152–176 (§8) say D115 "consumes the authoritative durable relationship when established" and that D115 does not own the durable user-portfolio persistence domain. Lines 218–222 state a governance boundary only and do not authorize CIA creation. Lines 239–244 prohibit merging the G24 and NP-04 namespaces and changing CompanyId semantics. NP-04 was narrowly reviewed for the identified CIA/CompanyId references. Its checked provisions remain consistent with this act and grant no CIA creation or CompanyId semantic-change authority. NP-04 is excluded from this act and retained as a follow-on review item.
- **E8 — Not re-verified.** IPD repositories and files were not re-read for this act. IPD items are carried forward from the earlier investigation and are labelled as such.
- **E9 — Workspace status is not evidence.** Local workspace state and the lineage-investigation evidence package were not used as evidence and were not modified.

## 9. Reconciliation statements

**R1 — D115-A status.** D115-A (`NP-08-D115-IDENTITY-RUNTIME-COMPANYID-BINDING-AUTHORITY-ACT.md`) remains ISSUED BUT NOT EFFECTIVE. Its header (line 14) states its effective point as "only on independently verified publication to authoritative origin/main". Its §7 (lines 464–482) sets the effectiveness conditions. Those conditions and §8 are unchanged (E2). No waiver is granted. The §7(7) standard (LOCAL == REMOTE, line 478) and the §7(8) standard (clean worktree, line 479) remain unresolved and open (Open 1–2).

**R2 — CIA status.** NO COMPANY IDENTITY AUTHORITY IS DESIGNATED. The record says so: D-2 §5 ("NO DURABLE / UNIVERSAL COMPANY IDENTITY AUTHORITY IS ESTABLISHED BY D-2", line 108) and §6 (line 123); D115-I line 491 (Company Identity Authority creation: NOT AUTHORIZED); completion record line 70 (no concrete CIA "was selected or created"). The `CompanyIdentityAuthority` interface in `frontend/server/d115-runtime.ts` and its fixture-only test are not a designation (D-2 §5, lines 99–102).

Wording that presupposes an already-designated CIA is non-operative and does not itself constitute a designation. This covers:
- D115-A line 68 and lines 135–136;
- closure §6.1 (lines 304–309), including "designated by the program's identity domain" and the "conceptual custodian" identification of the SecurityMaster authority, and the designation-presupposing sentences at lines 104, 261, 402, 510, and 702;
- D115-I lines 130–131 and line 204 ("already-designated");
- G2-UI line 92 (restatement of closure §6.1).

The closure is headed "ARCHITECTURE CONTRACT ACCEPTED" (line 14). That acceptance designates no CIA.

**R3 — D115-A §C.** "D115-A §C" denotes D115-A §3, Packet C, "C — Authoritative Company Identity" (lines 131–166). Packet C has no operative CIA effect while no CIA is designated and D115-A remains ineffective. Its CIA-dependent statements (assignment, return, and validation by a designated authority) are inert. No CompanyId is assigned, validated, or mapped by this act.

**R4 — G-2 §2.** G-2 §2, line 55 ("SecurityMaster and canonical company-identity mapping;"), is interpreted for this reconciliation as referring to the existing instrument/security-master identity capability. It does NOT designate a CIA, establish a governed company-identity mapping, or establish canonical CompanyId authority. This is consistent with D-2 §3.2 (lines 56–58) and D-2 §6 (lines 116–123).

**R5 — Instrument companyId.** The IPD instrument/security-master `companyId` remains an instrument-reference identifier under D-2. D-2 §3.2 (lines 56–62) says these occurrences "relate to instrument/reference identity" and that instrument `companyId` "MUST NOT be reinterpreted as canonical user/company identity". The same scope applies to:
- the P04 instrument `companyId` carried per holding in the G-2 holding projection (G2-UI lines 59 and 109);
- the IPD "sole authority" wording in NP-15 (lines 737 and 771).

No IPD code or data is changed.

**R6 — D-2 relationship.** D-2 does not supersede D115-A by chronology. D-2 contains no supersession language. It cites neither D115-A, the closure, nor D115-I by record identifier; its only D115 reference is the runtime-file path (§5, line 99). This act supplies the explicit reconciliation required by D4.

**R7 — No new authority.** This act grants no CIA designation, no CIA creation authority, no CompanyId assignment authority, no mapping activation authority, no implementation authority, no qualification, acceptance, or certification authority, no release or deployment authority, and no production authority. No company identity is inferred from the identity of the Program Authority or of any user.

## 10. Affected-record matrix

Annex 1 (below), reproduced in this file so that the act is self-contained.

## 11. Conflict-closure matrix

No further contradiction was found that materially changes D1–D5. The conflicts identified in the review are closed or preserved as follows.

| # | Conflict | Source | Closure |
|---|---|---|---|
| C1 | Records presuppose an already-designated CIA; D2 = A (none designated) | D115-A lines 68, 135–136; closure lines 104, 261, 402, 510, 702; D115-I lines 130–131, 204 | Closed by R2: non-operative; not a designation |
| C2 | Accepted closure §6.1 names the SecurityMaster authority as conceptual custodian | Closure lines 304–309; G2-UI line 92 | Closed by R2 as a wording clarification; text unedited (P1). Flagged for Program Authority visibility |
| C3 | G-2 §2 lists "canonical company-identity mapping"; D-2 §3.2 and §6 say instrument-only, with no governed company mapping | G-2 line 55; D-2 lines 56–62, 116–123 | Closed by R4 (D3 = A) |
| C4 | Instrument `companyId` vs canonical CompanyId (field-name overlap) | D-2 lines 61–62; G2-UI lines 59, 109; NP-15 lines 737, 771 | Closed by R5 (scope). Label question open (Open 14) |
| C5 | Possible D-2 supersession of D115-A | D-2 (no supersession text; no D115-A citation) | Closed by R6: not superseded; reconciled explicitly |
| C6 | D115-I row "None in current IRR source" vs the interface on main | D115-I line 401; D-2 lines 99–100 | Clarified: no authority implementation; the interface is not a designation (Open 15) |
| C7 | Completion record names `278835f` as implementation commit; main's runtime content arrived via `b1db08c` | Completion record lines 10, 45; E3 | OPEN (P4; Open 5–6) |
| C8 | Closure and D115-A status are conditional on independent verification; the separate record is missing | Closure §1.1 lines 58–67; D115-A line 14 | OPEN (P5; Open 4) |
| C9 | D115-A §4.4 "Reconciled — no contradiction" vs Packet C treatment of G-2 | D115-A lines 373–380; lines 131–166 | OPEN (carried; Open 13) |

## 12. Remaining open items

Annex 2 (below): Open items 1–18, preserved and not closed.

## 13. Authority boundaries

The boundaries are those in R7. Designating any CIA, establishing any governed CompanyId mapping, binding any implementation to a CIA, and changing D115-A's effective status are each separate governance decisions requiring their own authority records.

## 14. Effectiveness conditions

This act becomes effective only when (a) the commit containing it is published to `refs/heads/main` of `ramkivs/iips-review-recovered`, (b) that commit is reachable from `refs/heads/main`, (c) the artifact is present at its path with blob and SHA-256 identity confirmed in the remote tree, and (d) an independent remote verification is recorded, under the durability convention referenced in closure §1.1. Until then it is a draft and must not be represented as current authoritative governance. This act does not resolve the §7(7)–(8) standards.

## 15. Non-authority and non-implementation statement

This act is governance clarification only. It is not an application, persistence, identity-provider, API, UI, deployment, qualification, acceptance, certification, release, or production action. It modifies no code, runtime behaviour, IPD code or data, lineage-investigation evidence package, or historical record. Production, live Dhan, and live OIDC/Keycloak certification remain out of scope.

## 16. Publication prerequisites and status

Applied at candidate preparation:
1. E2, E4, and E6 were re-checked against `origin/main` (the E1 ref), and all matched.
2. The candidate is a single commit on a fresh checkout based on that `origin/main`, with no branch created.
3. The only change is this file.
4. The references cited in §§8–11 and the annexes were checked against the named files at that ref.

Not performed at candidate preparation:
5. Publication to `refs/heads/main` by the route the Program Authority designates.
6. Independent remote verification after publication: reachability from `refs/heads/main`, blob and SHA-256 identity, an exact re-read, and no unintended files.

Until items 5 and 6 are complete, this act is not authoritative. E1, E3, E5, E7, E8, and E9 were recorded at the review step; only E2, E4, and E6 were re-checked at candidate preparation.

## Annex 1 — Affected-record matrix

| Record (blob) | Issue found | Treatment |
|---|---|---|
| D-2 (`ec80ef89…`) | §13 PENDING fields (PR, merge, tree, blob, SHA-256), now completed from remote evidence (E4). §3.2 instrument `companyId` (lines 56–62). §5–§6 (lines 97–123): no CIA or company mapping established. No supersession language | Not edited (P1). Coordinates recorded in E4. R5, R6 |
| Closure (`d284fcd3…`) | Status "ARCHITECTURE CONTRACT ACCEPTED" (line 14). Effectiveness conditional on publication and independent verification (§1.1, lines 58–67). §6.1 (lines 304–309) names the SecurityMaster authority as conceptual custodian. Designation-presupposing sentences at lines 104, 261, 402, 510, 702. CIA owner statements at lines 168–169, 180, 369, 598, 869 | Presupposition is non-operative (R2). Wording clarification only (D5). Not edited (P1). Open 4 |
| D115-A (`4ab8c649…`) | Effective point (line 14). "Designated Company Identity Authority" at line 68 (§2 table) and lines 135–136 (§3 Packet C). §4.4 (lines 373–380) "Reconciled — no contradiction". §7 (lines 464–482) | R1, R3. Effective status unchanged. §7(7)–(8) open (Open 1–2). §4.4 carried (Open 13) |
| D115-I (`61847b41…`) | Numbered items 11–12 (lines 130–131) describe the CIA as "the canonical company-identity authority". §5.2 (lines 202–205) refers to the "already-designated" CIA. CIA row (line 401): "None in current IRR source". Prohibition at line 421; "NOT AUTHORIZED" at line 491 | R2 (non-operative). §5.2 has no operative object while no CIA exists (R7). Line 401 read as no authority implementation (Open 15) |
| Completion record (`cdbc3124…`) | Names implementation commit `278835f` (lines 10, 45), which is not an ancestor of main (E3). Line 70: no concrete CIA "was selected or created". Line 193: fixture-scoped "sole canonical source" validation row. Line 311: CIA "is not created or replaced" | P4 OPEN (Open 5–6). Lines 70 and 311 consistent with R2. Line 193 read as test scope, not designation |
| G-2 (`7e83946b…`) | §2 line 55: "SecurityMaster and canonical company-identity mapping;" | R4 (D3 = A). Interpretation only; not edited. IPD ref designation open (Open 8) |
| G2 implementation record (`8486a5708c…`) | "companyId" ×2, not individually classified. No CIA or canonical wording found by the sweep | No treatment change |
| G2-UI readiness (`c370a1bd…`) | §G line 92 restates closure §6.1 as the "conceptual Company Identity custodian" and states CompanyId is "unresolved by design". Lines 59 and 109: P04 instrument-scope `companyId` per holding | R2 (restatement non-operative); R5 (scope). Open 14 |
| NP-15 (`18572c53b2…`) | Line 222 (X-7): IPD ref designation open. Lines 737 and 771: IPD SecurityMaster/`companyId` "sole authority" (instrument scope) | R5 scope. Not amended; follow-on. Open 8, 17 |
| NP-12 (root path; blob not recorded) | Line 266 "No company identity authority." (negation). Line 267 "No reinterpretation of `companyId`." | Consistent with R2 and R5. No change |
| NP-04 (`aeda90c77f…`) | Excluded (P3). Reviewed per E7. Line 221 "Company Identity Authority creation" is not authorized | Follow-on review (Open 18) |
| Runtime code: `frontend/server/d115-runtime.ts` (`d9b546c941…`) and its test | `CompanyIdentityAuthority` interface; fixture-only test (D-2 §5). Not a governance record | No change by this act. The interface is not a designation (R2) |

## Annex 2 — Open-item register

| # | Open item | Reason | Future authority required |
|---|---|---|---|
| 1 | D115-A §7(7) LOCAL == REMOTE standard | §7(7) (line 478) does not define which LOCAL (workspace, session branch, or worktree) or which time applies | Program Authority definition (amendment act) |
| 2 | D115-A §7(8) clean-worktree standard | The worktrees and times to be assessed are undefined (line 479) | Program Authority definition |
| 3 | D115-A declared baseline `2dc55638` vs immediate parent `3c626157` | Declared baseline (line 15) differs from the immediate parent; two D91 commits on 2026-10-04 intervene (earlier verification; not re-run) | Program Authority acknowledgment or clarification |
| 4 | Missing D115 closure independent-verification record | Closure §1.1 (lines 58–67) and the D115-A header (line 14) condition status on independent verification. The record is missing (P5) | Verifier designated by the Program Authority; Program Authority acceptance |
| 5 | Completion record names `278835f` as the implementation commit | `278835f` (parent `c25c4ac`, 2026-10-04) is not reachable from main (E3) | Program Authority provenance decision; any note is additive |
| 6 | Runtime content reaches main via `b1db08c` | Identical blobs for the three runtime files. Content identity does not establish implementation-admission authority. Sequencing against D115-I not evaluated | Separate Program Authority implementation-admission determination |
| 7 | D-2 §13 PENDING text | Coordinates completed in E4; the D-2 text still shows PENDING (not edited under P1) | Program Authority decision on any additive coordinates note; no edit to D-2 |
| 8 | IPD G-2 baseline/ref designation (X-7) | NP-15 line 222: "ref designation still open". Not re-verified for this act | IPD-side and Program Authority designation of the authoritative IPD ref |
| 9 | IPD BI08 §12.1 / PHASE1 §G semantic conflict | Recorded in the earlier IPD investigation; not re-read for this act | IPD-side governance decision |
| 10 | Future CIA designation | Undesignated (R2); this act does not decide it | Separate governance decision with its own authority record |
| 11 | Future governed CompanyId mapping | None established (D-2 §6, lines 116–121) | Separate governance decision |
| 12 | Any implementation binding to a real CIA | Not authorized (D115-I lines 421, 491; R7) | Separate implementation authorization after any CIA designation |
| 13 | D115-A §4.4 "Reconciled — no contradiction" vs Packet C treatment of G-2 | Carried forward from the earlier investigation; only §4.4 was re-read for this act | Program Authority additive reconciliation if required |
| 14 | `companyId` label on P04 instrument-scope holding projections | G2-UI lines 59 and 109. The label may be read as company identity (R5 scope) | Program Authority decision on label clarification; any rename is an implementation matter |
| 15 | D115-I line 401: "None in current IRR source" | Read as no authority implementation; the interface exists on main (D-2 lines 99–100) | Program Authority wording clarification if required |
| 16 | Closure §6.1 and G2-UI §G "conceptual custodian" wording | Non-operative under R2; clarification only | Any custodian designation is a separate decision (Open 10) |
| 17 | NP-15 "sole authority" wording (lines 737, 771) | Instrument scope under R5; NP-15 not amended | Follow-on NP-15 review |
| 18 | NP-04 | Excluded (P3) | Follow-on review |
