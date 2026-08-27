# GATE-G1-M — Repository Authority Store Establishment

- **Record ID:** `GATE-G1-M`
- **Title:** Repository Authority Store Establishment
- **Class:** `GATE`
- **Status:** `RECORDED`
- **Date/time:** 2026-08-27
- **Authority relationship:** derives from gate **G1** (*Durable Authority Establishment*), which
  returned **B — REPOSITORY AUTHORITY STORE REQUIRED**; binds only the establishment of this
  directory and its convention. It binds no implementation.
- **Scope:** creation of `governance/iips/README.md` and `governance/iips/GATE-G1-M.md`, one
  governance-only commit, and its publication to `origin`. Expressly **excludes** all implementation,
  the G-AI-IMPL delta, and decisions B1–B4 and S1–S4.
- **Provenance:** produced by the G1-M and G1-M-AUTH read-only gates; grants issued explicitly by the
  maintainer at G1-M-AUTH.

---

## 1. Purpose

Establish a minimal durable repository location and convention for IIPS programme authority records.

## 2. Preceding result

**G1 = B — REPOSITORY AUTHORITY STORE REQUIRED**, with `DURABILITY = FAIL` and
`DURABILITY: D4 — UNRESOLVED`.

## 3. Why repository authority storage was required

| Finding | Evidence |
|---|---|
| `/home/user` is not durable | Sandbox re-clones destroyed every out-of-repo authority record written earlier in the programme; surviving records post-date the most recent clone |
| No existing durable authority store | No git ref held any authority record |
| No existing governance decision-record convention | `governance/` contained four unrelated files; `decision-record` and `authority record` occurred in 0 repository files; the ADRs cited by `ENGINEERING_READINESS_REVIEW.md` do not exist in either tree |
| No external authority store | Only `origin` is configured |
| The repository is demonstrably durable | Every re-clone restores from `origin`; live remote refs verified intact at each gate |

The repository therefore is the required store, and establishing it required controlled mutation.

## 4. The exact mutation

Exactly two paths, both new:

```
governance/iips/README.md
governance/iips/GATE-G1-M.md
```

No other path was created, modified, deleted, renamed, restored, copied, staged, committed or pushed.
Verified disjoint from: the 11 G-AI-IMPL implementation paths; the six recovery-only AI files;
`frontend/server/admin-transport.ts` and `guardRead`; all frontend implementation; all tests outside
these two files; policy and schema files; canonical and recovery baseline content; and the four
pre-existing `governance/` files.

## 5. The three required grants

| Grant | Operation | Status at G1-M-AUTH | Issued |
|---|---|---|---|
| 1 | Create the two governance files | NOT AUTHORIZED | **Granted explicitly by the maintainer** |
| 2 | One governance-only commit on `arena/01a03e3b-iips-review-recovered` | NOT AUTHORIZED | **Granted explicitly by the maintainer** |
| 3 | Push that commit to `origin` | NOT AUTHORIZED | **Granted explicitly by the maintainer** |

G1-M-AUTH returned **E — MULTIPLE GRANTS REQUIRED** because no grant was present in the gate text;
configured Git credentials were expressly not treated as authorization. All three were subsequently
issued explicitly before any mutation occurred.

## 6. No-implementation boundary

This record establishes **only** a durable location and convention. It does **not** establish or
decide:

- G-AI-IMPL authorization;
- the G-AI-IMPL implementation specification;
- **B1** executable baseline;
- **B2** treatment of the three NEW-path collisions;
- **B3** treatment of the two absent MODIFY targets;
- **B4** SR-4 / `guardRead` formulation;
- **S1** `AiAdvisor` behavioural contract;
- **S2** advisory text;
- **S3** `advise()` vs `executeWithAi`;
- **S4** related advisory semantics.

**G-AI-IMPL implementation remains BLOCKED.** The next gate is the durable reconstitution and
substantive authority-decision gate.

## 7. Resulting commit

- **Commit:** the single governance-only commit that introduces this file. Its hash is necessarily
  **not recorded inside it** — writing the hash into the file changes the hash. It is recoverable
  exactly and at any time from Git history:

  ```
  git log --oneline -- governance/iips/GATE-G1-M.md
  ```

- **Initial (pre-amend) hash, for reference:** `6a1d7fcf73042736ba24c0a37cfe21b012cfcb04` (`6a1d7fc`).
  The commit was amended once, to replace the hash placeholder in this section with the explanation
  above; the amend produced the final hash. Both commits contain exactly the same two paths.
- **Branch:** `arena/01a03e3b-iips-review-recovered`
- **Baseline before commit:** `c65d53373717aacc3a1dce12d47b5aeaf50541a5`
- **Parent:** `c65d53373717aacc3a1dce12d47b5aeaf50541a5`
- **Contents:** the two governance files only — `governance/iips/README.md`,
  `governance/iips/GATE-G1-M.md`. No implementation path, no baseline content, and no pre-existing
  `governance/` file is included.

## 8. Push result

Publication of this commit to `origin` was authorized explicitly at G1-M-AUTH (Grant 3) and is
performed immediately after this commit is finalized. The push is necessarily **not** recorded inside
the commit it publishes — amending after a push would require a force-push, which is not authorized.

The push outcome is therefore recorded in the gate's out-of-band report and is verifiable from the
remote itself:

```
git ls-remote origin refs/heads/arena/01a03e3b-iips-review-recovered
```

## 9. Durability result

Durability is **claimed only once** the ref above resolves to this commit on `origin`. Until that is
confirmed, the state is `LOCAL ONLY` and no durable authority is asserted.

Once confirmed, `governance/iips/` survives sandbox re-clone, because re-clones restore from `origin`
— the property that motivated this record's location.
