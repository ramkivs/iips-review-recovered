# IIPS v3.0 — Gate C / P-2: Deposit Source Audit, Four-Artifact Contract Reconciliation and Artifact Disposition Request (`GC-P2-DEPOSIT-SOURCE-AUDIT-01`)

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-REG12-GATE-C-P2-DEPOSIT-SOURCE-AUDIT-AND-ARTIFACT-DISPOSITION-REQUEST-2026-10-14-01` |
| Correction ID | `GC-P2-DEPOSIT-SOURCE-AUDIT-01` |
| Gate / step | **Gate C (`REG-12`) — prerequisite P-2**: evidence-deposit source audit and artifact-contract reconciliation (the durability step of handoff §5.6) |
| Record type | **Read-only audit reconciliation + correction of unsupported claims in existing records + PA disposition request. RENDERS NO AUTHORITY; PERFORMS NO P-2 OPERATION; DEPOSITS NOTHING.** No establishment step rerun; no evidence reconstructed, fabricated or substituted; no key material generated, read or printed; no file staged, committed or pushed on the operator host. |
| Deciding authority | **Ramki** — single owner, sole user and Program Authority of the single-user, personal-use, non-production IIPS platform |
| Recording agent | Arena Agent Mode — read-only verification, reconciliation, record correction preparation and publication only, under the attributed standing authorization |
| Date | **2026-10-14** (Asia/Calcutta) |
| Authoritative repository / ref | `ramkivs/iips-review-recovered` (IRR) / session branch `arena/2b4bc227-iips-review-recovered`, from `main@15c3af7e…` (PR #92 merge) |
| Related open PR | **PR #93** (`arena/47fcd3d3-iips-review-recovered`) — its manifest §5 source-coordinate assertion is already corrected at PR level (correction comment + body notice); its **diff text must still be amended on its head branch before merge** (§7, M3) |
| Governing records | intake manifest `evidence/integration/gate-c-p2-establishment-2026-10-14/MANIFEST.md` (§1–§5); the execution handoff `…_EXECUTION_HANDOFF_ARENA_TO_NON_PRODUCTION_HOST_2026-10-13.md` (§§6.3, 6.5–6.7, 7); the establishment reconciliation `…_ESTABLISHMENT_EVIDENCE_RECONCILIATION_AND_TRANSFER_2026-10-14.md` (§§5.5–5.6); the scope-correction disposition `…_SCOPE_CORRECTION_AND_F5R_DISPOSITION_2026-10-14.md` (§6); tracker §§15.16, 15.19 |
| Status | **SOURCE AUDIT COMPLETE — THREE OF FOUR CONTRACT ARTIFACTS NEVER PRODUCED; GOVERNED TRANSCRIPT EXISTS BUT FAILS THE §1 CONTENT CHECKLIST; DESTINATION COPY IS WRONG-SOURCE; RAW OUTPUTS EXIST AND ARE NOT DEPOSIT ARTIFACTS; DEPOSIT REMAINS INCOMPLETE (0 OF 4 COMMIT-READY; NOTHING STAGED, COMMITTED OR PUSHED). FOUR EVIDENCE-SUPPORTED DISPOSITIONS REQUESTED FROM THE PROGRAM AUTHORITY (§6). P-4 NOT DONE; P-6 NOT GRANTED; P-8 NOT DONE.** |

---

## 1. Purpose, scope, non-goals

**Purpose.** Reconcile the manifest's four-artifact deposit contract against (a) the executed handoff's actual instructions and (b) the raw evidence verified on the designated host; correct the unsupported existence and source-coordinate claims carried by the existing governing records; and place four evidence-supported dispositions before the Program Authority.

**In scope.** Read-only Windows source audit results as operator-transferred (§2.A); Arena-side repository verification (§2.B); the contract reconciliation (§3); the transcript determination (§4); record corrections (§5); dispositions with options (§6); required governance amendments and owners (§7); publication (§9).

**Non-goals (explicit).** No establishment step rerun; no Windows diagnostic re-run; no key generated, read, copied, printed or hashed; no anchor, runtime, database or token operation; no reconstruction or fabrication of the operator summary, the pin provenance or any artifact; no substitution of the alternate transcript; no file staged, deleted or modified on the operator host; no deposit publication; no P-4/P-6/P-8 operation; no IPD write; no fence, route, UI or source change.

## 2. Verification basis

**A. Windows read-only audit (`2026-10-14`, operator-transferred; not Arena-executed).** Designated host; repository `E:\IIPS-MAIN-20261013\iips-review-recovered` on branch `arena/47fcd3d3-iips-review-recovered` (checks PASS). Findings, reproduced without alteration:

1. **Destination copy defect:** the untracked destination file `evidence/integration/gate-c-p2-establishment-2026-10-14/p2-establishment-transcript.txt` matches **`p2-establishment-transcript-2026-10-14-014000.txt`** by SHA-256 — **not** the governed `p2-establishment-transcript-2026-10-14.txt`.
2. **Governed transcript coverage** (20 marker checks against the manifest §1 checklist). **False (10):** `host` (`hostname=`), `pin-tree` (`eb07ea36…`), `rev-parse`, `ACLs` (`ACL-DIR`), `tooling-hashes` (`TOOLING`), `D1` (`D1_EXIT`), `D1b` (`D1B`), `F2`, `F3` (`F3_POSITIVE`), `F4` (`F4a`). **True (10):** pin-commit string (`6828155e…`), `TSC_EXIT`, `TSC_ERRORS`, `D2` (`PERSISTENCE_CONFIGURATION_INVALID`), anchor startup JSON (`P2_ANCHOR_LISTENING`), runtime startup JSON (`P2_SCOPED_RUNTIME_LISTENING`), `F1` health, F5.2-as-observed (`OIDC_KEY_UNAVAILABLE`), loader matrix, runtime listing (`portfolio.sqlite`). Marker presence is **not** treated as evidence of establishment success; the result is used only for content-contract comparison.
3. **Companion artifacts:** `p2-establishment-result.txt`, `p2-pin-provenance.txt`, `p2-anchor-key-public.json` — **absent from the source evidence directory (`$ev`) and from the destination.**
4. **Raw execution outputs present in `$ev`:** `c-tsc.log`, `e-keygen.json`, `e-anchor.log`, `e-runtime.log`, `f-loader.json`. The preliminary private-material scan of `e-keygen.json` **does not authorize** publishing it or treating it as the public-JWK artifact (§6.4).
5. **Git:** only the untracked destination transcript; **no commit; no push.**

**B. Arena-side repository verification (read-only, this session).** `origin/main` = `15c3af7e…`; the evidence folder holds `MANIFEST.md` alone (blob `38cbe6a9…`); no deposit artifact exists in any local ref or open PR (PR #93 carries exactly two documentation files); no PR other than #93 is open; this session's branch was clean at `main@15c3af7e…` before this record. The PR #93 correction (refutation of its §5 "already carry their destination names" assertion) is recorded in its correction comment and body notice, posted earlier today.

## 3. Contract ↔ executed instruction ↔ actual evidence

| # | Contract artifact (manifest §1, content as specified) | Instruction in the **executed** handoff that would produce it | Actual evidence | Reconciled finding |
|---|---|---|---|---|
| 1 | `p2-establishment-transcript.txt` — raw Start-Transcript capture of Blocks A–F: **host, pin, ACLs, tooling hashes, TSC_EXIT/TSC_ERRORS, D1/D1b/D2, anchor + runtime startup JSON, F1–F4 results, F5.2 as observed** | §6.7 `Start-Transcript -Path "$ev\p2-establishment-transcript-<yyyy-MM-dd>.txt" -Append` | governed file exists; **10 of 20 coverage checks False** (§2.A.2); destination holds the **alternate** file's bytes | **File exists; content contract NOT satisfied; destination copy wrong-source** |
| 2 | `p2-establishment-result.txt` — operator-authored factual result summary | **none** — no executed record ever instructs this file (handoff §7 returns the transcript plus the five raw outputs only) | absent from `$ev` and destination | **Never produced** — the name first appears in the 2026-10-14 intake manifest |
| 3 | `p2-pin-provenance.txt` — `git rev-parse HEAD` / `HEAD^{tree}` / `status --porcelain` from the pinned checkout | **none** — Block A prints these to the console only; no redirect exists in any block | absent as a file; `rev-parse` and `pin-tree` markers **False** in the governed transcript (the establishment-time carrier is **not located**) | **Never produced as a file; no in-transcript carrier found** |
| 4 | `p2-anchor-key-public.json` — Block E key-generation JSON, **public fields only** | §6.5 writes `$ev\e-keygen.json` (tooling §6.0 prints `kid`, `keyPath`, `modulusBits`, `publicJwkSha256`, `publicJwk` — never private bytes) | raw source **exists** (`e-keygen.json`); no destination-named file | **Named artifact never produced; raw source exists and is not self-authorizing** |
| — | five raw outputs + both transcripts (source evidence) | §§6.3, 6.5–6.7 | present in `$ev` | **Never deposit content** (manifest §1–§2; PR #93: "copy only the four") |

**Reconciliation determination.** The four-artifact set was defined by the intake manifest **after** the establishment run; the executed handoff contains **no instruction that creates artifacts 2, 3 or 4 under their contract names**. The deposit therefore never had a completed staging step, and the three files were **never produced anywhere that has been searched** — not "waiting elsewhere on the host", a branch, or a PR (all checked). The manifest's post-publication statements that all four "exist only on the operator's designated host" (§4/§5), the reconciliation §5.5 "Still confined to Windows" table rows for artifacts 2–4, the disposition §6 existence sentence, and tracker §15.19's existence sentence are **refuted-in-part** and are corrected per §5.

## 4. Transcript determination

1. **Coordinate (unchanged):** the deposit source is **`p2-establishment-transcript-2026-10-14.txt`** (handoff §6.7; PR #93 manifest §5 `<yyyy-MM-dd>` coordinate). The `…-014000` file matches no governing coordinate; its provenance is unestablished; **it is not a permitted substitute.**
2. **Content:** the governed transcript satisfies only the TSC/TSC_ERRORS, D2, anchor/runtime startup JSON, F1, F5.2-observed, loader-matrix, runtime-listing and pin-commit-string elements of the manifest §1 checklist; **host identity, Block A pin verification (`rev-parse`/tree), ACL listings, tooling hashes, D1/D1b and F2–F4 are absent.** It is therefore **not** the complete Blocks A–F capture the contract defines.
3. **Destination:** the untracked copy is wrong-source (§2.A.1). It must not be committed; its replacement belongs to an authorized staging step, using whichever source the PA designates under §6.1.
4. **The alternate transcript** may be read (a coverage audit of it is legitimate evidence location) but **may not be deposited under the contract name without an explicit PA coordinate amendment** — substitution is prohibited.

## 5. Corrections to governing records (`GC-P2-DEPOSIT-SOURCE-AUDIT-01`)

| Record / passage | Claim now refuted | Corrected statement |
|---|---|---|
| Manifest §4 "Still Windows-only: artifacts 1–4" | artifacts 2–4 exist Windows-side | refuted-in-part: only the transcript exists (content-incomplete); 2–4 never produced — manifest §6 (this PR) |
| Manifest §5 "the four artifacts exist only on the operator's designated non-production host" | all four exist | refuted-in-part, same basis — manifest §6 (this PR) |
| Reconciliation §5.5 rows for `p2-establishment-result.txt`, `p2-pin-provenance.txt`, `p2-anchor-key-public.json` | confined to Windows | never produced as files — correction pointer at §5.5 (this PR) |
| Disposition §6 "the artifacts exist only on the operator's designated host (… result summary, pin-provenance output and public key JSON)" | those three exist | refuted-in-part — correction pointer at §6 (this PR) |
| Tracker §15.19 deposit paragraph existence sentence | the four exist on the host | refuted-in-part — superseded by tracker §15.20 (this PR) |
| PR #93 manifest §5 "the other three already carry their destination names" | three named files in `$ev` | refuted; corrected at PR level (comment + body notice); **diff text must be amended on its head branch before merge** (§7, M3) |

## 6. Evidence-supported dispositions (requested from the Program Authority)

> Each disposition below is a **determination on the evidence plus the option set**; rendering any of them is a **Program Authority act**. Nothing here is executed by the agent; the interim status of every artifact is **not depositable**.

**6.1 Artifact 1 — transcript. Interim: BLOCKED (content contract unmet; wrong-source destination copy).** Evidence: §4. Options for the PA: **(A)** accept the governed transcript **as it exists** as the artifact of record and amend the manifest §1 content definition to the reality of the capture (honest reclassification; no content is added to any file); **(B)** after a read-only coverage audit of the alternate transcript, **explicitly amend the source coordinate** to it (making the earlier copy correct) — substitution without this amendment remains prohibited; **(C)** record artifact 1 as contract-failed and redesign the deposit set. No option involves re-running Block G or re-capturing the run.

**6.2 Artifact 2 — operator result summary. Interim: ABSENT (never produced; agent will not author it).** Evidence: §3 — no instruction ever created it; the contract itself defines it as **operator-authored**, i.e. an after-the-fact statement by construction. Options for the PA: **(A)** the **operator personally authors** the factual, dated summary (explicitly labeled as authored after the run; content limited to the already-transferred facts — F5.2 as observed, shutdown verification, the not-done list); **(B)** record **never-produced** and amend the manifest §1 set accordingly. Agent authorship in any form = fabricated evidence and is prohibited.

**6.3 Artifact 3 — pin provenance. Interim: ABSENT (never produced; establishment-time carrier not located).** Evidence: §3 — no file instruction existed; `rev-parse`/`pin-tree` markers are False in the governed transcript. Options for the PA: **(A)** authorize a **read-only location pass** over the alternate transcript and the raw outputs for the Block A lines, and if found, authorize their **verbatim, labeled extraction** as the artifact (non-silent, provenance-noted); **(B)** authorize a **labeled, dated post-run read-only re-capture** from the pinned checkout (present-day provenance — explicitly *not* establishment-time capture); **(C)** record **never-produced** and amend the set. Silent reconstruction or agent-initiated extraction/re-capture is prohibited.

**6.4 Artifact 4 — anchor key public JSON. Interim: SOURCE-ELIGIBLE, NOT AUTHORIZED.** Evidence: §3/§2.A.4 — `e-keygen.json` exists; the preliminary private-material scan **does not authorize** anything on its own. Preconditions before any staging: **(A)** a **recorded read-only verification** that the file contains only the §6.0 public fields and no private material (field-level result only; no values printed); **(B)** **express PA authorization** to stage it as a **byte-identical** copy under the contract name (no filtering, no editing); **(C)** the manifest §5/§7 wording corrected to describe staging from the raw source instead of the refuted "already carry their destination names" premise. Absent (A)+(B)+(C): disposition is **(D) never-produced** like artifacts 2–3, with the set amended accordingly.

**6.5 Deposit status.** **INCOMPLETE — 0 of 4 commit-ready.** No staging, no deletion of the wrong-source untracked copy, no commit, no push, no partial publication, until the PA renders §6 and the authorized staging is executed and blob-verified.

## 7. Required governance amendments and authorized owners

| # | Amendment | Owner |
|---|---|---|
| **M1** | Record corrections of §5 (this record; manifest §6; pointers at reconciliation §5.5 and disposition §6; tracker §15.20) | **Prepared by Arena** (this session's branch/PR); **effective on PA merge** |
| **M2** | The **four artifact dispositions** of §6 — including any manifest §1 content/coordinate/set change and any resulting transport-text change | **Program Authority exclusively** (Arena transcribes and prepares the follow-up text after rendering) |
| **M3** | Amendment of **PR #93's** manifest §5 diff text (head branch), or close-and-reissue of PR #93 with corrected coordinates | **Program Authority directs the head-branch owner** — this session cannot push to `arena/47fcd3d3-iips-review-recovered` |

Merge-order note: this PR and PR #93 both append to `MANIFEST.md` and the tracker; the second one merged rebases trivially. Recommended order: **this correction first** (PR #93's amendment then lands against corrected coordinates).

## 8. Boundaries preserved

`/api/user-portfolios*` remains fail-closed at HTTP `503 owner-context-unavailable`; `/api/reports*` unchanged; Option 2F refusal unchanged; fence blobs `98147054…`/`51704c12…`/`cb8db45d…` and F-3 carrier/resolver unchanged; F5.2 preserved **UNRESOLVED** (not reclassified; `GC-P2-SCOPE-CORR-01` unchanged); F5R stays CLOSED — OUT OF SCOPE; no key, issuer, anchor, runtime or database operation; no token minted; no P-4 provisioning, no P-6 authority, no P-8 qualification; no IPD write; NP-04/G24 lineages unmerged; no route/UI activation; Gate A OPEN; Gate B Option C; R3 OPEN; R4-B CLOSED; `P2`/`P3` OPEN. **No runtime, deployment or production readiness is claimed anywhere.**

## 9. Publication

Additive documentation-only change on session branch `arena/2b4bc227-iips-review-recovered` (from `main@15c3af7e…`): this record (new); manifest §6 (new section); correction pointers at reconciliation §5.5 and disposition §6; tracker header `Last Updated` clause and §15.20 (new). No code, test, pin, lockfile, schema, fence, transport, route, UI, tooling or runtime change; no IPD write; no operator-host file touched. Published as one PR for PA review; publication coordinates are recorded post-merge, never self-embedded.

*Status: **`SOURCE AUDIT COMPLETE — ARTIFACTS 2/3 NEVER PRODUCED; ARTIFACT 4 SOURCE EXISTS BUT NOT AUTHORIZED; ARTIFACT 1 CONTENT CONTRACT UNMET + WRONG-SOURCE DESTINATION COPY; CLAIM CORRECTIONS PREPARED (M1); FOUR DISPOSITIONS REQUESTED FROM THE PA (M2); PR #93 AMENDMENT OWNED BY PA-DIRECTED HEAD SESSION (M3); DEPOSIT INCOMPLETE — 0 OF 4, NOTHING STAGED, COMMITTED OR PUSHED; P-4 NOT DONE, P-6 NOT GRANTED, P-8 NOT DONE`.***
