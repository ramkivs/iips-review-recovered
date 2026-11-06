# IPD Reconstruction Publication Receipt — D02/D03/D05 — 2026-11-06

**Record status:** Re-authored receipt (second re-authoring). The original receipt authored
earlier on 2026-11-06, the git commit that carried it, and its publication bundle were
destroyed by sandbox workspace resets, twice. This document is a NEW record re-authored
from the surviving verification record. It is not the lost original text and must not be
cited as byte-identical to any previous version.

**Scope:** D02/D03/D05 only. Append-only authority/tracker/evidence documentation.
No code change, no authority change, no register rewrite, no D06, no operational holdings
action, no QE/Gate 4/PA acceptance claim.

## What was published (IPD)

- Repository: ramkivs/iips-production-market-data
- PR #129 — merged 2026-11-06T05:37:28Z as merge commit
  1cde2324ed4b4d636248af9ea3d87b10cac3d031
  (first parent recorded as prefix 07e86a4f; tree d74a5de2a4e73abe87e3ca7a876f394f5ccfe1b5)
- CI run 42169388318 — SUCCESS
- Executed-count check-run 127733651056 — SUCCESS: 1054 executed, 1053 passed, 0 failed;
  evaluated head 2411f56510c9b178156974cc112046116eb45365
- Evidence pack: evidence/cross-repository/IIPS_V3_D02_D03_D05_RECONSTRUCTION_IPD_IMPLEMENTATION_EVIDENCE_2026-11-06.md
- 8 blobs readback-verified on merged main.

## Reconstruction ≠ original

The IPD implementation was re-implemented from the review record. The original build
artifact (IPD commit prefix 4b126987) is unrecoverable. Every statement in this record
about "reconstruction" carries that meaning. Historical test results do not substitute
for qualification; this receipt confers none.

## IRR authority records (unchanged by this append)

- PA-INSTRUCTION-OPERATIVE-TRANSCRIPT.txt — blob 920c4dcff0a2488eca3ddf02ec147d00e01b811b
- current-register.json                              — blob bde84f8a9bf92b836b80b3ab0d46ef8a185042bd
- IPD-LOCAL-RESULTS.json                             — blob 6dce16dd133967c24976a1ff272887b16645bc5a
- PA publication-status record                       — blob 72de9513748cd4a783aae92e87ca6b0de1a3a6c6

All must remain byte-identical after publication. The accompanying publication script
verifies this before and after merge.

## H01–H12

H01, H02, H03, H04, H05, H06, H07, H08, H09, H10, H11, H12 — each remains **NOT QUALIFIED**.
No independent QE verification, Gate 4 acceptance, D06 admission, or operational holdings
write/activation is authorized or implied by this receipt or by the publication that
carries it.

## Loss and re-authoring history (2026-11-06, all UTC)

1. Original receipt commit d54f050cfc326548c37848621c588f04c2dcf0fa and bundle
   (sha256 29dfeafb44b7e99200b0adcc77c0eb59f83bee01717b2e2e1e09daafbbd95a2d) — lost in the
   first sandbox workspace reset. Never pushed; verified unresolvable remotely afterwards.
2. First re-creation commit f98bdea251b9f2370edff73d48b7ad16e753aa32 (parent
   83f4511e2ebac9d42c7f30f5798e8356c7b23edf) and bundle
   (sha256 40105da72970aa9be02b88eaccf98c4de2b11138960425655bc64a36540d1cc2) — destroyed in
   the second sandbox workspace reset before publication ran. Never pushed; verified
   unresolvable remotely afterwards.
3. This re-authoring — the commit and bundle that carry this very file are embedded in the
   accompanying publication script (iips-d02-d03-d05-irr-publish.ps1) and bundle, which are
   re-created and re-verified immediately before handoff and whose SHA-256 values are
   recorded there. Each re-authoring changes the commit SHA and the bundle SHA; they are
   not interchangeable.

## Branch-name discrepancy disclosure

The carrier branch is named for the review-recovered IRR namespace
(arena/e64b5e72-iips-review-recovered), which does not match the IPD session worktree
branch naming. This is deliberate: the receipt lives in the IRR clone, not in IPD.

## Hard limits

- Never push directly to main; publish only via the dedicated branch and one PR.
- Merge only after every required CI check passes; no --admin, no --auto, no force-push.
- Never modify IPD-LOCAL-RESULTS.json, current-register.json or the operative transcript.
- No operational holdings writes, activation, or D06; no QE/Gate 4/PA acceptance claim.

Prepared 2026-11-06T10:15:08Z (re-authored). H01–H12 all remain NOT QUALIFIED.
