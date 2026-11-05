# IID-4 — independent verification

**What "independent" means here.** Not a re-run of the commands in the workspace that produced the evidence, but a
**fresh clone of the pushed branch into a different directory**, with its own `npm install`, its own temporary NP-04
databases, and its own run of every command. The point is to catch the class of failure a working tree hides: an
untracked file the code needs, a generated artifact assumed present, a path that only resolves in place.

## Method

```bash
git clone --depth 1 --branch arena/c39a5d68-iips-review-recovered \
  https://github.com/ramkivs/iips-review-recovered.git /home/user/verify/iid4
cd /home/user/verify/iid4/iips-platform && npm install && ./node_modules/.bin/tsc --noEmit
cd /home/user/verify/iid4/iips-platform && ./node_modules/.bin/tsx --test tests/investment/*.test.ts
cd /home/user/verify/iid4/frontend && npm install && ./node_modules/.bin/tsc -p tsconfig.investment-server.json --noEmit
cd /home/user/verify/iid4/frontend && ./node_modules/.bin/vitest run server/investment
cd /home/user/verify/iid4/frontend && ./node_modules/.bin/tsx server/investment/cli/disposition-demonstration.ts --out /tmp/iid4-verify-demo
```

The clone was of the **branch as pushed** (commit `3bc70c3`), not of `main`: IID-4 is not merged, so the branch is the
artifact under test. Verification of the merged `main` is not claimed and cannot be until the pull request merges.

## Results

| Check | Result |
|---|---|
| clone | succeeded; the ten disposition engine files and all test files are present |
| platform `tsc --noEmit` | **exit 0**, no diagnostics |
| platform suite | **377 tests, 377 pass, 0 fail** |
| frontend `tsc -p tsconfig.investment-server.json` | **exit 0**, no diagnostics |
| frontend suite | **9 files, 112 tests, 112 pass** |
| demonstration | **8 of 8 points PASS** |

## Reproducibility of identity

The demonstration was run in two independent clones (the workspace and the fresh clone), each creating its own
temporary NP-04 database. Comparing the two records:

| Item | Workspace run | Fresh-clone run | Equal? |
|---|---|---|---|
| held chain `reportKey` | `910d6db385b32e1bc470a4a37f4faaf020e2549c09b177403c0c183f56e0c7c6` | same | **yes** |
| candidate chain `reportKey` | `4f68d3c3f0ad755967dbe695ec59c85b7326a1fbe25dd461b3524330500be896` | same | **yes** |
| held payload digest (`payloadDigest` in provenance) | identical | identical | **yes** |
| held input digest (`inputDigest`) | identical | identical | **yes** |
| candidate payload body | identical | identical | **yes** |
| verbs | AVOID (held), AVOID_CANDIDATE (candidate) | same | **yes** |
| assessment **`reportId`** | `bf5a5ed2-…` | `becb4f6f-…` | **no — by design** |

A field-by-field diff of the two held payloads produced exactly one difference: `companyAssessmentRef.reportId`, the
store-assigned instance identity. That is the same finding IID-3 recorded for assessments — instance identity is
assigned by the boundary and is not a function of content — and everything that *is* a function of content
(`reportKey`, payload digest, input digest, verb, rationale, bands) reproduces byte for byte.

## What this verification does **not** prove

- It does not prove the surface works against a **real** portfolio or a **real** issuer. The portfolio view in the
  demonstration is a synthetic `G2PortfolioView` and the company is the IID-2 synthetic reference company (`L-004`,
  `L-009`).
- It does not prove the browser surface exists. No UI was built; IID-6 owns it.
- It does not prove behaviour under a large portfolio, a long chain, or a concurrent writer. Chain length is bounded
  by the existing scan bound (`L-010`), and the write path is the existing one, unchanged in its concurrency
  behaviour.
- It does not prove `L-014` is resolved. It proves the phase's disclosure of it is deterministic.
