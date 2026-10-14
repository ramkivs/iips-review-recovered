# Gate C / P-2 — Establishment Evidence Destination (intake manifest)

**Record:** `IIPS-V3-REG12-GATE-C-P2-ESTABLISHMENT-EVIDENCE-MANIFEST-2026-10-14-01`
**Destination repository:** `ramkivs/iips-review-recovered` (IRR) — **the only destination; IPD is not written**
**Destination branch (transport):** the session branch `arena/dd87c5d6-iips-review-recovered` (established Phase-1B transport convention — commit + push the evidence to the session branch; never push directly to `main`)
**Reconciled by:** [`docs/integration/IIPS_v3.0_GATE_C_P2_ESTABLISHMENT_EVIDENCE_RECONCILIATION_AND_TRANSFER_2026-10-14.md`](../../../docs/integration/IIPS_v3.0_GATE_C_P2_ESTABLISHMENT_EVIDENCE_RECONCILIATION_AND_TRANSFER_2026-10-14.md)
**Handoff being evidenced:** [`docs/integration/IIPS_v3.0_GATE_C_P2_EXECUTION_HANDOFF_ARENA_TO_NON_PRODUCTION_HOST_2026-10-13.md`](../../../docs/integration/IIPS_v3.0_GATE_C_P2_EXECUTION_HANDOFF_ARENA_TO_NON_PRODUCTION_HOST_2026-10-13.md) (Blocks A–G; corrections `…-D1-CORR-01`, `…-F5-CORR-02`)

---

## 1. What belongs in this folder

Exactly these four operator-transported artifacts (raw, unedited):

| # | File | Content | Secret-bearing? |
|---|---|---|---|
| 1 | `p2-establishment-transcript.txt` | the raw `Start-Transcript` capture of Blocks A–F (host, pin, ACLs, tooling hashes, `TSC_EXIT/TSC_ERRORS`, D1/D1b/D2, anchor + runtime startup JSON, F1–F4 results, F5.2 **as observed**) | **no** |
| 2 | `p2-establishment-result.txt` | operator-authored factual result summary, including the **F5.2 `401 OIDC_KEY_UNAVAILABLE` outcome recorded as UNRESOLVED**, the corrective shutdown verification (ports 8421/8099 free), and the not-done list (P-4 provisioning, P-6 authority, P-8 qualification, IPD changes) | **no** |
| 3 | `p2-pin-provenance.txt` | output of `git rev-parse HEAD`, `git rev-parse HEAD^{tree}`, `git status --porcelain` from `G:\IIPS-Production-Market-Data-P2-PIN` | **no** |
| 4 | `p2-anchor-key-public.json` | the Block E key-generation JSON **public fields only** — `kid`, `modulusBits`, `publicJwkSha256`, public JWK | **no** |

## 2. What must never be placed here (or in any record, log, branch or artifact)

Private key bytes or any value derived from them; `.pem` files; bearer tokens (the minted token is assigned to a variable, never echoed or written); credentials; `e-keygen.json` in any form that contains private material; anything under `%USERPROFILE%\.iips-gate-c-p2\anchor\keys\`. Custody stays on the operator host (`R-2.7`; worksheet §4.7).

## 3. Integrity rule

Integrity is carried by **ordinary Git verification** — the recorded blob SHA of each file on the pushed branch, compared by Arena against the remote contents. No separate hash manifest, archive or checksum file is required for these four artifacts.

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
