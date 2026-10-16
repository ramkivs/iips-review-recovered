# IIPS v3.0 — G-2 — IRR DP-1 AMENDMENT: PR #118 MERGE DECISION REQUEST

| Field | Value |
|---|---|
| **Record ID** | `IIPS-V3-G2-IRR-DP1-PR118-MERGE-DECISION-REQUEST-2026-10-16-01` |
| **Record type** | **IRR-side merge decision request** — documentation only; no merge, no authority rendered, no implementation |
| **Decision authority required** | **Ramki — Program Authority / repository owner** for `ramkivs/iips-review-recovered` |
| **Date** | 2026-10-16 (Asia/Calcutta) |
| **Recording agent** | Arena Agent Mode — recording and publication only; no authority rendered |
| **Repository / branch** | `ramkivs/iips-review-recovered` / `arena/8aff8266-iips-review-recovered` (PR #118 workstream) |
| **Subject PR** | PR #118 — `docs(g2): IRR DP-1 identity/credential trust amendment (align to accepted IPD L-IPC-1)` |
| **Subject amendment** | `docs/integration/IIPS_v3.0_G2_IRR_DP1_IDENTITY_CREDENTIAL_TRUST_AMENDMENT_2026-10-16.md` (blob `c71661a1ee445b2348cedfedae4aef6449029ebb`) |
| **Dependent IPD record** | `IIPS-V3-G2-IPD-GATE-A-PA-DECISION-2026-10-16-01` (IPD PR #8, open, unmerged) — decision 2 |
| **Status** | **DECISION REQUIRED — NOT DECIDED.** No merge performed or claimed. |

---

## 1. Purpose

This record is the minimum necessary IRR-specific merge decision request for PR #118. It does not repeat the completed DP-1 investigation or recreate the amendment. It exists only because the rendered IPD Gate A decision (decision 2) requires the DP-1 amendment to be effective on authoritative IRR `main` and independently verified before Gate A execution, and the IPD act expressly states that merging PR #118 remains a separate decision to be taken on the IRR side.

## 2. Verified live state

| Item | Value |
|---|---|
| IRR `main` | `eb4bf820c62eb3e2f5c628a95d59c8f967e3f629` |
| PR #118 | OPEN, unmerged; head `dc47dd2eb0989439c045e272ce7fed3b909e3c6e`; base `main`; mergeable `MERGEABLE`; merge state `CLEAN` |
| PR #118 changed files | 1 file: `docs/integration/IIPS_v3.0_G2_IRR_DP1_IDENTITY_CREDENTIAL_TRUST_AMENDMENT_2026-10-16.md` (+188/−0) |
| Amendment on IRR `main` | ABSENT (content lookup 404) |
| Amendment on PR #118 head | PRESENT (blob `c71661a1ee445b2348cedfedae4aef6449029ebb`) |
| PR #118 CI | PASS (`Typecheck · Test · Build`, run `38934588533`) |
| IPD Gate A decision | RENDERED, `APPROVE WITH CHANGES`; execution BLOCKED on decision 2 (DP-1 amendment effective on IRR `main` + independently verified) |
| IPD PR #8 | OPEN, unmerged |

## 3. Merge-authority determination

**No existing explicit authority act authorizes merging PR #118.** This determination is based on quoted governance text, not inference from cleanliness, mergeability, or the existence of the amendment:

1. **H-18 §8.3(b)** — merge authorization is a separate explicit authorization.
2. **G2-2 §P5** — the effectiveness rule does not grant merge authorization; decided-and-ratified status, green CI, and verified branch publication each supply none of it.
3. **P-2 execution handoff §2** — the attributed standing authorization covers **governance-record preparation, branch publication for review, and read-only verification**, and is the basis for this record and for nothing else. Admission to `main` is expressly outside that delegation.
4. **F-3 source grant** (blob `c4c9f7d79ef181af96f6c4e5cc108288ef22fd02`) is workstream-scoped and grants no authority beyond its §4.
5. **Practice** — prior PRs (#90, #96, #97, #54) were merged by the owner (`ramkivs`) as explicit `Merge pull request #NN` commits; admission has been the owner's own act.
6. **IPD Gate A decision §2.2 and §6** — expressly states that PR #118 is not merged by that act and that merging PR #118 remains a separate decision to be taken on the IRR side. The IPD decision grants no IRR merge authority.
7. A repository-wide search for standing-grant phrasing returned only the bounded, workstream-scoped texts quoted above; no record carries standing grant language for agent-performed merges.

**Conclusion:** merge authority is absent. PR #118 must remain open unless and until the Program Authority renders an explicit merge authorization for it.

## 4. What the requested authority act would authorize

If granted, the requested act authorizes **only** the following:

- Merge PR #118 into `refs/heads/main` of `ramkivs/iips-review-recovered`, as a regular merge commit (no squash, no rewrite, no rebase), with PR #118's single changed file and no other content.
- Independent remote verification that the amendment is present on `main` at the resulting commit, with byte-identical content (blob `c71661a1ee445b2348cedfedae4aef6449029ebb`).
- Recording the resulting `main` commit in the governing records.

It does **not** authorize Gate A execution, provisioning, implementation, qualification, route admission, durable writes, or any change to the amendment's semantics. Gate A execution remains blocked until the amendment is effective on `main` and independently verified, per IPD decision 2.

## 5. What is NOT requested and NOT authorized by this record

- No merge is performed or claimed.
- No amendment content is changed.
- No IPD file is modified.
- No provisioning, implementation, qualification, admission, or write authority is granted.
- No G24 lineage promotion, merge, cherry-pick, or re-pin.
- No tracker status movement beyond recording this decision request.

## 6. Boundaries preserved

- DP-2 Option 2F remains in force.
- H-18 single-user personal-use scope remains unchanged.
- The IRR HTTP 503 `owner-context-unavailable` fence remains in force.
- Existing `applicationUserId` and tenant-authorization invariants remain unchanged.
- All four Gate V waivers remain waived (not reopened, not presented as technical proof).
- Gate A remains separated from implementation, qualification, route admission, and durable-write authority.

## 7. Exact authority act required from the Program Authority

> **Authorize merge of PR #118 (`docs(g2): IRR DP-1 identity/credential trust amendment`) into `refs/heads/main` of `ramkivs/iips-review-recovered`, as a regular merge commit, followed by independent remote verification of the amendment artifact on `main`.**

Until that act is rendered, PR #118 remains open and Gate A execution remains blocked.

---

*Recording agent: Arena Agent Mode — recording the absence of merge authority and the minimum necessary merge decision request; no authority is rendered or inferred by the agent. The amendment and all historical records are preserved unchanged. No merge is performed or claimed.*
