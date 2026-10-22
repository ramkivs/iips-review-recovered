# IIPS v3.0 — Gate 3: Native Windows Evidence, Act Conformance, and Acceptance Eligibility

**Date:** 2026-10-22 (UTC). **Author:** Arena Agent. **Session branch:** `arena/17d363e9-iips-review-recovered`.
**Gate 3 status: BLOCKED / NOT ACCEPTED.** Formal acceptance is **not** rendered; §10.1 conditions remain unmet — see §6.

> **Currency pointer (`2026-10-22`, post-PR-#41 additive reconciliation — tracker `§16.74` / `CV-CORR-55`):** The historical body of §§1–9 below is preserved intact as the pre-publication record of `arena/17d363e9`. Following its merge (`PR #176`), the operator published conformant commit **`d15582d68167461e814ec8f7873dc18e3df5ab71`** (`g3/windows-validated-20261022-145739`, exact root tree **`5edb9fe79e7e907be661ea10c7021a96be762821`**) on **IPD PR #41**, where hosted GitHub Actions CI run **`39755870871`** (`119747608450` / `119747795175`) passed (**784 executed, 783 passed, 0 failed**), and IRR's full suite was freshly re-executed (**87 files / 1,077 tests passed / 0 failed**). See **§10 below** and the full prepared packet [`IIPS_v3.0_G3_AMEND_01_BASIS_DRIFT_AND_EVIDENCE_BOUNDARY_2026-10-22.md`](./IIPS_v3.0_G3_AMEND_01_BASIS_DRIFT_AND_EVIDENCE_BOUNDARY_2026-10-22.md). **Gate 3 remains `BLOCKED / NOT ACCEPTED` and IPD PR #41 remains `OPEN / UNMERGED` pending explicit Program Authority determination on `G3-AMEND-01`.**

**Environment boundary.** Arena has not accessed the operator's Windows filesystem, worktree or log. The
native result in §1 is operator-supplied evidence quoted as supplied. All other findings are from
repository data reachable from Arena.

---

## 1. Native Windows evidence — recorded

**Native Windows direct TAP full suite — PASS: 754 total, 750 passed, 0 failed, 0 cancelled, 4 skipped, exit code 0.**

| Binding field | Value |
|---|---|
| Base commit | `3eb13ed637ac61bd971da1a06883da4b4564447b` |
| Candidate patch SHA-256 | `5745647e32b1da67fb984a7748406921aefb495000dfcbfdd9255133cad5fe0a` (18,900 B) |
| Files changed | `src/ipc/dispatch.ts`, `tests/g3_binding_resolution.test.ts`, `tests/g3_ipc_framing.test.ts` |
| Worktree | `C:\Users\USER\Downloads\G3\connection-release-validation-20261022-011815` |
| Log | `C:\Users\USER\Downloads\G3\g3-connection-release-direct-tap-20261022-013113.log` |
| Raised at | 2026-10-22 01:37:27 local |

### 1.1 Independent corroboration that the run used this exact candidate

The supplied totals are internally consistent with the artifact in a way that would not hold for a
different candidate or a different file set:

| Check | Supplied Windows | Arena (POSIX, same candidate) | Agreement |
|---|---|---|---|
| Total tests | 754 | 754 | exact |
| Passed | 750 | 753 | Δ3 |
| Skipped | 4 | 1 | Δ3 — **the same 3 tests shift from pass to skip** |
| Failed / cancelled | 0 / 0 | 0 / 0 | exact |
| Pass + skip | 754 | 754 | conserved |
| Source ↔ compiled test inventory | 57 ↔ 57 | `tests/*.test.ts` = **57**, `dist/tests/*.test.js` = **57** | exact |

The Δ3 is fully explained by platform-conditional test selection, verified in source: `posixOnly`
guards in `tests/g3_no_network_listener.test.ts` (2) and `tests/g3_startup_validation.test.ts` (2) —
four tests that skip on Windows — against one `windowsOnly` test in `g3_no_network_listener` that skips
on Linux. Windows therefore skips 4, Linux skips 1, and the three-test difference appears as
pass→skip, not as pass→fail.

**Conclusion:** the supplied Windows run is attributable to the exact three-file content identified by
the patch hash above. This is corroboration, not identity proof — Arena did not observe the host.

### 1.2 Evidence categories, kept distinct

| Category | Disposition |
|---|---|
| Native Windows direct TAP full suite | **PASS** — 754 / 750 / 0 / 0 / 4, exit 0, on the supplied isolated candidate |
| Canonical Windows `npm test` wrapper | **FAILED** — summary-parser incompatibility on the emitted `ℹ`/CRLF marker; the suite itself passed. **Not a passing command on Windows.** |
| Published candidate identity | **NOT PUBLISHED** — see §5 |
| Hosted CI at the published commit | **NOT RUN** — no published commit exists |
| Formal Gate 3 acceptance | **NOT ACCEPTED** — see §6 |

The direct TAP result must not be represented as a successful `npm test` invocation, and the wrapper
failure must not be used to discount the suite result.

---

## 2. Act-basis reconciliation and a material conformance defect found

### 2.1 The act's constraints

`IIPS_v3.0_G3_GATE3_IMPLEMENTATION_AUTHORITY_ACT_EFFECTIVE_2026-10-19-02.md`:

- §1.1/§2.1: IPD basis **immutable** at `main @ be32d8c95a86b3f03bd382ccde5b6398efb351c6`, recorded with
  "**No material drift.** Both remote heads equal the reported baselines exactly."
- §4.1: "This act authorizes **zero** modifications to existing IPD files. Every authorized change is an
  addition." Ten byte-stable anchors are listed, including `.github/workflows/ci.yml` @
  `aeee464feb76e2d1e9d104e1cae4e5dde37700ad`.
- §4.3 / §7: "**No test-runner, script or configuration change is required or authorized**";
  `.github/workflows/ci.yml` → **"No change."**
- §10.1 condition 1: the §4 manifest is present and "**no path outside the §4 manifest** differs from
  `be32d8c9`".

### 2.2 Frozen-anchor violation in the candidate lineage

| Commit | `.github/workflows/ci.yml` blob | vs frozen anchor `aeee464f` |
|---|---|---|
| `be32d8c` (basis) | `aeee464f…` | — |
| `673ec75` | `f5af260e…` | **VIOLATION** |
| `3eb13ed` (PR #34 head) | `f5af260e…` | **VIOLATION** |
| `main @ c0e1b56` (current) | `aeee464f…` | compliant |

`673ec75` ("reconstructed Gate 3 manifest on the authorized parent (state at `14e2f5a`)") converted the
CI job to a two-leg `ubuntu-latest` + `windows-latest` matrix and gated "Publish executed test count" to
the Ubuntu leg (+10/−2). `3eb13ed` inherited it unchanged.

**Consequence:** the Windows-tested candidate — `3eb13ed` plus the tested patch — differs from the
pinned basis at a **frozen, non-manifest path**. §10.1 condition 1 therefore **FAILED** as tested.
No amendment authorizes that `ci.yml` change: the only amendment records in IRR are the G2 DP-1
amendments (`IIPS_v3.0_G2_IRR_DP1_*`), none of which touches the Gate 3 IPD manifest.

### 2.3 Conformant candidate produced

Restoring `ci.yml` to its frozen anchor on top of the tested patch yields a basis-exact candidate. This
is a **removal of an unauthorized change**, not a new modification, and it is config-only.

| Property | Result |
|---|---|
| Commit | `de09b2d64531594aaaaec0d70bd90939ad5d1e01` |
| Tree | `5edb9fe79e7e907be661ea10c7021a96be762821` |
| Paths differing from `be32d8c9` | **22 — all additions** (14 `src/` + 8 `tests/`) |
| Modified existing files | **0** |
| Paths outside the §4 manifest | **0** |
| §4.1 frozen anchors (all 10) | **byte-stable** — verified individually |
| `frontend/**`, `iips-platform/**` | unchanged |
| The three tested files | **byte-identical** to the tested hashes (`8466c704…`, `6ae6a2ac…`, `ffbce918…`) |

**Because `ci.yml` is CI configuration and is never executed by `node --test`, restoring it cannot
change any test outcome. The native Windows result in §1 therefore remains applicable to this
conformant candidate without re-running the suite** — the executed code and test files are
byte-identical. This is the basis for reusing the evidence rather than repeating 754 tests.

### 2.4 Act-basis drift — unresolved and authority-level

`main` no longer equals the act's "immutable" basis:

| Measure | Value |
|---|---|
| Pinned basis | `be32d8c9` |
| Current `main` | `c0e1b56` ("Merge pull request #40 … D06 addendum") |
| Commits since basis | **31** |
| Files changed since basis | **94** |
| `src/ipc` / `src/persistence` on current `main` | **0 files** |

So the act's recorded statement "No material drift" is **no longer true**. Even with §2.3's conformant
candidate, §10.1 condition 1's literal test — "no path outside the §4 manifest differs from
`be32d8c9`" — cannot hold for a merge **onto current `main`**, because the other 31 commits' 94 paths
differ. Resolving this requires a **PA amendment re-pinning the basis** (or an explicit ruling that
condition 1 is to be evaluated on the PR diff against its merge base rather than against `be32d8c9`).
That is a decision Arena cannot render. Draft request: §8.

Note that PR #34's own recorded base is `main@3d44e0a1`, which is itself 27 commits past `be32d8c9` —
so the drift predates this pass and affects the lineage, not only the new candidate.

---

## 3. Test-runner disposition

**No change authorized, and none made.** Act §4.3 and §7 state that no test-runner, script or
configuration change is "required or authorized", and §4.1 freezes `run-tests.mjs`'s directory context
via the §7 substitution rule ("These are the existing `ci.yml` steps; no substitution is authorized").

The Windows wrapper failure is the known `^# tests (\d+)$` parser incompatibility (Unicode `ℹ` marker
and/or CRLF), not a test failure. It is **not** corrected here, because:

1. no PA ruling authorizes a bounded `scripts/run-tests.mjs` correction; and
2. correcting it would expand the manifest outside §4 — the same defect class as §2.2.

**Does §10.1 condition 3 require the wrapper?** It requires "`npx tsc --noEmit`, `npm run build`,
`npm test` pass with a non-zero executed count, ≥ 556 tests and zero failures" — i.e. the canonical
wrapper, run as CI runs it. §10.2 states "Both repositories' CI runs `ubuntu-latest` only". On that
platform the wrapper **passes** (`[test-guard] OK — 754 test(s) executed, 753 passed, exit 0`).
**Condition 3 is therefore satisfiable via the Ubuntu CI leg; the Windows wrapper failure is a
host-level Gate 4 item, not a Gate 3 blocker.** The direct TAP route is permissible evidence for the
host, and is not a substitute for the wrapper on the CI platform — nor is the wrapper a substitute for
host evidence. Both are recorded distinctly in §1.2.

---

## 4. Validation executed in this pass (POSIX)

On the conformant candidate `de09b2d` (`/tmp` clone of the IPD repository at `be32d8c9` + conformant tree):

| Check | Command | Result |
|---|---|---|
| Typecheck | `npx tsc` | **PASS**, exit 0 |
| Focused IPC tests | `node --test dist/tests/g3_ipc_framing.test.js dist/tests/g3_binding_resolution.test.js` | **PASS** — 43 tests, 43 passed |
| Full suite (canonical wrapper) | `npm test` | **PASS** — 754 executed, 753 passed, 0 failed, 1 skipped; `[test-guard] OK`, exit 0 |
| Manifest conformance | diff-stat vs `be32d8c9` | **PASS** — 22 additions, 0 modifications, 0 outside |
| Frozen anchors | 10 individual blob comparisons | **PASS** — all byte-stable |
| Artifact integrity | apply to pristine `be32d8c9`; to `3eb13ed` | **PASS** — clean both |

**NOT RUN this pass:** IRR `npm run test:ci` (§10.1 condition 4) — not re-executed; the last recorded
figure is 73 files / 814 tests / 0 failed at PR #157 (tracker §16.62). **NOT VERIFIED** in this pass.
**NOT RUN:** any Windows execution; `npx vite build` on the conformant tree (unchanged from the tested
tree by construction; the tested tree's build passed).

---

## 5. Publication

### 5.1 Produced artifacts (this repository)

| Artifact | Base | Size | SHA-256 |
|---|---|---|---|
| `docs/integration/artifacts/g3-connection-release-conformant.patch` | `be32d8c9` | 195,830 B | `5f38f941a80771db9bdd987d2dd8f8e8f2eda0e014aea17ba120dc5957766fc4` |
| `docs/integration/artifacts/g3-ciyml-conformance-delta.patch` | `3eb13ed` | 19,992 B | `fec8212967a247433e6e7ba727b7ef7d235ed2d1a98773d0a92769f3c95e390a` |
| `docs/integration/artifacts/g3-connection-release.patch` (unchanged, **Windows-tested**) | `3eb13ed` | 18,900 B | `5745647e…` |

The delta artifact converts the operator's already-built and tested worktree into the act-conformant
tree: `.github/workflows/ci.yml` restored to the frozen anchor plus the same three-file correction.
It applies cleanly to `3eb13ed` (verified).

### 5.2 IPD remote — BLOCKED

The conformant commit `de09b2d` **is not on the IPD remote and cannot be pushed from Arena**: the
active App installation token has no `contents:write` on `ramkivs/iips-production-market-data`
(`git push` → `403 Permission … denied`; API ref creation → `403 Resource not accessible by
integration`), while the same token writes this repository. **IPD PR #34 remains OPEN, unmerged, head
`3eb13ed`.** Consequently no IPD hosted CI run can exist for the candidate, and §10.1 condition 7 —
which requires the record to state "CI run identifiers" at the exact commits — cannot be satisfied.

---

## 6. §10.1 condition-by-condition eligibility

| # | Condition | Status |
|---|---|---|
| 1 | §4 manifest present; no path outside it differs from `be32d8c9` | **MET** at `de09b2d` (§2.3). **FAILED** at the as-tested `3eb13ed` (§2.2). Cannot be met for a merge onto current `main` without an amendment (§2.4) |
| 2 | IRR §5.1/§5.2 present; §5.3 blobs still `cb8db45d…` / `51704c12…` | **MET** — both blobs verified byte-identical at IRR `HEAD` |
| 3 | IPD `tsc`/`build`/`npm test` pass, non-zero, ≥ 556, zero failures | **MET on ubuntu-latest** (754 executed, 753 passed). **FAILED on Windows** (wrapper parser); host-level, per §10.2 |
| 4 | IRR `typecheck`/`test:ci`/`assert-tests`/`build`, ≥ 814 tests, zero failures | **NOT VERIFIED** this pass (recorded 814 at PR #157) |
| 5 | §4.3 tests present in executed sets and named in the record | **MET** — 8/8 present; all named in §3 of the act and executed |
| 6 | `SESSION_ONLY`/`durable:false`, 29-key guard, `503` fence, both fence blobs unchanged | **MET** — all 10 §4.1 anchors byte-stable, incl. `portfolioStorePort.ts` (`d61f18df…`) |
| 7 | Record states exact commits, commands, counts and CI run identifiers; disclaims Gate 4/5/production | **NOT MET** — requires IPD CI run identifiers at a published commit; publication is blocked (§5.2) |

**Gate 3 acceptance is NOT eligible.** Two independent bars remain: condition 7 cannot be met without
IPD publication (environmental authority), and condition 1 cannot be met for a merge onto current
`main` without a PA amendment re-pinning the basis (authority).

---

## 7. Remaining blockers

| Class | Blocker |
|---|---|
| **Authority** | Act-basis drift: `main` is 31 commits / 94 files past the "immutable" `be32d8c9`. §10.1 condition 1 cannot hold for a merge onto current `main`. Requires a PA amendment re-pinning the basis, or a ruling that condition 1 is evaluated on the PR diff against its merge base (§8). |
| **Authority** | The `ci.yml` matrix change in `673ec75`/`3eb13ed` is unauthorized by the act; the conformant candidate removes it, but the *published* PR #34 still carries it and would need the same restoration if it is the vehicle. |
| **Environmental** | Arena cannot write to the IPD repository (`403`), so the conformant candidate cannot be published, no hosted CI can run, and §10.1 condition 7 cannot be satisfied. |
| **Environmental** | No PA ruling exists authorizing a `scripts/run-tests.mjs` correction; the Windows wrapper remains failed and cannot be fixed within the manifest. |
| **Technical** | §10.1 condition 4 (IRR ≥ 814) not re-verified in this pass. |
| **Technical** | Native evidence covers only the isolated worktree; it does not cover a published commit, and it is operator-supplied rather than Arena-observed. |

---

## 8. Minimum amendment request (draft — PA decision required)

> **G3-AMEND-01 — Basis re-pin for Gate 3 acceptance.** Request the Program Authority determine
> whether §10.1 condition 1 is to be evaluated (a) against `be32d8c9` as literally written, which is no
> longer reachable for a merge onto `main` now 31 commits ahead, or (b) against the PR's diff relative
> to its merge base, with the §4.1 frozen anchors verified absolutely as done in §2.3. Option (b)
> requires no manifest change and preserves every frozen anchor; option (a) requires either merging
> onto the old basis (contradicting §4.1's "merged on `main`") or a re-pinned basis SHA.
> **Also requested:** confirmation that restoring `.github/workflows/ci.yml` to its frozen anchor in the
> implementation commit is the correct treatment of the `673ec75` matrix change, and that the direct TAP
> route satisfies the host-evidence requirement of §10.2 without a `scripts/run-tests.mjs` amendment.

---

## 9. Status

**Gate 3 remains BLOCKED / NOT ACCEPTED.** A basis-exact, fully validated candidate now exists and the
native Windows full suite has passed on byte-identical code. Formal acceptance is withheld because
§10.1 conditions 1 (for a merge onto current `main`) and 7 are unmet, the first for an authority reason
and the second for an environmental one. No Gate 4/QE, Gate 5, production eligibility, `503` lift or
`durable:true` is granted or implied.

---

## 10. Post-PR-#41 Additive Reconciliation (`2026-10-22`; `CV-CORR-55` / Tracker `§16.74`)

The pre-PR-#41 statements in §§1.2, 4, 5.2, 6, 7, 8, and 9 are preserved as event-time history and reconciled against live repository state verified on `2026-10-22`:

1. **Candidate publication & provenance reconciled (preserving prior limitation):**
   - Ephemeral sandbox commit `de09b2d64531594aaaaec0d70bd90939ad5d1e01` (§2.3) remains absent from all remote refs (provenance limitation preserved).
   - Operator-published **IPD PR #41** (`ramkivs/iips-production-market-data#41`, branch `g3/windows-validated-20261022-145739`, commit **`d15582d68167461e814ec8f7873dc18e3df5ab71`**, parent `3eb13ed637ac61bd971da1a06883da4b4564447b`, merge base `be32d8c95a86b3f03bd382ccde5b6398efb351c6`) **remotely materializes the exact same root tree `5edb9fe79e7e907be661ea10c7021a96be762821`**, including `.github/workflows/ci.yml` restored to `aeee464feb76e2d1e9d104e1cae4e5dde37700ad` and exact LF SHA-256s `8466c704…` (`src/ipc/dispatch.ts`), `ffbce918…` (`tests/g3_binding_resolution.test.ts`), and `6ae6a2ac…` (`tests/g3_ipc_framing.test.ts`).
2. **Hosted CI on PR #41 (`ubuntu-latest`) verified:**
   - GitHub Actions workflow run **`39755870871`** (`https://github.com/ramkivs/iips-production-market-data/actions/runs/39755870871`) on merge preview commit **`ce25a184d3dc22cd2d6e5c0ff9f277f3d541de5d`** (tree `b2dd2debb295fa28bda7efdd70a66b4cfe9337a9` = `main@c0e1b566…` + `d15582d6…`): check **`119747608450`** (`typecheck · build · test`) = **`SUCCESS`**; check **`119747795175`** (`executed test count`) = **`SUCCESS`** (**`784 tests executed — 783 passed, 0 failed`**, `1` `windowsOnly` skipped). Windows `npm test` (`scripts/run-tests.mjs`) remains **FAILED** on its summary parser and is **never** represented as passing; direct TAP (`750` passed, `0` failed, `4` skipped) remains separate operator-supplied evidence.
3. **IRR §10.1 Condition 4 freshly re-verified:**
   - Executed live in `frontend/` at `1d414609ce5fdfd4c61afb65b53ec196f3ddc25b`: `npm run typecheck` exit `0`, `npm run test:ci` **87 files / 1,077 tests passed / 0 failed**, `assert-tests: OK — 87 test file(s), 1077 test(s), 0 failed`, `npm run build` exit `0` (matching hosted IRR CI run `39669391014` `success`).
4. **Refinement to §8 (`G3-AMEND-01` Question 1) & remaining boundary:**
   - Between `be32d8c9…` and `c0e1b566…`, **3 of the 10 §4.1 anchors** legitimately updated on `IPD main` in PA-authorized PRs (`portfolio-store.ts` `3bf852b9… → b900a248…` in PR #30; `security_master.ts` `e260fd90… → 60030e0c…` in PRs #28/#30; `package-lock.json` `d3d7b12b… → 98ae3c63…` in PR #32), while **10/10** match `be32d8c9…` at `d15582d6…` and **10/10** match `c0e1b566…` at `ce25a184…` (`0` modifications by PR #41). Full evaluation and prepared PA decision text are recorded in [`IIPS_v3.0_G3_AMEND_01_BASIS_DRIFT_AND_EVIDENCE_BOUNDARY_2026-10-22.md`](./IIPS_v3.0_G3_AMEND_01_BASIS_DRIFT_AND_EVIDENCE_BOUNDARY_2026-10-22.md).
   - **Gate 3 remains `BLOCKED / NOT ACCEPTED`** and **IPD PR #41 remains `OPEN / UNMERGED`** pending explicit PA determination on `G3-AMEND-01` and operator/token write access on IPD (`git push --dry-run` verified `HTTP 403`).
