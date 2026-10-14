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
