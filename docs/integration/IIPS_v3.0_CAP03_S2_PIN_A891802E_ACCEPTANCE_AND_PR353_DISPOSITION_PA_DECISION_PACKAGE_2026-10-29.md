# CAP-03 — PA Decision Package (`PREPARED — NOT ADOPTED`): S2 formal acceptance at pin `a891802e`, PR #353 disposition, and publication-integrity findings (2026-10-29)

**Classification.** PA **ruling preparation only**. This document makes no PA decision, renders no acceptance, grants no authorization, designates no commit, moves no gate, and does not merge or alter any pull request. Every "recommended" line is a recommendation, not a ruling. Prepared in IRR `ramkivs/iips-review-recovered`; IPD `ramkivs/iips-production-market-data` touched read-only; no Windows-host operation of any kind.

**Required status (unchanged, exact).** P-1-C NOT ESTABLISHED. P-1-D DESIGNATED, NOT VERIFIED FOR THE ATTEMPT. P-1 NOT EXECUTED / UNSPENT / NOT AUTHORIZED. `V1295` endpoint binding NOT MET. QE 0/11. Gate 4 AUTHORIZED — NOT STARTED. Gate 5 NOT INITIATED / NOT ADMITTED. H-12 NOT ADOPTED (R5 is a validated candidate, not an adoption). DQ-4 freeze NOT ESTABLISHED. All twelve 503 fences and `WRITE_NOT_AUTHORIZED` semantics intact. Production: out of scope.

**Epistemic labels used below.** `VERIFIED` = re-read by this pass from the remote or from committed objects; `RECORDED` = supported by the published evidence or an authoritative record, not re-derived here; `UNVERIFIED` = cannot be established from this pass's authority or reach; `PROPOSED` = offered choice; `RESERVED` = PA-owned decision.

## 1. Verified current state (read back 2026-10-28/29 UTC)

| Item | Value | Basis |
|---|---|---|
| IRR `main` | `a130785528f6474be9b4541fef3b61158fefe900` (PR #354 merge, 2026-10-28T20:04:49Z; parents `82b3f4a` + `52b878c`) | `VERIFIED` — `git ls-remote`, fetch, read-back |
| PR #354 checks | exact-head CI run `40759803728` `pass`; post-merge `main` check-run `123069179533` `success` | `VERIFIED` — GitHub Actions API |
| S2 evidence locus | branch `docs/g3-d0-registration-2026-10-18` tip `2cc5bc4302436f8ae6d84a9e657b8c1ed06b5478`, unchanged; 18 evidence-only paths; parent `f78f08e`; **0 CI check-runs** | `VERIFIED` — ls-remote + Contents API digest read-back |
| Evidence integrity (this pass re-run) | seal `SHA256SUMS.txt` published bytes reproduce `9D3C09DB…B5225E`; digest classification `2 as-stored / 13 CRLF-restored / 1 run-log unreproducible`; all cross-values match | `VERIFIED` — `02-verification-rerun.txt` in `evidence/integration/cap03-s2-pa-package-2026-10-29/` |
| Verification folder on `main` | `evidence/integration/cap03-s2-a891802e-publication-verification-2026-10-28/` (5 paths); verifier blob `0FDB3EF5…` equals its own published `SHA256SUMS.txt` line | `VERIFIED` — Contents API at `a130785` |
| PR #353 | `OPEN`, head `ed020b0976b23897c73d33a75a0b6476e7b9976e` (advanced from `45095458…` at 20:01:08Z), 26 commits, base `main`, head CI run `40759493433` `pass`, GitHub mergeability `UNKNOWN` at read time | `VERIFIED` — `gh pr view` / `gh pr checks` |
| PR #353 scope | only `docs/integration/**`, `evidence/integration/**`, `handoff/**`, and the tracker; zero application-source paths | `VERIFIED` — diff census at `ed020b09` |
| Run-record document | `docs/integration/IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_RECORD_2026-10-28.md` exists at PR #353 head; **not on `main`** | `VERIFIED` |
| Procedure linkage | `.ps1` at PR #353 head: SHA-256 `BE952E25622B033B875C0B61DEB4C124BA75B0CA61B5E74CABCDC11430563249`, 40,274 B, 890 lines, CR count 0 — byte-identical to the procedure hash recorded in run record §1/§4.6 (LF-canonical file, so no CRLF ambiguity) | `VERIFIED` (branch side). The host-side hash match was an operator precondition (`RECORDED` in the run record); `UNVERIFIED` from this sandbox |
| IPD | `main` = `c3cfb7e690aefd2ceb0a8323052c9a6f38f4a032`; `a891802e…`/`76f083d7…` remains a strict ancestor (main 18 ahead of pin, pin 0 ahead of main) | `VERIFIED` — read-only remote checks |
| Windows originals | documented location `C:\iips-evidence\cap03-s2-a891802e\s2-a891802e-20261028T192516Z` + sibling `…seal-recheck.txt`; retention is required by the run record §6 return list | `RECORDED` location; `UNVERIFIED` existence — this pass neither accesses nor requests access to the host filesystem |

**CI-scope caveat (explicit).** PR #354's green CI validated the *governance record* merged at `a130785` (tracker + verification folder). It is **not**, and is not represented as, CI validation of the evidence commit `2cc5bc4`, which has no CI of its own (`F-A-2`).

## 2. Decision item 1 — formal S2 acceptance at the designated pin (`Q-S2-1` remainder, incl. `D1`)

**The question reserved to the PA.** Does the fresh native Windows run `s2-a891802e-20261028T192516Z` at the designated pin, as published and verified, constitute **formal S2 acceptance** at `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` / `76f083d7058e170d8212455c03bad1033136ee68` — and does it close the `D1` remainder ("closure needs host-original evidence not in the repository", PA rulings record pass 2) — or must acceptance await a PA-directed host-original read-back?

**Established by the run's own evidence (`RECORDED`, integrity `VERIFIED`):** all six procedure steps exit 0 at the pin on `DESKTOP-NO0NHTP` (non-elevated, Windows 11 build 26300, Node `v22.16.0`, npm `10.9.2`); guard `930` executed / `926` passed / `0` failed / `0` cancelled / `4` skipped = the four POSIX-only names; all Windows named-pipe tests `ok`; dist count `1,140` = expected with before/after distribution lists byte-identical; package-consumer `"result": "PASS"`; pack shasum `cc2aa70186b8fd7bc7255452ac8d8b00d094f53e` = reference; post-run HEAD/tree = designated pin, clean tree; `RESULT.txt STATUS: PASS`; folder sealed with `SHA256SUMS.txt` (published bytes byte-reproduce the seal `9D3C09DB…`), both rechecks 16/16 `OK`, zero issues, folder published under its final name.

**Not established by the run, and not by this package:** host-byte identity of the Git-stored transcript copies (see §3); any endpoint/store binding (`V1295` remains NOT MET); QE; Gate 4/5; `G14`; H-12 adoption; P-1; PF-15/S3; DQ-4; fences; production eligibility. Acceptance, if rendered, covers the five S2 commands and their recorded counts at the pin — nothing wider.

**Criteria-conflict check (required by the task, surfaced not overridden):** the `§16.138`-era acceptance vocabulary (nine required filenames, "47-entry" verification) belongs to the 2026-10-26 verification tooling and its `001c3c80` candidate-scoped basis. The fresh run was governed by the run record's `PASS` definition (14 required artifacts + `RESULT.txt`, seal, both rechecks clean, publication under the final name) — the design the PA sat in on for the pin run. No effective authority requires the 47-entry output *of this run*; `R-1` stays a separate unwaived residual of the 2026-10-26 track. There is therefore no silent criteria override in choosing either option below.

### Option A — Conditional acceptance `PROPOSED`

PA accepts the technical S2 result at the pin, conditioned on all of:
- **A-i** the accepted record is `RESULT.txt` `PASS` as sealed by `9D3C09DB…` at `2cc5bc4`, read back in `§16.180` + `evidence/integration/cap03-s2-a891802e-publication-verification-2026-10-28/`;
- **A-ii** acceptance is *content-level*: the Git copies are LF renderings of the host captures whose digests reproduce under CRLF restoration; the **Windows originals remain the byte authority** and their retention is an operator obligation; the `s2-00-run-log.txt` digest is accepted as *not reproducible from Git bytes* (see §3 limits) and reliance is placed on the host original for it;
- **A-iii** scope fence stated verbatim in the acceptance record: five commands + counts at the pin only; `V1295`/QE/Gates/`P-1`/`H-12`/`PF-15`/fences unmoved;
- **A-iv** the acceptance record is a separate PA act (prepared through the ordinary IRR PR route); this package does not draft it.

### Option B — Defer formal acceptance `PROPOSED`

PA retains the technical `PASS` finding as evidence, but withholds formal acceptance until a **PA-directed, bounded host-original read-back** is recorded: the operator zips the host folder + transcript as already required by run record §6, hashes are recomputed against the seal, and the result is deposited through the governed workflow. No S2 re-run; no new capture; a read-back of what already exists on the host. `D1` then closes on the read-back rather than on the LF-rendering argument.

### Evidence on each side

For A: the seal file itself is byte-exact in Git; 15/16 digests reproduce at full confidence; every substantive value cross-validates; the defect class has an adjudicated precedent (`§16.149`; R-2 "LF rendering of the same content"); a re-run is prohibited and a full read-back re-imposes host toil. For B: the run-log digest is the one artifact whose exact host bytes are not reconstructible from Git; `D1`'s wording demands host-original evidence rather than a reconstruction argument; the direct-push/0-CI deposit posture (`F-A-2`) leaves custody split. Both options are available on the record; neither moves any gate.

## 3. `F-A-1` integrity assessment — exact scope (preserve these distinctions)

| Class | Artifacts | Verified | Limit of proof |
|---|---|---|---|
| Stored LF at creation | `RESULT.txt`, `MANIFEST.json` | Git bytes reproduce the recorded digests as-stored | — |
| CRLF capture, all-LF in Git | the 13 captured transcripts (`01`, `01b`, `02`, `03`, `04`, `05`, `05b`, `06`, `s2-01c`, `s2-04b`, `s2-04c`, `s2-08`, `s2-08b`) | recorded digest reproduces exactly when every LF is restored to CRLF; byte sizes match `stored + lines` | establishes **content-line identity modulo uniform line-terminator restoration**, nothing more; it is not a byte-identity claim against the host file |
| CRLF/LF mixed on host | `s2-00-run-log.txt` | recorded size `3,916 = 3,876 stored + 42 lines − 2` fits the model "40 CRLF + 2 already-LF lines"; every field cross-matches `MANIFEST.json`, `RESULT.txt`, step files and the transcript | the **positions** of the two LF line endings are not recoverable from the published copy; the recorded digest **cannot be reproduced from Git bytes alone**; the prior verification's "no content-line alteration detected" stands at that confidence and is **not** proof of full byte identity |

**Preserved statements.** The Windows originals remain the byte-authoritative source; Git blob bytes ≠ host-original bytes for the 14 transcript artifacts; no claim to the contrary appears anywhere in the record; nothing was regenerated or normalized further by this pass; the seal `SHA256SUMS.txt` is the one artifact whose Git bytes are exactly the host bytes. The console print (seal SHA) is unobtainable independently by design — the transcript carries it and the Git seal matches it.

## 4. Decision item 1b — raw-folder deposit: requirement status and explicit choice

**Governing records.** Run record §6 status table: `PASS` → "Deposit the evidence through the governed workflow (IRR PR; CI; read-back)." Precedent: the 2026-10-26 raw evidence was so deposited (PR #310 → `47133fe4…`, green CI; `§16.144`). Countervailing instruction: the admission pass was directed to create **no second copy** of the package and to treat the publication as complete; it consequently recorded the publication + verification without moving the folder to `main` (`F-A-2`).

**Determination from the records:** the *obligation to deposit through the governed workflow* is **expressly required** by the procedure text; its *satisfaction mode* under current facts is **UNRESOLVED** (branch-anchor + verification record vs. a byte-verbatim main deposit PR). This package resolves neither — it puts the choice to the PA.

- **Choice D-A — require a separately governed deposit.** A future bounded IRR PR copies `evidence/cap03-s2/s2-a891802e-20261028T192516Z/` + transcript from `2cc5bc4` **as-is, blob-identical, no regeneration** (a copy, not a re-publication of new bytes), through PR + CI + read-back; optionally paired, in its own scope, with the established `-text`/`text eol=lf` `.gitattributes` protection for future CRLF captures (`§16.149` precedent; deliberately **not** bundled anywhere in this pass). Implications: single-tree custody and reproducible per-blob read-back on `main`; CI coverage cures `F-A-2`; cost ~5 MB of duplicate blobs in `main` history.
- **Choice D-B — accept the branch anchor.** Register a dated residual (continuing the `R-1`…`R-4` style: e.g. `R-5`): "raw folder published at `docs/g3-d0-registration-2026-10-18@2cc5bc4`, direct push, no CI; Git copies are LF renderings; host originals are byte authority," with `§16.180` + the verification folder as the compensating record. Implications: no duplication; custody split across two refs; reproducibility rests on the verification folder + retained host originals; `F-A-2` stands as an accepted residual rather than a cured defect.
- Reproducibility, integrity and custody consequences of each are tabulated above from the verified state; nothing here pre-empts the PA.

## 5. Decision item 2 — PR #353 disposition

**Verified at read time:** `OPEN`; head `ed020b09…` (advanced at 2026-10-28T20:01:08Z from `450954589c…`); 26 commits on `main`; head CI `pass` (`40759493433`); GitHub mergeability `UNKNOWN` at read time; local three-way merge forecast unavailable (sandbox clone is shallow, grafted at `a130785` — stated limitation, not concealment). Change scope: documentation + evidence + procedure + contract tests only; **zero application source**; no IPD paths.

**Relationship to the published evidence:** the run used this PR branch's procedure (hash identity `VERIFIED`, §1). Its run-record document supplies the manifest's `record` reference — a **cross-ref dependency**: `MANIFEST.json` → record file → resolvable on `arena/b776c15a-iips-review-recovered` head only, not on `main` or the evidence branch. The `record` reference is therefore *clearly identified as a cross-ref dependency* (this satisfies the manifest-resolution check; no action can make the immutable manifest resolve on `main` by itself).

**Identifier-collision ledger (verified fact; disposition reserved):** the merged record owns `§16.180` / `CV-CORR-160` / `CHG-2026-10-29-02` / `V1311–V1322` (merged 20:04:49Z). PR #353's new head claims the **same identifier set for different content** ("outstanding corrections A–E", commit authored 19:42:08Z, pushed 20:01:08Z; no reference to PR #354 / `a130785` / `2cc5bc4` on their head — a racing claim, not a copy). `main` carries exactly one `§16.180` today. Merging `ed020b09` as-is would create a duplicate `§16.180`/`CV-CORR-160` pair in the tracker. Per the repository's own corrections practice, **merged identifiers hold; the unmerged side renumbers through its own flow** — their post-rebase section should take the next free number at that time (`§16.182`+, `CV-CORR-162`+ — `§16.181`/`CV-CORR-161`/`CHG-2026-10-29-03`/`V1323`–`V1331` are claimed by this package's pointer section; `V1332`+ expected free). This pass modifies nothing on PR #353.

**Run-record status treatment (required if/when merged).** The document's header "Status: PREPARED — NOT EXECUTED. No native S2 result exists for this pin." is superseded **as current state** by `§16.180` and the run of record. The minimal correct treatment — the style already used at their own `§16.179` annotation — is a **dated additive overlay line** pointing to `§16.180` + `2cc5bc4` and stating that the header text is historical. **A prepared run record must never be presented as evidence that execution occurred**, and the overlay must not rewrite the historical body, must not conflate this pin run with the 2026-10-26 failed baseline or the earlier `NOT EXECUTED` dispositions, and must not turn the document into an acceptance record (acceptance stays `RESERVED`, §2). The overlay belongs to PR #353's own flow (or a successor correction pass), not to this package.

**Conflict/collision risk summary for any merge:** ≥4 near-certain textual conflicts (Last Updated row; CHG-table insertions; header rows around line 16 — PR #353 amends the row-16 cell while `main` has since added an adjacent row; end-of-file section appends overlapping with `§16.180`/`§16.181`), plus the identifier conflict above. A rebase-and-reconcile pass by the PR #353 flow, with CI re-run at the new head, is a prerequisite for merge in every scenario.

**Disposition options `PROPOSED`:** (i) **authorize merge** contingent on the rebase, renumbering, additive run-record overlay, and fresh CI; (ii) **hold** until the §2 acceptance ruling and §4 deposit choice are rendered (their sections encode pre-run designations and rulings that interlock with acceptance); (iii) *not recommended* — partial cherry-picks (fragments their `V1226`–`V1322` chain and creates half-records). **Recommendation (recommendation only):** (ii) → then (i), executed in the sibling's flow.

## 6. Recommended PA resolution (clearly marked; not a decision)

1. **§2 — Acceptance:** Option **A** with conditions A-i…A-iv, *or* Option **B** if the PA weighs the run-log byte-limit and the `D1` wording as requiring physical read-back. Rationale for A: every substantive value is corroborated through independent channels (seal self-hash, TAP re-parse, IPD CI reference at the pin, procedure-hash identity); the unreproducible item is one run-log digest whose *content* cross-validates; precedent treats LF renderings at the presentation level.
2. **§4 — Deposit:** D-B now (residual `R-5`, no duplication), with D-A available as a later optional bounded act if single-tree custody is preferred. Rationale: the run was directed to stop at the branch publication; D-A remains fully openable later without re-running anything.
3. **§5 — PR #353:** hold pending rulings 1–2; then merge only after the sibling flow rebases, renumbers its colliding `§16.180` claims, and adds the dated overlay to the run-record header; fresh CI at the new head. No merge by this pass, by PA inference, or by any other route short of an explicit PA merge authorization.
4. **Future, separately scoped:** `.gitattributes` protection rules for CRLF host captures (per `§16.149` precedent) — its own evidence and PR; deliberately absent from this package.

## 7. Gate-preservation and non-movements

No acceptance rendered; no PR merged (this pass merged **nothing** — the pointer record for the package travels as its own ordinary documentation PR and pre-declares no outcome of §2/§4/§5); no run-record status changed by this pass; no S2 re-run; no evidence file touched, re-copied or regenerated; no `.gitattributes` change; no host filesystem access attempted; no IPD write (remote checks read-only); no gate, pin, QE, `V1295`, `P-1`, `PF-15`, `H-12`, DQ-4, fence, or production movement; no retroactive CI claim for `2cc5bc4` from PR #354's checks.

## 8. Evidence index

| Ref | Path / identity |
|---|---|
| Run of record + seal | `docs/g3-d0-registration-2026-10-18 @ 2cc5bc4302436f8ae6d84a9e657b8c1ed06b5478` : `evidence/cap03-s2/s2-a891802e-20261028T192516Z/` + `….seal-recheck.txt`; seal SHA-256 `9D3C09DBDB691C2527A45605DEA20826B4EC2BA2F110985EE3F1033783B5225E` |
| Admission/verification record | `main @ a130785` : tracker `§16.180` (`CV-CORR-160`, `CHG-2026-10-29-02`, `V1311`–`V1322`); `evidence/integration/cap03-s2-a891802e-publication-verification-2026-10-28/` (re-runnable verifier `0FDB3EF5…`) |
| This pass's read-backs | `evidence/integration/cap03-s2-pa-package-2026-10-29/01-state-and-collision-readback.txt`, `02-verification-rerun.txt` (+ sealed `SHA256SUMS.txt`) |
| PR #353 (read-only) | `https://github.com/ramkivs/iips-review-recovered/pull/353`, head `ed020b0976b23897c73d33a75a0b6476e7b9976e`; procedure blob `docs/integration/IIPS_v3.0_CAP03_S2_PIN_A891802E_WINDOWS_RUN_2026-10-28.ps1` = `BE952E25…` (40,274 B) |
| Historical baseline | `§16.141`–`§16.144` (2026-10-26 chain, failed baseline + candidate-scoped acceptance, residuals `R-1`–`R-4`); non-authoritative recovery `evidence-cap03-s2-original-recovery-20261028 @ e43476eb` (archive `86C46B79…`) — all preserved, distinct, unmodified |
| IPD pin | `ramkivs/iips-production-market-data` `a891802e2691bd9c65a67d6abff20d8ce0c26d7d` / tree `76f083d7058e170d8212455c03bad1033136ee68`; strict ancestor of `main@c3cfb7e6…`; reference CI check run `122656474278` success at the pin |

*Prepared 2026-10-28T20:16–20:35Z (2026-10-29 IST). End of package. No decision rendered anywhere in this document.*
