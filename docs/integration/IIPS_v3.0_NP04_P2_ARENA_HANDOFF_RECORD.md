# IIPS v3.0 — NP-04 P2 Arena Implementation Handoff Record

## Handoff Preparation Record

**Program:** IIPS Engineering Standards — Program v3.0

**Decision identifier:** NP-04-P2-HANDOFF-R1 — Arena preparation of the common governed persistence package

**Document type:** HANDOFF PREPARATION RECORD — records that an implementation package has been
prepared in Arena and is awaiting Windows application. **This record does not establish
implementation durability.**

**Version:** 1.1 — Decision (amended in Arena: delivered package reconciled to the surviving artifact)

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
| Baseline tree | `db853dc21d01162e69b0e1211dbea1cb5c5f72b1` (independently rebuilt and confirmed in Arena) |
| Existing NP-04 persistence implementation | **NONE** — 0 paths matching `persist`/`sqlite`/`np04`/`migration`/`artifact` |
| Expected post-implementation tree | **`fb1d5c667f8bf76a2a0d4a3f23a0296df25f8edb`** — determined in Arena and independently recomputed (§6); Windows must confirm it |

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

**Delivered artifact: `docs/handoff/np04-governed-persistence/` — a self-contained handoff area
inside this checkout, with its own download server (`sh serve.sh`, port 8787).**

| Artifact | SHA-256 | Arena status | Windows authoritative status |
|---|---|---|---|
| `np04-handoff.tar.gz` | `9efb3c3f51301d5d0317be86fdcdd2ab0d5ee82db037a05b1ba3fbc346b86397` | **PREPARED** | **NOT YET APPLIED** |
| `np04-governed-persistence.patch` | `31390d183a85402dbc5323a2d93a019b8725bce44c86ec5126a73385b46b95fd` | **PREPARED** | **NOT YET APPLIED** |
| `np04-governed-persistence.mbox` | `d01614ca89176ac127f38b9e2062f1cbfd15e74026d17e96977e82b1ac34674d` | **PREPARED** | **NOT YET APPLIED** |

All are **Arena-only handoff artifacts**, labelled as such per the handoff gate §8. None is
asserted to be Windows-authoritative, and none is claimed as durable implementation.

The package is deliberately **resident inside the checkout and untracked**. It therefore survives
sandbox resets (which wipe everything outside the checkout) without appearing as a change set on
any branch. It is **not Git-durable**; only the Windows IPD checkout establishes durable Git state.

### 4.0 Durability correction — the earlier regeneration claim was WRONG and is withdrawn

An earlier revision of this record described a different package ("A": four files — `types.ts`,
`governedPersistence.ts`, `index.ts`, `tests/np04_governed_persistence.test.ts`; 4 added, 0
modified). It lived **outside** the checkout and was destroyed by a sandbox reset.

That revision asserted regeneration was safe *because the per-file SHA-256 values were recorded
durably in this record*. **That assertion is false and is hereby withdrawn.** A hash proves what
content *is*; it cannot recreate content that no longer exists. This record embeds no source (zero
fenced code blocks), no copy of the payload survives anywhere on the Arena filesystem, and the four
files are therefore **permanently unrecoverable**. The four-file hash table of the earlier revision
now describes nothing, **must not be used**, and package A is **withdrawn from this handoff**.

**Corrected rule, now enforced:** a handoff artifact that must survive a reset has to live **inside
the Git checkout**. Durably recorded hashes are an *integrity* control, never a *recovery* control.
The validation findings recorded against package A in the earlier §6 are moot for the same reason;
only the validation of the delivered package (§6) governs.

### 4.1 Delivered files (8 added, 1 modified, 0 deleted) — exactly 9 paths

| Destination in IPD | Status | SHA-256 |
|---|---|---|
| `package.json` | MODIFY | `74630b207fcb34cb0cac22955c16d2b0a9d3917e4c82b29a5a4464e6b7ef8c47` |
| `src/persistence/db.ts` | ADD | `3affb127b48783e9eef6b5011d6d7428e5a43957a47f12edcb3726de56efe6ec` |
| `src/persistence/errors.ts` | ADD | `ae859fa3b93b151231b300b2df9af2f41a9ba8496c15d3713b107fa096d692ed` |
| `src/persistence/identity.ts` | ADD | `f3325a23c1c0472f7c71f369c729086a163e272527815e5f510aeef1e18eafe3` |
| `src/persistence/index.ts` | ADD | `0e1d8c14742abb6a87a015ff3f713a42e98563343489499bc35a6c7921c9c156` |
| `src/persistence/reportKey.ts` | ADD | `c045d8b7dcf660508061f7931f223094cf690d5f5ae8a8543333a912152bcb57` |
| `src/persistence/schema.ts` | ADD | `7a89143793105ffb64abea46ade9cd27366266a4d6a27a7eb0f749773004d57c` |
| `src/persistence/store.ts` | ADD | `c21e24f610a63af1d662469ea76b12aa9710674e9d537111db3a3edca7291d92` |
| `tests/np04_governed_persistence.test.ts` | ADD | `b9f350b5d74d6054ba892c62d3ae33dd31f016cb0d136736a22a3c3ead3277e9` |

**The single modification** is an `engines` block in `package.json`: three added lines recording
`"node": ">=22.5.0"`, the floor required by `node:sqlite`. **No dependency, devDependency, or
lockfile change** — `package-lock.json` is explicitly unchanged. This is within the implementation
gate's bounded scope (authority §5 permits technology selection within its constraints), and is
recorded explicitly here so that a Windows scope check does not discover it as a surprise.

| Derived expectation | Value |
|---|---|
| Pre-change baseline tree | `db853dc21d01162e69b0e1211dbea1cb5c5f72b1` |
| **Post-change tree Windows must land on** | **`fb1d5c667f8bf76a2a0d4a3f23a0296df25f8edb`** |

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

The delivered package was validated **independently in Arena against the live authoritative IPD
baseline**, not accepted on its own recorded evidence:

| Check | Method | Result |
|---|---|---|
| Baseline tree | Rebuilt the complete 385-entry baseline tree from the authoritative IPD tree by Git plumbing | `db853dc2…` — **matches** |
| **Post-change tree** | Applied the delivered files to that baseline and recomputed every tree object | **`fb1d5c66…` — MATCH** |
| Change-set exactness | Implied by the tree match: one extra, missing, or altered path changes the root hash | **exactly 9 paths** |
| Patch fidelity | Parsed all 9 diffs and recomputed each blob from the patch body (the `package.json` hunk applied to the real baseline file) | **9/9 blobs == delivered files** |
| Per-file SHA-256 | `sha256sum -c` over the package's own `SHA256SUMS.txt` | **all payload files OK** |
| Container integrity | `sha256sum np04-handoff.tar.gz` | `9efb3c3f…` — **matches `TARBALL.sha256`** |
| Typecheck | `tsc --noEmit` under IPD's exact `tsconfig` with the **lockfile-pinned** toolchain (`typescript@5.9.3`, `@types/node@22.20.4`) | **exit 0** |
| Compile | `tsc` | **exit 0** |
| NP-04 suite | `node --test dist/tests/np04_governed_persistence.test.js` | **22 pass / 0 fail / 2 suites** |
| Frozen engine non-modification | sha256 of `iips-platform/.../reporting/ReportingEngine.ts` in this checkout | `5eaf7968…` — **matches the recorded value; unmodified** |
| Consumer-neutrality | search for `ReportsStore` / `ReportsRepository` across all 9 delivered files | **absent** |
| Dependency surface | import graph of the delivered module | **`node:sqlite`, `node:crypto`, `node:fs`, `node:path` + relative only** |

**Toolchain note, recorded because it nearly produced a false defect:** validating against the
*`package.json` ranges* (`typescript@5.8.2`, `@types/node@22.13.9`) yields **20 typecheck errors**;
validating against the **lockfile pins** (`5.9.3` / `22.20.4`) yields **exit 0**. `npm ci` installs
the pins, so **exit 0 is the correct expectation** and the 20-error result was an artefact of the
wrong toolchain. Windows must use **`npm ci`, not `npm install`** — which also avoids rewriting the
lockfile into a tenth changed path.

**Not independently verified in Arena:** the package's recorded full-suite result
(`564 pass / 0 fail`, from its own `validation/full-suite.tap.gz`) requires the complete IPD
checkout plus `node_modules`. It is **package-provided evidence only** and must be reproduced on
Windows (step 5).

## 7. Open items carried to Windows

1. **`queryByOwner` page semantics — settled by the delivered artifact, still to be confirmed by the
   consumer.** The delivered implementation returns **one current version per instance chain**
   (heads-only), and test 21 asserts it. This is the opposite of the literal "every version" reading
   chosen by the now-withdrawn package A. The ambiguity is therefore settled *by the artifact*, but
   must still be confirmed by NP-06 before Reports consumes the interface.
2. **`node:sqlite` experimental status** (§3.2) — explicit accept/reject decision required.
3. ~~Expected post-implementation tree not determinable~~ — **RESOLVED.** The tree is determined:
   `fb1d5c667f8bf76a2a0d4a3f23a0296df25f8edb` (§4.1). Windows must confirm it (step 6).
4. **`server.js` working copy differs from the packaged copy.** The extracted
   `docs/handoff/np04-governed-persistence/server.js` was edited in Arena (a serving-time live file
   index). The copy **inside the tarball is pristine** and matches `SHA256SUMS.txt`. This file is
   **not one of the 9 changed paths** and cannot affect the IPD result. Recorded so that a
   `sha256sum -c` over the extracted working copy is not mistaken for a payload defect.

## 8. Windows handoff procedure

The artifacts are exposed through an **Arena download server** (authority record §9.2: *"Arena must
expose the artifact through the download server, with a manifest carrying per-file SHA-256
values"*), serving a live index with the per-file hash table and the package. **The download URL is
sandbox-scoped and therefore deliberately not recorded durably here** — a durable governance record
must not carry an ephemeral endpoint. The package carries the hashes, which is what durability of
the artifact requires.

Full instructions are in the package's `README.md` §3 and `MANIFEST.md`. Required sequence:

1. **Baseline** — confirm the IPD checkout is at `4d3e1cdca3a33da0ec3be8b336b17128108a502c` **and**
   that `git rev-parse HEAD^{tree}` is `db853dc21d01162e69b0e1211dbea1cb5c5f72b1`. **Stop rather than
   force-apply on mismatch** (authority record §9.3). Create the working branch before applying.
2. **Verify** — checksum the patch against `31390d18…` (and/or the tarball against `9efb3c3f…`),
   then verify each of the **9** extracted files against §4.1. **On mismatch: STOP.**
3. **Apply** — `git apply --index --verbose np04-governed-persistence.patch` (or extract the tarball).
4. **Install and validate** — `node --version` (≥ 22.5.0); **`npm ci`** (never `npm install`);
   `npx tsc --noEmit` (exit 0, no output); `git diff --name-only` (empty); `npx tsc`; then
   `node --test dist/tests/np04_governed_persistence.test.js` (expect **22 pass / 0 fail**) and
   `node --test dist/tests/*.test.js` (expect **564 pass / 0 fail**). Record **exact exit codes and
   counts**.
5. **Scope** — `git status`, `git diff --stat`, `git diff`; confirm **exactly the 9 authorized paths**
   changed and nothing else, and a clean worktree after staging.
6. **Tree and durability** — `git rev-parse HEAD^{tree}` must equal
   `fb1d5c667f8bf76a2a0d4a3f23a0296df25f8edb`; then stage, commit, push; then independently verify
   the remote commit, remote tree, changed blobs, reachability, tracking ref, `LOCAL == REMOTE`, and
   a clean worktree.
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
