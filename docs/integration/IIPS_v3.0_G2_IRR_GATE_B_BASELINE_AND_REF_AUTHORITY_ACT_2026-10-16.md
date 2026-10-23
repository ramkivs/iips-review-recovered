# IIPS v3.0 — G-2 — **IRR GATE B BASELINE AND REF AUTHORITY ACT — RENDERED**

> ## STATUS: **RENDERED — PROGRAM AUTHORITY ACT (MATTERS D-1, D-2, D-3 ONLY)**
>
> This artifact records the **Program Authority's own-word dispositions**
> of **D-1 (IRR baseline designation)**, **D-2 (exact ref creation)**, and
> **D-3 (form)** for IRR Gate B, supplied explicitly and recorded verbatim
> in §2. It grants **nothing beyond those three dispositions**.
> **D-4 (IRR Gate B implementation authority) is NOT granted** and remains
> conditional on the separately rendered paired IPD authority act.
> **Gate B implementation remains blocked**; Gates C, D, and E are not
> advanced.

| Field | Value |
|---|---|
| **Record identifier** | `IIPS-V3-G2-IRR-GATE-B-BASELINE-AND-REF-AUTHORITY-ACT-2026-10-16-01` |
| **Record type** | **Rendered Program Authority act** — one combined disposition of D-1, D-2, D-3 (the decision texts previously missing from the authority-basis determination, now supplied by the Program Authority) |
| **Authority rendering** | **RAMKI — Program Authority**, acting in the **IRR capacity** for `ramkivs/iips-review-recovered`; decision text supplied by the Program Authority in its own words and recorded verbatim in §2 |
| **Recording agent** | Arena Agent Mode — recording and publication only; renders no authority of its own and infers none |
| **Repository / branch (this record)** | `ramkivs/iips-review-recovered` / `arena/075f10df-iips-review-recovered` (existing **PR #117** G-2 governance workstream; no competing PR) |
| **Form (D-3)** | **One combined, additive IRR Program Authority act** in the existing PR #117 workstream |
| **Decision date** | **2026-10-16** (Asia/Calcutta) |
| **Production status** | NON_PRODUCTION — one user, one personal laptop, H-18 scope |

---

## 1. SCOPE OF THIS ACT

This act designates the IRR Gate B implementation baseline (D-1) and
authorizes creation of exactly one implementation ref (D-2), recorded
together as one combined act (D-3). **It does not grant implementation
authority (D-4)**, which remains separate and conditional on the paired IPD
authority act being rendered in the IPD repository. It does not authorize
Gate C qualification, Gate D route admission, Gate E write policy, durable
portfolio writes, successful-save claims, production eligibility, G24
lineage promotion, or the merging of PR #117.

## 2. EXACT DECISION TEXT — PROGRAM AUTHORITY, OWN WORDS (VERBATIM)

> **D-1 — ACCEPT.**
>
> I designate IRR main commit
>
> `10584439f33dfa9192955c3f74879f20ccaf111e`
>
> as the IRR Gate B implementation baseline.
>
> **D-2 — ACCEPT.**
>
> I authorize creation of exactly one ref:
>
> `refs/heads/gate-b/local-principal-ipc-implementation`
>
> Create it non-forced at the exact designated baseline commit
>
> `10584439f33dfa9192955c3f74879f20ccaf111e`.
>
> Do not move or modify any other ref. Do not open a PR from this ref under
> this act.
>
> **D-3 — ACCEPT.**
>
> Record D-1 and D-2 together in one combined, additive IRR Program Authority
> act in the existing PR #117 workstream.

## 3. D-1 — BASELINE DESIGNATION (**ACCEPTED**)

- **Designated IRR Gate B implementation baseline:** IRR `main` commit
  `10584439f33dfa9192955c3f74879f20ccaf111e` (tree
  `df7e754618cb7b0500966d8fdf84c5598f4b2b24`; parents
  `eb4bf820c62eb3e2f5c628a95d59c8f967e3f629` +
  `7a07dc37490cfde8c250efedd09a26f28d91e726`; the authoritative tip that
  carries the effective DP-1 amendment, merged via PR #118).
- **Character:** a **designation**, not a promotion, merge, cherry-pick,
  re-pin, or admission of any lineage. IRR `main` is **not** moved or
  modified by this act.

## 4. D-2 — EXACT REF CREATION (**ACCEPTED**)

- **Authorized ref:** `refs/heads/gate-b/local-principal-ipc-implementation`
- **Exact object:** the designated baseline commit
  `10584439f33dfa9192955c3f74879f20ccaf111e`
- **Authorized scope:** creation **non-forced** at the exact designated
  commit; **no other ref** created, moved, or deleted; **no PR opened from
  that ref by this act**.
- **Execution:** performed **after** publication of this act, as the single
  separately verifiable remote operation authorized here; the ref's
  creation is this act's only ref-inventory effect. This act's own
  publication commit does not itself create the ref.

## 5. D-3 — FORM (**ACCEPTED**)

D-1 and D-2 are recorded **together in one combined, additive IRR Program
Authority act** — this artifact — published additively in the existing
PR #117 workstream (`arena/075f10df-iips-review-recovered`).

## 6. LIMITS (VERBATIM)

> This act designates the baseline and authorizes the exact ref creation only.
> It does NOT grant IRR Gate B implementation authority (D-4), which remains
> conditional on the separately rendered IPD authority act.
>
> It does not authorize Gate C qualification, Gate D route admission, Gate E
> write policy, durable portfolio writes, production eligibility, G24 lineage
> promotion, or merging PR #117.
>
> Preserve the effective DP-1 amendment, L-IPC-1 C1-C12, DP-2 Option 2F, H-18,
> all four accepted Gate V waivers, and the existing HTTP 503 fence.

## 7. WHAT THIS ACT DOES NOT DO

- Does **not** grant **D-4** (IRR Gate B implementation authority) —
  conditional on the paired IPD authority act; **Gate B implementation
  remains blocked** and no implementation code may be authored under this
  act.
- Does **not** authorize **Gate C qualification** (Q1–Q11, including the
  mandatory **C5.1/Q9** zero-bytes qualification probe — deferred, not
  executed, not claimed as passed), **Gate D route admission** (the 503
  fence stays byte-unchanged until a separate Gate D act), or **Gate E
  write policy / canonical-identity source designation**.
- Does **not** authorize durable portfolio writes, successful-save claims,
  production eligibility or "ready" claims; promotion, merge, cherry-pick,
  re-pin, or admission of the unadmitted G24 off-main lineage (`6828155…`)
  or of the IPD Gate A derivative ref (`2ded0e98…`); or the merging of
  PR #117 (or PR #114 / IPD PR #8).
- Does **not** change application code, tests, pins, lockfiles, schemas,
  routes, UI, fences, transports, or runtime configuration.

## 8. PRESERVED CONTROLS (unchanged, in force)

The effective **DP-1 amendment** (blob
`c71661a1ee445b2348cedfedae4aef6449029ebb` @ IRR `main` `10584439…`);
**`L-IPC-1` C1–C12**; **DP-2 Option 2F**; **H-18** single-user scope;
**all four accepted Gate V waivers** (V-1 ACL/SDDL capture, V-4 pipe
collision/re-bind, second-account access, remote-machine access — waivers,
not technical proof, un-reopened); and the **IRR HTTP 503
`owner-context-unavailable` fence** (blobs
`cb8db45d668d28cee7e0a52721001d579a872733` /
`51704c12a467cd2f718a030b5036bc55c9afa73f`), byte-unchanged until a
separately authorized Gate D act.

## 9. VERIFIED STATE AT RENDERING (IRR only; live remote, read-only)

| # | Item | Verified value |
|---|---|---|
| 1 | IRR `main` | `10584439f33dfa9192955c3f74879f20ccaf111e` — unchanged; the designated baseline |
| 2 | PR #117 | **OPEN, unmerged**, base `main`, head `arena/075f10df-iips-review-recovered` @ `a6d7d84fe8a88cb785b02eff8349437e66f0cd0f` (authority-basis determination) — this act publishes additively on top |
| 3 | Prior IRR Gate B artifacts (preserved in PR history) | request `IIPS-V3-G2-IRR-GATE-B-IMPLEMENTATION-AUTHORITY-2026-10-16-01` (blob `3e88ebecf702f70a5c60d5ea105e916e3af99acd` @ `7fcb7ba1…`); decision draft `IIPS-V3-G2-IRR-GATE-B-IMPLEMENTATION-AUTHORITY-DECISION-RECORD-2026-10-16-01` (blob `3e2efe8e7cd98a4acb6116c97959d6430e8b78d5` @ `4ff714c1…`); authority-basis determination `IIPS-V3-G2-IRR-GATE-B-AUTHORITY-BASIS-DETERMINATION-2026-10-16-01` @ `a6d7d84…` |
| 4 | `gate-b/*` refs before this act | **0** — the authorized ref did not exist at rendering time |
| 5 | 503 fence | byte-identical on `main` and on the PR #117 head |
| 6 | IPD repository | **not accessed**; the paired IPD authority act remains a separate, unrendered condition for D-4, and no approval of the IPD decision draft is claimed or inferred |

## 10. ATTESTATION

| Check | Result |
|---|---|
| Decision text source | **Program Authority's own words**, supplied explicitly for D-1, D-2, and D-3 and recorded verbatim in §2 — not inferred from the task prompt, prior publication authorization, one-pass execution instruction, or any pending decision draft |
| Matters dispositioned | **D-1 ACCEPT · D-2 ACCEPT · D-3 ACCEPT** — only these three; **D-4 NOT granted** |
| Refs created / moved / deleted by this record | **NONE** — the single authorized ref creation is executed separately per §4 after this act's publication |
| Implementation authored | **NONE** — Gate B not implemented |
| Application behavior / fence changed | **NONE** — fence byte-identical |
| PR #117 merged | **NO** |
| Gates C/D/E advanced; P-6/P-8 granted; route admission; writes; production eligibility | **NO / NONE** |
| New artifacts | **exactly one** — this authority act |

*End of rendered authority act
`IIPS-V3-G2-IRR-GATE-B-BASELINE-AND-REF-AUTHORITY-ACT-2026-10-16-01` —
**D-1/D-2/D-3 ACCEPTED (ONE COMBINED ACT) · D-4 NOT GRANTED · GATE B
IMPLEMENTATION BLOCKED · 503 FENCE UNCHANGED · NON_PRODUCTION**.*
