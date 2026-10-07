# EVIDENCE PACKAGE MANIFEST — Integration & Convergence Review P0–P6

**Package:** IIPS single-platform integration & convergence verification, phases P0–P6
**Evidence date (UTC):** 2026-10-07
**Publication:** Evidence Durability Gate — the single authorized mutation of this engagement
**Pre-publication authoritative base:** IRR `origin/main` commit `17e234a1d6a5e1629cdf98b5c5f241a663cf9901`, tree `c6fb24d9093ee49e813561ba849c6c26d9da9805` (verified unchanged via `git ls-remote` + GitHub API immediately before and after publication)
**Publishing branch:** `arena/627f4e40-iips-review-recovered` (session branch; merged to `main` by pull request — platform constraint, disclosed in DURABILITY-RECORD.md)

## Classification summary (decided before writing)

| Class | Artifacts |
|---|---|
| REQUIRED—DURABLE | P0–P6 reports (7 files below) |
| SUPPORTING—DURABLE | supporting/p3-durability-process-outputs.txt, supporting/p4-validation-ledger.txt, supporting/lineage-inventory.txt |
| RECONSTRUCTABLE—NO COPY REQUIRED | P3.2 durability driver scripts (protocol fully documented in P3 report §3 and in the process-output headers) |
| TEMPORARY—DO NOT PUBLISH | /tmp worktrees, clones, storage dirs, node_modules, logs |
| NOT PUBLISHED (by design) | application code, governance changes, off-main lineage promotion (none of these was mutated) |

## Artifact inventory (SHA-256, sizes in bytes)

| # | Path (relative to this directory) | Size | SHA-256 | Provenance |
|---|---|---|---|---|
| 1 | `P0-authoritative-baseline-reconciliation.md` | 4387 | `ff56d5dd69f477fe72ca1bd1787c3e7541cf6e2307b56aa7521e2fe34d518d39` | P0 stage report — CONTENT-LEVEL RECONSTRUCTION (original lost in sandbox rebuild during P6 outage; reconstruction notice inside; conclusions unchanged) |
| 2 | `P1-repository-convergence.md` | 22450 | `c5644a6a76e716494df2b9ba3cabb08fe23bc4da0df2a8ed14c81de4391d28d8` | P1 stage report — verbatim from the stage record |
| 3 | `P2-contract-implementation-discovery.md` | 29378 | `f5dc87695d080b44cd6edc6def0b781e7eb7a7694d9765cdc30388dabb2c8766` | P2 stage report — verbatim from the stage record |
| 4 | `P3-persistence-durability.md` | 16140 | `3318cb9238138ec79360cbc8110c9a6242af4d0e88daa501ea93e6e93647ec94` | P3 stage report — verbatim from the stage record |
| 5 | `P4-validation.md` | 9765 | `9316905b818047ff12b16cf334454b8f24f0c0e7518cdcc03c0e2a3ee2fe37ee` | P4 stage report — verbatim from the stage record |
| 6 | `P5-capability-sweep.md` | 17034 | `d130efcee3410186e5df6bea54964aec50842a8e63192e11e697c745f8da4416` | P5 stage report — verbatim from the stage record |
| 7 | `P6-durability-audit.md` | 30455 | `4c40ca047868e78c564d3c46bea83e7743b8a95e1914fd0069efe1484eda62ea` | P6 stage report — full 12-section composition; conclusions identical to the chat-delivered P6 close (report file had been blocked by the 503 outage) |
| 8 | `supporting/p3-durability-process-outputs.txt` | 7107 | `bcf7604071f21b3080ada073f88599cffe6e7fd4494908ed1a0b85d0cff365c3` | Captured Process A/Process B outputs (PIDs 2076/2169, 2090/2344, 2379/2415, 2453/2483; IPD PIT in-process demo), each with lineage/commit header |
| 9 | `supporting/p4-validation-ledger.txt` | 6844 | `11aff0756ae7cc1a0a917e63730edaeb1ef2d7c6d8dfb7c92841e23cf298fffb` | Per-lineage commands, commit identities, counts, failure taxonomy |
| 10 | `supporting/lineage-inventory.txt` | 6609 | `0694d53754e9f88e13bca4bd556f3166ef352e3398caba023e6067b930f3f19a` | Branch→tip→tree inventory of all material lineages (incl. `2e11fa3b`/`7c1d516a`, `6828155`/`eb07ea36`, `12c480b`/`79e05023`, `5eba01b`/`3573fcc0`, `ea70a8c`/`1cd0515`, `f63a9b4`, donor tree `682f4e60`, tags) |

## Package integrity notes

- This MANIFEST is itself part of the published package; its own digest therefore cannot be self-contained — independent verifiers should hash the 10 files above and compare to this table.
- `DURABILITY-RECORD.md` (companion, same directory) is written AFTER publication: it records Process A, publication coordinates, independent Process B retrieval, hash comparison, and the final gate disposition. It is added in a second commit; its content is the verification record of the very publication this manifest describes.
- Hashes computed with `sha256sum` (coreutils) at 2026-10-07 before commit; file sizes from `stat -c%s`.
- The evidence package is ADDITIVE: no pre-existing repository file is modified, no branch/tag is promoted, no application code changes. Verified in the commit diff before merging.

## Source authorities

- IRR: `ramkivs/iips-review-recovered` — main `17e234a1…` (tree `c6fb24d9…`)
- IPD: `ramkivs/iips-production-market-data` — main `4d3e1cdc…` (tree `db853dc2…`)
- Off-main pinned lineages referenced BY the evidence (not promoted): see `supporting/lineage-inventory.txt`.

**END MANIFEST**
