# AC-X6 / G-8 — is `golden-tech.json` subject to the fixture-size bound?

**Determination: no. AC-X6 is PASS, and G-8 closes as *not a breach*.** The 100 KB bound applies to **committed
fixtures** (data class (b)); `golden-tech.json` is **committed test evidence** (data class (c)) and is governed by a
different rule. No file was shrunk, moved or regenerated to reach this conclusion.

---

## 1. The requirement, and the scope it states

Design §6.8 states the gate compactly:

> "Dataset and artifacts external to git; committed fixtures each <100 KB."

The design then defines what each data class is, and this is the clause that decides the question (design §I.2 rule 3,
`:2228–2231`):

> "**Data classification.** (a) *User data and artefacts* — under `${IIPS_DATA_DIR}`, gitignored, never committed;
> (b) *committed fixtures* — synthetic or public-domain extracts, **each < 100 KB**, no PII; (c) *test evidence* —
> sanitized summaries (counts, pass/fail, digests), never raw user data or partition literals."

Roadmap §B.I.4 (`:888–894`) implements the three classes as three concrete locations:

| Class | Where | Committed? |
|---|---|---|
| user data and artefacts | `${IIPS_DATA_DIR}/investment/**` | no — gitignored (`.iips-data/`) |
| small synthetic fixtures | `iips-platform/tests/investment/fixtures/` (**<100 KB total**) | yes |
| sanitized test evidence | `evidence/iid/**` | yes |

The bound is attached to **class (b)** and to the directory that class occupies. Class (c) carries a *content* rule
("sanitized summaries … never raw user data or partition literals"), not a size rule.

---

## 2. Which class each artefact actually belongs to

`golden-tech.json` lives at `evidence/iid/IID-2-COMPANY-ASSESSMENT-2026-11-06/golden-tech.json` — the class (c) location,
not a `fixtures/` path. Its companions are the small digests file and the human-readable artefacts of the same evidence
bundle; it is a **recorded expected output** used to pin the assessment engine, not an input handed to a run.

## 3. The size facts, re-measured at this commit (verbatim output in `commands-and-outputs.txt` §8–§9)

| Artefact | Class | Size |
|---|---|---|
| `iips-platform/tests/investment/fixtures/` (10 files) | (b) fixtures | **37,433 B total**; largest file **7,929 B** (`identity/observations.json`) |
| `iips-platform/tests/regression/fixtures/` | (b) fixtures | 61,539 B total; largest file 42,478 B |
| `ies-010…015`, `iips-cross-sector` fixtures | (b) fixtures | 1,851 B – 6,178 B per directory |
| **every** committed file under any `fixtures/` directory | (b) fixtures | **0 files over 100 KB**; largest is 42,478 B |
| `evidence/iid/IID-2-…/golden-tech.json` | (c) test evidence | **109,948 B** |
| `evidence/iid/IID-2-…/golden-bank.json` / `golden-thin.json` / `golden-digests.json` | (c) test evidence | 57,930 B / 19,148 B / 4,515 B |
| every committed file under `evidence/iid/` larger than 100 KB | (c) test evidence | exactly one: `golden-tech.json` |

So the bound is satisfied in the class it governs, in every reading available:

- **"each committed fixture < 100 KB"** — satisfied: no fixture anywhere in the repository exceeds 42,478 B.
- **"`iips-platform/tests/investment/fixtures/` < 100 KB total"** — satisfied: 37,433 B.
- **"each ingested dataset external to git"** — satisfied: no dataset is committed; the run's dataset is written to a
  temporary directory by `prepareM1Environment` and deleted (`L-004`, `L-009` unchanged).

## 4. Is `golden-tech.json` therefore compliant? Yes — with one honest observation

It is committed test evidence in the permitted location, over **synthetic** data (`"legalName": "Aarav Systems
Limited"`, `"issuerId": "IN:ISIN:IN0000000201"`, `"bindingRef": "binding:fixture"`, i.e. the L-004 fixture issuer, not a
real company). It contains no user data and no partition literals, so the class (c) content rule is met as written.

The observation, recorded rather than argued away: class (c) is *described* as "sanitized **summaries** (counts,
pass/fail, digests)", and a full expected-payload dump is broader than that description — it is a different *kind* of
test evidence than the clause anticipates (a golden file, which is the standard way to pin an engine's output). This is
a description-scope note for a future revision of §I.2 rule 3, **not a failed criterion**, and not a reason to shrink a
file that is doing useful work: `golden-digests.json` (4,515 B) already provides the summary form, while
`golden-tech.json` provides byte-level regression protection that a digest cannot.

## 5. What was not done

- `golden-tech.json` was **not** modified, shrunk, gzipped, moved or re-homed. Its size is unchanged at 109,948 B.
- No evidence was relocated out of `evidence/iid/**` to dodge the size question.
- No new interpretation was invented: the class definitions above are quoted from the design and the roadmap, not
  inferred from the gate's one-line summary.

## 6. Verdict

**AC-X6 — PASS (unqualified), gap G-8 — closed as not a breach.** The dataset is external to git, every committed
fixture is far below the bound (largest 42,478 B; the IID fixture corpus is 37,433 B), and the one committed file above
100 KB is test evidence in the class and location the roadmap assigns to test evidence. The only residual point is the
wording of class (c) ("summaries"), recorded in §4 above for a future revision — it does not change the determination.
