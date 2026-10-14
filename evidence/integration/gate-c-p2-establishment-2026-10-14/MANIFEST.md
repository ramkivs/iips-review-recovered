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

**Resolved source coordinates for the deposit** (from the handoff, §6.2 `$ev` and §6.7). On the designated host, the raw artifacts are in the state-root evidence directory **`%USERPROFILE%\.iips-gate-c-p2\evidence\`**; three of them already carry their destination names (`p2-establishment-result.txt`, `p2-pin-provenance.txt`, `p2-anchor-key-public.json`) and the transcript carries the run date (`p2-establishment-transcript-<yyyy-MM-dd>.txt`), deposited under the destination name `p2-establishment-transcript.txt`. Copy **only** these four files; **never** `e-keygen.json`, any `.pem`, or anything under `…\anchor\keys\` (§2). If an artifact is absent from `$ev`, report the exact absence — do not reconstruct, regenerate or substitute it.
