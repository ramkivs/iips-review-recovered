# Gate C / P-2 — Establishment Evidence Destination (intake manifest)

**Record:** `IIPS-V3-REG12-GATE-C-P2-ESTABLISHMENT-EVIDENCE-MANIFEST-2026-10-14-01`
**Destination repository:** `ramkivs/iips-review-recovered` (IRR) — **the only destination; IPD is not written**
**Destination branch (transport):** the session branch current at deposit time, `arena/63a310bc-iips-review-recovered` (PR #96); the unchanged Windows-reported transfer commit was also present on `arena/2b4bc227-iips-review-recovered`. Use the PR workflow; never push directly to `main`.
**Reconciled by:** [`docs/integration/IIPS_v3.0_GATE_C_P2_ESTABLISHMENT_EVIDENCE_RECONCILIATION_AND_TRANSFER_2026-10-14.md`](../../../docs/integration/IIPS_v3.0_GATE_C_P2_ESTABLISHMENT_EVIDENCE_RECONCILIATION_AND_TRANSFER_2026-10-14.md)
**Handoff being evidenced:** [`docs/integration/IIPS_v3.0_GATE_C_P2_EXECUTION_HANDOFF_ARENA_TO_NON_PRODUCTION_HOST_2026-10-13.md`](../../../docs/integration/IIPS_v3.0_GATE_C_P2_EXECUTION_HANDOFF_ARENA_TO_NON_PRODUCTION_HOST_2026-10-13.md) (Blocks A–G; corrections `…-D1-CORR-01`, `…-F5-CORR-02`)

---

## 1. What belongs in this folder

**Amended by PA disposition `GC-P2-DEPOSIT-DISPOSITION-01` (§7, `2026-10-14`): the required deposit set is exactly ONE artifact (raw, unedited, byte-for-byte from its governed source).**

| # | File | Content (as amended) | Secret-bearing? |
|---|---|---|---|
| 1 | `p2-establishment-transcript.txt` | the raw `Start-Transcript` capture **exactly as captured on the designated host**, deposited byte-for-byte from the governed source `p2-establishment-transcript-<yyyy-MM-dd>.txt` (`p2-establishment-transcript-2026-10-14.txt`, handoff §6.7). **Verified actual coverage (source audit `2026-10-14`) — present:** `TSC_EXIT`/`TSC_ERRORS`, D2 (`PERSISTENCE_CONFIGURATION_INVALID`), anchor + runtime startup JSON, F1 health, F5.2 **as observed**, loader-matrix summary, runtime listing, pin-commit string. **Absent:** host identity, Block A pin verification (`rev-parse`/tree), ACL listings, tooling hashes, D1/D1b, F2–F4. **This deposit makes NO claim of complete Blocks A–F coverage**; it is accepted as the raw transcript as captured, with these limitations stated here. The off-coordinate `…-014000` transcript is **not** part of the set and may not be substituted. | **no** |

**Removed from the required deposit set by `GC-P2-DEPOSIT-DISPOSITION-01` (§7) — preserved here as disposition history; no reconstruction, rename, copy or substitute may stand in for them:**

| Former # | File | Disposition |
|---|---|---|
| 2 | `p2-establishment-result.txt` | **NEVER PRODUCED** — no executed instruction creates it; **removed from the required deposit set** |
| 3 | `p2-pin-provenance.txt` | **NEVER PRODUCED AS A FILE** — no executed instruction creates it; no in-transcript carrier located; **removed from the required deposit set** |
| 4 | `p2-anchor-key-public.json` | **NEVER PRODUCED UNDER THE REQUIRED NAME** — `e-keygen.json` is **NOT** renamed or copied to stand in; it remains host-side source evidence and never deposit content; **removed from the required deposit set** |

## 2. What must never be placed here (or in any record, log, branch or artifact)

Private key bytes or any value derived from them; `.pem` files; bearer tokens (the minted token is assigned to a variable, never echoed or written); credentials; `e-keygen.json` in any form that contains private material; anything under `%USERPROFILE%\.iips-gate-c-p2\anchor\keys\`. Custody stays on the operator host (`R-2.7`; worksheet §4.7).

## 3. Integrity rule

Integrity is carried by **ordinary Git verification** — the recorded blob SHA of each file on the pushed branch, compared by Arena against the remote contents. No separate hash manifest, archive or checksum file is required for the amended deposit set (§1/§7).

## 4. Status at publication of this manifest

- **Deposited by the operator:** nothing yet — this folder is the declared destination and is published ahead of the evidence transfer so the transfer target is unambiguous and durable.
- **Durable today:** the reconciled record (`docs/integration/…RECONCILIATION_AND_TRANSFER…`), this manifest, tracker §15.16, and the handoff + corrections on the session branch.
- **Still Windows-only:** artifacts 1–4 above, plus the operator transcripts, `e-keygen.json`, `e-anchor.log`, `e-runtime.log`, `c-tsc.log`, `f-loader.json`.
- **Unresolved by design:** the F5.2 result remains **UNRESOLVED** — not PASS — and the one remaining establishment action (F5R, per handoff §6.6 as corrected) is recorded in the reconciliation record §6.

---

## 5. Status update (`2026-10-14`) — `GC-P2-SCOPE-CORR-01`

The Program Authority's scope correction (disposition record: [`docs/integration/IIPS_v3.0_GATE_C_P2_SCOPE_CORRECTION_AND_F5R_DISPOSITION_2026-10-14.md`](../../../docs/integration/IIPS_v3.0_GATE_C_P2_SCOPE_CORRECTION_AND_F5R_DISPOSITION_2026-10-14.md); tracker §15.19) closes **F5R** as **OUT OF SCOPE** for this single-user application — **it is not to be executed**, and no `p2-establishment-f5r.txt` will be produced. The §4 “Unresolved by design” statement is **superseded for current status** by this update: the F5.2 result remains preserved as an unresolved historical observation and is **no longer an active blocker**; no in-scope P-2 acceptance condition remains open.

**The four-artifact deposit of §1 remains applicable and unexecuted.** As of this update nothing has been deposited — this folder contains this manifest alone at `main@a0caad3…` — and the four artifacts exist only on the operator's designated non-production host. The transport rule is unchanged (§5.6 of the reconciliation record, read with this update): one commit, the four artifacts only, pushed to the session branch current at deposit time; integrity by ordinary Git blob verification (§3 above).

---

## 6. Source-audit status correction (`2026-10-14`) — `GC-P2-DEPOSIT-SOURCE-AUDIT-01`

Read-only source audit on the designated host, reconciled against the executed handoff (record: [`docs/integration/IIPS_v3.0_GATE_C_P2_DEPOSIT_SOURCE_AUDIT_AND_ARTIFACT_DISPOSITION_REQUEST_2026-10-14.md`](../../../docs/integration/IIPS_v3.0_GATE_C_P2_DEPOSIT_SOURCE_AUDIT_AND_ARTIFACT_DISPOSITION_REQUEST_2026-10-14.md); tracker §15.20), establishes:

- **§4's "Still Windows-only: artifacts 1–4" and §5's "the four artifacts exist only on the operator's designated non-production host" are refuted-in-part and superseded by this section.** `p2-establishment-result.txt`, `p2-pin-provenance.txt` and `p2-anchor-key-public.json` were **never produced** — no executed handoff instruction creates them (the handoff's only `$ev` writes are `c-tsc.log`, `e-keygen.json`, `e-anchor.log`, `e-runtime.log`, `f-loader.json` and `p2-establishment-transcript-<yyyy-MM-dd>.txt`) and both are absent from `$ev` and the destination.
- The governed transcript `p2-establishment-transcript-2026-10-14.txt` exists but its content **does not satisfy the §1 checklist** (host, Block A pin verification, ACLs, tooling hashes, D1, D1b, F2–F4 absent); the untracked destination copy matches the off-coordinate `…-014000` file by SHA-256 and must not be committed.
- The five raw outputs exist and are **source evidence only**; the preliminary private-material scan of `e-keygen.json` **does not authorize** staging it as artifact 4.
- **Deposit status: INCOMPLETE — 0 of 4 commit-ready; nothing staged, committed or pushed.** The four dispositions are requested from the Program Authority at the record §6; no artifact is deposited, reconstructed or substituted.

> **Superseded for current status by §7 (`GC-P2-DEPOSIT-DISPOSITION-01`, dispositions rendered `2026-10-14`).**

---

## 7. PA artifact dispositions rendered — `GC-P2-DEPOSIT-DISPOSITION-01` (`2026-10-14`)

The Program Authority's execution directive of `2026-10-14` (standing authorization; no further approval requested) renders the four dispositions requested at the audit record §6:

1. **Artifact 1 — ACCEPTED with the contract amendment of §1.** The governed date-only transcript `p2-establishment-transcript-2026-10-14.txt` is the **sole required deposit artifact**, deposited byte-for-byte under the destination name `p2-establishment-transcript.txt`, with its **actual coverage and limitations stated in §1** (no claim of complete Blocks A–F coverage; no substitution of the `…-014000` alternate).
2. **Artifact 2 — NEVER PRODUCED; removed from the required deposit set.**
3. **Artifact 3 — NEVER PRODUCED AS A FILE; removed from the required deposit set.**
4. **Artifact 4 — NEVER PRODUCED UNDER THE REQUIRED NAME; removed from the required deposit set.** `e-keygen.json` is **not** renamed or copied into the public-only artifact; it remains host-side source evidence and never deposit content.

**Corrected deposit source coordinates (superseding the refuted PR #93 wording; §4/§5/§6 four-artifact statements are superseded by this section for current status).** Source: `%USERPROFILE%\.iips-gate-c-p2\evidence\p2-establishment-transcript-2026-10-14.txt` (governed coordinate only). Destination name: `p2-establishment-transcript.txt`. The destination's untracked wrong-source copy (SHA-256 equal to the `…-014000` file) must be **removed and replaced byte-for-byte on the designated host only**, only after this amendment is durably published, with source==destination SHA-256 verified before staging. Transport: **one commit carrying only `p2-establishment-transcript.txt`**, staged on the destination working tree, pushed to the session branch current at deposit time through the PR workflow (never directly to `main`); integrity by ordinary Git verification (§3). **Deposit status: contract amended — publication of this amendment is the durable-contract precondition; the file transfer itself is an operator-host step and is not executable from Arena (separate evidence domains; Arena holds no transcript bytes).**

> **Post-transfer update:** the pending operator-host state above describes status when the amendment was published; it is superseded by §8. The one-artifact transfer has since been verified and merged via PR #96.

## 8. Deposit execution and independent remote verification (`2026-10-14`; supersedes the pending-transfer sentence in §7)

**Transfer commit and path.** The Windows-reported remote branch `arena/2b4bc227-iips-review-recovered` pointed to commit `84a26d797d6a3a5729903a2813ecd178e8277590`, whose parent is amended-contract baseline `bed03a4f798a4b9c9041db6596cd5f1bb361430c` (PR #95 merge). Its diff adds exactly this sole authorized path and no other file: `p2-establishment-transcript.txt`. The same commit was carried unchanged to session branch `arena/63a310bc-iips-review-recovered` for the PR workflow.

**Remote byte identity.** PR #96's remote artifact is Git blob `d79d03a1e519cb1d97601b0ed89c280ac83e13f8` (Git blob SHA-1), 25,255 raw bytes. The GitHub Git Data API blob content was independently base64-decoded and SHA-256 hashed: `E5CD7E490FF69BACBB6496E5B6ED0CC29C3FD8786D8DEE04798A2B68D787D4BE`. Recomputing Git's blob header/hash over those bytes reproduces `d79d03a1e519cb1d97601b0ed89c280ac83e13f8`. The raw SHA-256 matches the Windows-supplied governed-source and destination digests; Arena verified the remote bytes against the supplied digest and did not access the Windows filesystem.

**Pull request disposition.** PR [#96](https://github.com/ramkivs/iips-review-recovered/pull/96), from `arena/63a310bc-iips-review-recovered` to `main`, was **MERGED** at `2026-10-14T09:20:37Z` as `f813354092b9e926ad93fb06080a7d64465aa4ae`. Its merge parents are `bed03a4f798a4b9c9041db6596cd5f1bb361430c` and the artifact commit above; the artifact commit is an ancestor of merged `main`. PR #96 contained only the transcript path. GitHub showed no status-check rollup or review records; the scoped review and validation exception were disclosed in the PR body. No direct push to `main` occurred.

**Patch-check exception — not passing.** The Windows-reported `git diff --cached --check` failure was reproduced as `git diff --check` exit 2 on the committed patch. Git's default whitespace rules flag all 315 CRLF lines; when CR-at-EOL is treated as a line ending, three actual trailing-space lines remain (lines 6, 38 and 99, each `Configuration Name: `). The transcript was not edited or normalized: byte-for-byte identity is required by §1 and has been verified. The failed check remains an explicit validation exception; it is not represented as passing.

**Current disposition and limits.** This completes the one-artifact deposit under the amended contract; it does not complete or repeat any establishment test and does not claim missing transcript coverage. The actual coverage/limitations in §1 remain controlling. Artifacts 2–4 remain removed from the required set with their stated never-produced dispositions; no alternate transcript was substituted and `e-keygen.json` was not renamed or copied. F5R remains **OUT OF SCOPE**, and historical F5.2 remains **UNRESOLVED**.
