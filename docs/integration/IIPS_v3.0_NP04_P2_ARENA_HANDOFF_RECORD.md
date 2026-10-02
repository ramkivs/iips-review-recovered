# IIPS v3.0 — NP-04 P2 Arena Implementation Handoff Record

## Handoff Preparation Record

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** NP-04-P2-HANDOFF-R1 — Arena preparation of the common governed persistence package

**Document type:** HANDOFF PREPARATION RECORD — records that an implementation package has been
prepared in Arena and is awaiting Windows application. **This record does not establish
implementation durability.**

**Version:** 1.0 — Decision

**Date:** 2026-10-02

**Decision authority:** Program Authority

**Authoritative repository (governance):** `ramkivs/iips-review-recovered`
**Authoritative ref (governance):** `refs/heads/arena/01a0f1b3-iips-review-recovered`
**Authorized implementation repository:** `ramkivs/iips-production-market-data` (IPD)

---

> ## STATUS
>
> # ARENA HANDOFF = **PREPARED**
>
> # NP-04 P2 IMPLEMENTATION = **NOT YET DURABLE**
>
> # WINDOWS APPLICATION AND AUTHORITATIVE GIT PUSH = **OUTSTANDING**

---

## 1. Authority

| Item | Value |
|---|---|
| Authority record | `docs/integration/IIPS_v3.0_NP04_COMMON_GOVERNED_PERSISTENCE_IMPLEMENTATION_AUTHORITY.md` |
| Authority commit | `3807184c5d180f5842db67d04d96d15b967d0b23` |
| Authority blob | `29f1f23ce21faeab5ebcdf879aeee55e3f093cf0` |

**No new authority gate was created. The authority was not broadened. No new persistence technology
was selected beyond the one recorded in §3 below.**

## 2. Baseline

| Item | Value |
|---|---|
| Repository | `ramkivs/iips-production-market-data` |
| Authoritative ref | `refs/heads/main` |
| Baseline commit | `4d3e1cdca3a33da0ec3be8b336b17128108a502c` |
| Baseline path count | 385 |
| Existing NP-04 persistence implementation | **NONE** — 0 paths matching `persist`/`sqlite`/`np04`/`migration`/`artifact` |
| Expected post-implementation tree | **NOT DETERMINABLE FROM ARENA** — requires the complete IPD tree; Windows must record it |

The baseline was confirmed by read-only remote query. **No mutation, push, or synchronization of
IPD was performed from Arena**, consistent with the authority record §3 (*"No Arena→IPD push, IRR→IPD
synchronization, or IPD→IRR synchronization is required or permitted by this record"*).

## 3. Technology — recorded with its two qualifications

**Selected: `node:sqlite` (Node built-in `DatabaseSync`). No new persistence dependency.**

Two points are recorded rather than glossed:

1. **The NP-04 authority record does not itself name a technology.** §5 states verbatim: *"This
   record authorizes the capability and its required semantics. It does not prescribe a storage
   technology."* and *"No technology is named in this record."* It permits the implementation team to
   select a technology within stated constraints. `node:sqlite` satisfies all of them (non-production,
   transaction-capable, durable and restart-safe, testable, bounded, auditable, compatible with the
   §4.1 consumer contract, no production dependency, no irreversible migration). Selection is
   consistent with the G3 governance stream, which describes NP-04 as *"`src/persistence/`, Node
   `node:sqlite`"* in IPD (`PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_GOVERNANCE_DECISION.md:137`) and
   refers to the *"IPD `node:sqlite` substrate (NP-04)"* as a distinct substrate
   (`PROGRAM_v3.0_G3_TENANT_MEMBERSHIP_SUBSTRATE_TECHNICAL_AUTHORITY.md:107`).

2. **`node:sqlite` is still flagged experimental by Node.** It emits
   `ExperimentalWarning: SQLite is an experimental feature and might change at any time`. This is
   surfaced, not hidden. The G3 substrate decision rejected `node:sqlite` for the **IRR** tenant
   directory partly on stability grounds — but that decision was scoped to **IRR**, whose documented
   baseline is Node v20 (where `node:sqlite` does not exist). **IPD is on Node 22**
   (`@types/node: ^22.13.9`), where `node:sqlite` is available. Windows should explicitly accept or
   reject the experimental flag; this is recorded as an open item, not silently assumed.

## 4. Prepared package

| Artifact | SHA-256 | Arena status | Windows authoritative status |
|---|---|---|---|
| `np04-persistence-handoff.tar.gz` | `7b9c926582ab7269983ca657db13d905e6fc71e1bda421134c4d4d0325701bc8` | **PREPARED** | **NOT YET APPLIED** |
| `np04-persistence-handoff.zip` | `74ad7f48a16920fa030ceb0449e946ea81d826241dd510e4f2536fbde34ffd04` | **PREPARED** | **NOT YET APPLIED** |
| `HANDOFF_MANIFEST.md` | `fa87f77a784ce18d0b2d6f59c01c3eb60ca553aa0d225e89727cf9c67662009a` | **PREPARED** | **NOT YET APPLIED** |

All are **Arena-only handoff artifacts**, labelled as such per the handoff gate §8. None is
asserted to be Windows-authoritative, and none is claimed as durable implementation.

### 4.0 Regeneration amendment (mandatory reading)

**The handoff directory lived outside the IRR Git repository and was destroyed by an Arena sandbox
reset after the original preparation.** This is recorded because it is a real durability hazard of
the Arena preparation model: **Git-backed content survives a reset; non-Git workspace content does
not.**

The package was therefore **regenerated**, and every payload file was verified against the
**per-file SHA-256 values recorded durably in this record**:

| Payload file | Result |
|---|---|
| `src/persistence/types.ts` | **byte-identical** |
| `src/persistence/governedPersistence.ts` | **byte-identical** |
| `src/persistence/index.ts` | **byte-identical** |
| `tests/np04_governed_persistence.test.ts` | **byte-identical** |

**All four payload files are byte-identical to the originally recorded hashes.** The payload is
therefore provably unchanged; only the container differs.

**Container hashes changed** — the original `.tar.gz` used default container metadata (mtimes,
gzip stream timestamp), which is **not byte-reproducible**. The regenerated container is built
deterministically (`--mtime`, `--owner=0`, `--group=0`, `--sort=name`, `gzip -n`). A `.zip`
container is also provided for Windows convenience.

> **The authoritative integrity check is the per-file hash table in §4.1 — not the container hash.**
> A container-hash difference is expected and is **not** a fail-closed condition; a **per-file**
> mismatch remains a hard stop.

### 4.1 Delivered files (4 added, 0 modified, 0 deleted)

| Destination in IPD | SHA-256 |
|---|---|
| `src/persistence/types.ts` | `37bd09044b9d421b4bb1a77d3945ca627aceb69d2110c3ce8143ca9d8b7de951` |
| `src/persistence/governedPersistence.ts` | `8eb2834e27da93d016ba34ecd6cf33f6a8b968e851bc22a94a4857e0cd9e9489` |
| `src/persistence/index.ts` | `5b738867cbc622f4870880d1ee1351934c68674279b2364a87c643b008197780` |
| `tests/np04_governed_persistence.test.ts` | `0c6905b967555499690bddb219445f6efef7075067fd71a51ca1829cf4e1d78b` |

## 5. Contract implemented

The five operations of the authority record §4.1, exactly: `createInstance`, `appendVersion`,
`resolveById`, `queryByOwner`, `listSupersededBy`.

Enforced invariants (record §4.2): store-assigned globally unique `reportId` (UUIDv4, never
content-derived); immutable `(tenantId, userId)` ownership bound to the server-derived principal;
version starts at 1 and increments monotonically; prior versions immutable; single-parent
supersession with no predecessor on the first artifact; append-only; durability across restart;
atomic failure with no partial artifact; cross-owner reads denied **without existence disclosure**;
migration/startup fail-closed.

**Structural enforcement, not convention:** immutability is enforced by SQLite `BEFORE UPDATE` /
`BEFORE DELETE` triggers that `RAISE(ABORT)`; identity integrity by primary-key and `CHECK`
constraints; ownership by write-once column values.

## 6. Arena-side validation performed

**Arena-side evidence only. It is NOT Windows execution and is not represented as such.**

| Check | Result |
|---|---|
| **Payload SHA-256 vs the durably recorded per-file values (post-regeneration)** | **4/4 IDENTICAL** |
| Archive extraction + per-file SHA-256 cross-check | **4/4 OK** |
| Typecheck under IPD's exact `tsconfig` compilerOptions (`strict`, `NodeNext`, target ES2022) with `@types/node@22.13.9` | **0 errors** |
| Compile to `dist` | **exit 0** |
| `node --test dist/tests/*.test.js` | **17 pass / 0 fail** |
| Cross-process restart durability (PID 1901 wrote → separate OS process PID 1910 read from disk) | **PASS** |
| Archive self-containedness (re-extracted to a clean directory, compiled and run independently) | **PASS** |
| No non-builtin dependency in the module's import graph | **PASS** |

The suite covers all **16** required validations of the authority record §7, plus 4
governance-boundary tests.

### 6.1 Defects found and fixed during Arena-side validation

1. **The client-authority guard initially over-rejected.** It refused `reportId` for *all*
   operations. That is correct for `createInstance` (identity is store-assigned) but **wrong** for
   `appendVersion`, where `reportId` legitimately addresses an existing instance. The guard is now
   per-operation: ownership members are always forbidden; instance identity is forbidden on create;
   `artifactVersion` is forbidden everywhere because it is always computed from the current head.
   This was a genuine defect caught before handoff — exactly what Arena-side validation is for.

2. **`queryByOwner` page semantics.** The implementation returns **every append-only version**,
   ordered by insertion. NP-06 §5.1 specifies *"page of artifacts"* without stating whether that
   means every version or only current heads. Arena selected the literal reading. **This is an
   unresolved interpretation point** and is carried forward (§7).

## 7. Open items carried to Windows

1. **`queryByOwner` page semantics** (§6.1.2) — must be confirmed before Reports consumes the
   interface. Not a defect in this artifact; a contract clarification.
2. **`node:sqlite` experimental status** (§3.2) — explicit accept/reject decision required.
3. **Expected post-implementation tree** — not determinable from Arena (§2).

## 8. Windows handoff procedure

The artifacts are exposed through an **Arena download server** (authority record §9.2: *"Arena must
expose the artifact through the download server, with a manifest carrying per-file SHA-256
values"*), serving an index with the per-file hash table, `HANDOFF_MANIFEST.md`, `SHA256SUMS.txt`,
and both container formats. **The download URL is sandbox-scoped and therefore deliberately not
recorded durably here** — a durable governance record must not carry an ephemeral endpoint. The
manifest carries the hashes, which is what durability of the artifact requires.

Full instructions, per-file hashes, test commands, and fail-closed conditions are recorded in
`HANDOFF_MANIFEST.md` §11–§12. Summary of the required sequence:

1. **Baseline** — confirm the IPD checkout is at, or explicitly reconciled to,
   `4d3e1cdca3a33da0ec3be8b336b17128108a502c`. **Stop rather than force-apply on mismatch**
   (authority record §9.3).
2. **Verify** — `sha256sum np04-persistence-handoff.tar.gz` must equal
   `7b9c926582ab7269983ca657db13d905e6fc71e1bda421134c4d4d0325701bc8` (see §4.0: a container-hash
   difference is expected and is **not** a stop condition); then verify each extracted
   file against §4.1. **On mismatch: STOP.**
3. **Apply** — copy the four files into `src/persistence/` and `tests/`.
4. **Validate** — Node version, npm version, dependency install, typecheck, the NP-04 suite, and the
   full relevant regression suite. Record **exact exit codes and counts**.
5. **Scope** — inspect `git status`, `git diff --stat`, `git diff`; confirm only the four authorized
   files changed.
6. **Durability** — stage, commit, push to `main`; then independently verify remote commit, remote
   tree, changed blobs, reachability, tracking ref, `LOCAL == REMOTE`, and a clean worktree.
7. **Return evidence** to the governance conversation.

**Only after that evidence is reviewed can NP-06 P2 be marked SATISFIED / DURABLE.**

## 9. What this record does NOT establish

- It does **not** establish NP-04 P2 implementation durability.
- It does **not** mark NP-06 P2 satisfied.
- It does **not** grant Reports implementation authority.
- It does **not** constitute Windows validation, Windows commit, or Windows push.
- It does **not** assert that the authoritative IPD repository contains the implementation.

## 10. Next governance sequence

After Windows returns authoritative Git evidence:

1. verify NP-04 P2 durability;
2. mark P2 satisfied **only if independently proven**;
3. proceed to the remaining NP-06 P1 implementation work (Reports resource authorization;
   `/api/reports/*` binding; Reports-specific 401/403/ownership proof);
4. perform the final NP-06 implementation-authority re-entry determination.

**No Reports implementation before that final authority determination.**
