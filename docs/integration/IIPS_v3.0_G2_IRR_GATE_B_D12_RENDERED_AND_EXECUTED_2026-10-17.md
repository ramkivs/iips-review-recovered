# IIPS v3.0 — G-2 — **`D12` RENDERED `ACCEPT` AND EXECUTED** — IRR Gate B adapter re-baseline (`2026-10-17`)

> ## STATUS: **RENDERED — `ACCEPT` — EXECUTED — REMOTELY VERIFIED**
> Records (i) the Program Authority's `ACCEPT` of `D12` with explicit limits, and (ii) the single
> authorized ref operation and its verification. **Separate act from `D-IRR-124`; neither inherits
> the other's authority.**
>
> **Established:** one new ref carrying the re-baselined eight-file candidate.
> **NOT established:** adapter publication, any merge, Gate C qualification or result acceptance,
> Gate D, Gate E, promotion, admission, production.
>
> The prepared artifact `…D12_REBASELINE_AUTHORITY_ACT_PROPOSED_2026-10-17.md` retains its
> `PROPOSED` banner unchanged; **this document is the rendering and execution record.**

| Field | Value |
|---|---|
| **Act identifier** | `IIPS-V3-G2-IRR-GATE-B-D12-REBASELINE-AUTHORITY-2026-10-17-01` |
| **Artifact type** | Rendered authority decision **and** execution record |
| **Authority** | **RAMKI — Program Authority**, in the **IRR capacity** |
| **Rendered** | `2026-10-17` (Asia/Calcutta) |
| **Supersedes as to baseline only** | `D-1`'s designation of `10584439…` — **historical D-4 evidence is not revoked** |
| **Production status** | NON_PRODUCTION — `H-18` scope |

---

## 1. The rendered dispositions

| Sub-decision | Rendered disposition |
|---|---|
| **`D12-A`** baseline | **ACCEPT** — IRR `main` commit `4368a8d407f71dd84633a501ae1a003612fd28fe`, tree `128eec64ed52d571377b27e2d15de68a44a614c0`. The old `D-4` baseline `10584439…` is **superseded as the operative baseline for this instruction only**; historical `D-4` evidence is **preserved, not revoked** |
| **`D12-B`** scope | **ACCEPT** — exactly the eight adapter paths at the verified blob identities; candidate tree `ed54ced73a9f647dc0b047533ccb3fbdd9304c96` |
| **`D12-C`** ref strategy | **ACCEPT `C-1`** — one new ref; existing Gate B ref `6c654be728ef0c90c69f7184f3a5e1625e71057d` **preserved, never force-moved**; no competing candidate ref |
| **`D12-D`** publication | **ACCEPT `P-1`** — **no adapter PR**; publication deferred to the `INV-04`/`D10` sequence after Gate C |
| **`D12-E`** provenance | **ACCEPT `E-1`** — content ratified **by reference** to the Gate B ref and the rendered `D-4` evidenced there; **the reference is not Windows-host qualification** |
| **`D12-F`** invariants | **ACCEPT** — protected blobs, manifests, runtime pin and `503` behaviour verified before and after |
| **`D12-G`** evidence boundary | **ACCEPT** — POSIX results are **supplementary, non-qualifying** engineering evidence only |
| **`D12-H`** stop/rollback | **ACCEPT** — stop conditions and non-grants as stated; rollback deletes **only** the new ref |

---

## 2. Pre-execution re-verification

| # | Check | Verified value |
|---|---|---|
| 1 | Baseline commit `4368a8d…` tree | **`128eec64ed52d571377b27e2d15de68a44a614c0`** — matches `D12-A` |
| 2 | `4368a8d…` ancestry | **ancestor of current `main`** (`2470cf57…`) |
| 3 | `4368a8d → main` delta | **4 documentation paths, 0 product paths** — the Act 1 merge; the authorized baseline object is intact |
| 4 | Candidate tree reconstruction | **`ed54ced73a9f647dc0b047533ccb3fbdd9304c96`** — reconstructed exactly, not assumed |
| 5 | Eight blobs vs `D-4 §3.1` | **8/8 identical** (full SHAs, §3) |
| 6 | Exact eight-path diff | **8 files, all additions, +1,703/−0** — no unexpected path |
| 7 | Protected blobs before creation | `cb8db45d…`, `51704c12…`, `93f602fd…`, `d1c52fe6…`, `56fd4826…`, `98147054…` |
| 8 | Manifests before creation | `package.json` and `package-lock.json` identical to `main`; pin `2e11fa3b…` |
| 9 | Target ref free | `refs/heads/gate-b/local-principal-ipc-implementation-r2` — **absent** before the push |
| 10 | Existing Gate B ref before the push | `6c654be…` — unmoved |

**Note on baseline vs. current `main`.** `main` had advanced to `2470cf57…` because the **separate**
`D-IRR-124` act merged documentation. The act authorizes **tree `ed54ced7…`**, which is only
achievable on tree `128eec64…`; the baseline is therefore **`4368a8d…` as rendered**, not the newer
`main` tip. This is a faithful execution of `D12-A`, not a re-interpretation: re-basing on
`2470cf57…` would have produced a **different tree** and violated `D12-B`.

## 3. Execution — the authorized ref operation

| Item | Value |
|---|---|
| Ref created | **`refs/heads/gate-b/local-principal-ipc-implementation-r2`** |
| **Commit** | **`110e221fe7ca335c4571adb93d6c629c061f84e0`** |
| **Parent (sole)** | **`4368a8d407f71dd84633a501ae1a003612fd28fe`** |
| **Tree** | **`ed54ced73a9f647dc0b047533ccb3fbdd9304c96`** |
| Push | **non-forced**, explicit refspec, `* [new branch]` |
| Existing Gate B ref after push | **`6c654be728ef0c90c69f7184f3a5e1625e71057d` — unchanged** |

### 3.1 Eight blob identities at the created commit (full SHAs)

| Path (`frontend/server/user-portfolio/`) | Blob |
|---|---|
| `ipcClient.ts` | `e405051786ad93cf311ac69fb74d396730cebce7` |
| `ownerContextFromBinding.ts` | `172f1c7141afcddb6469ba7b0d6d1ced13240249` |
| `ipcPortAdapter.ts` | `74f0e652b7f0f2cf2c1ce34302b4035cbde1ad48` |
| `firstPartySignal.ts` | `7caf87d9a9d6c444c1ab4cec699b5c8ddae61aac` |
| `ipcClient.test.ts` | `abcb7efcc39cdeb30cbfa8f21633ddd615cf8bac` |
| `ownerContextFromBinding.test.ts` | `6ed6ba1b07302530ae952ca5ca82c21a27ca24cd` |
| `ipcPortAdapter.test.ts` | `80ba8931b937cf6773074ba0600106e21fa9deda` |
| `fenceUnchanged.test.ts` | `1f2d5f9d2619d46f5c8bc3ac73720ecdf9563ad4` |

## 4. Post-execution verification (independent remote read-back)

| # | Check | Result |
|---|---|---|
| 1 | `git ls-remote` for the new ref | **`110e221fe7ca335c4571adb93d6c629c061f84e0`** |
| 2 | `git ls-remote` for the Gate B ref | **`6c654be728ef0c90c69f7184f3a5e1625e71057d`** — unmoved |
| 3 | Fetched the ref into a different clone and resolved it | commit `110e221f…`; **parents `4368a8d…`** (sole); **tree `ed54ced7…`** |
| 4 | Eight blobs at the **remote** ref | **8/8 match §3.1** |
| 5 | `4368a8d..<ref>` diff | **8 files, all `A`, +1,703/−0**; **exactly 8 paths** |
| 6 | Protected blobs at the remote ref | all six **unchanged** |
| 7 | Manifests at the remote ref vs `main` | **identical**; pin still `2e11fa3b…` |
| 8 | Adapter PR | **none opened** (`P-1`) |

## 5. Evidence (supplementary, **non-qualifying** — `D12-G`)

Re-run on the reconstructed candidate tree `ed54ced7…`, POSIX, Node `v22.22.3` / npm `10.9.8`:

| Check | Result |
|---|---|
| `npm ci` | success |
| `npx tsc --noEmit` | **exit 0** |
| Focused — `ipcClient` 15, `ownerContextFromBinding` 8, `ipcPortAdapter` 21, `fenceUnchanged` 16 | **60/60** |
| Full suite | **76 files / 868 tests passed** |

Because the tree is **byte-identical** to the previously investigated candidate, these results are
consistent with — and re-confirm — the earlier run. **This acceptance does not qualify the adapter for
Gate C.** POSIX results are **not** Windows deployment-host acceptance, and Gate C still requires the
prescribed Windows run and its separately governed result-acceptance process (`D11`).

## 6. Provenance (`D12-E`) — what is ratified, and what is not

**Ratified:** the adapter content, **by reference** to `gate-b/local-principal-ipc-implementation`
@ `6c654be728ef0c90c69f7184f3a5e1625e71057d` and to the rendered `D-4` decision that ref's commit
cites (`IIPS-V3-G2-IRR-GATE-B-D4-IMPLEMENTATION-AUTHORITY-PA-DECISION-RENDERED-2026-10-17-01`,
IRR `docs/integration/IIPS_v3.0_G2_IRR_GATE_B_D4_IMPLEMENTATION_AUTHORITY_PA_DECISION_RENDERED_2026-10-17.md`,
blob **`fd700fe8cff3d36807ceadbd3593d5a14c56bda4`** on `main`), and to the rendered D-1/D-2/D-3 act
(`…GATE_B_BASELINE_AND_REF_AUTHORITY_ACT_2026-10-16.md`, blob **`3cb5fa39e0cd63bb518b2725fb628ec151d5ac75`**).
The historical `6b2b897…` / pre-rebase commit coordinates named inside those records remain valid for
the objects they name; only the tree-identical content was re-committed during the PR #117 rebase.

**Not ratified:** any Windows-host behaviour, any qualification, any admission, any write capability.

## 7. Non-grants (all still in force)

No adapter PR or publication · no merge of the adapter · **Gate C** qualification or result
acceptance · **Gate D** read admission · **Gate E** write policy, Q5–Q8 · promotion (`INV-04`/`D10`) ·
CV-52 admission · portfolio admission · production eligibility · release readiness · runtime-pin change ·
fence relaxation · IPD mutation · "Group 1 complete".

The `503 owner-context-unavailable` fence remains in force and the IPC path remains **unreachable at
runtime**: the transport does not reference any Gate B module.

## 8. Rollback

Delete **only** `refs/heads/gate-b/local-principal-ipc-implementation-r2`, after confirming it still
points at `110e221f…` and that no authorized work depends on it. **Never delete or move
`gate-b/local-principal-ipc-implementation`.** `main`, the baseline `4368a8d…`, all fences and the
runtime pin are untouched by a rollback.

*End of `IIPS-V3-G2-IRR-GATE-B-D12-REBASELINE-AUTHORITY-2026-10-17-01` — RENDERED · ACCEPT ·
EXECUTED · REF `…-r2` @ `110e221f…` · TREE `ed54ced7…` · NO ADAPTER PR · `503` FENCE IN FORCE ·
NON_PRODUCTION.*
