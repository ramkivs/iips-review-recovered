# CAP-03 — S2 Candidate-Scoped Execution-Basis Disposition (`2026-10-26`)

> ## STATUS: **PA-RENDERED DISPOSITION — THE CORRECTED CANDIDATE `001c3c80…` / `399fa44a…` IS THE OPERATIVE S2 / EXECUTION BASIS, CANDIDATE-SCOPED. The failed approved-baseline run is preserved as diagnostic history and is NOT restated as passing. No rerun, no new execution, no H-12 change, no PF-15 change, no gate movement.**
>
> The Program Authority directed on `2026-10-26` that the already-passing candidate S2 run be retained
> as the operative execution basis instead of repeating or restarting the failed approved-baseline run.
> This record renders that direction as an explicit, dated, scope-bounded disposition. It is a **PA
> determination recorded here on his instruction** — not an inference drawn by an agent, not a silent
> re-pin, and not a widening of scope.
>
> The "promotion of the corrected candidate" reserved by §§16.132.5 and 16.134.2 ("remains a
> PA-governed determination") is exactly the kind of determination this record is, and it is now
> rendered. The approved baseline is **not** erased: it remains the coordinate against which the failed
> run and the H-12 R5 bindings are read (§4).

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-S2-CANDIDATE-SCOPED-BASELINE-DISPOSITION-2026-10-26-01` (census: `0` prior occurrences in IRR and IPD at publication) |
| Tracker registration | Master tracker §16.143; `CV-CORR-123`; `CHG-2026-10-26-25`; verification rows `V937`–`V946` |
| Record type | Program-Authority disposition — execution-basis designation, candidate-scoped; **not** a qualification, acceptance, admission, or implementation grant |
| Authority | **Ramki**, Program Authority (single owner/sole user) per the master tracker header; direction given `2026-10-26` and recorded verbatim in §1 |
| Governing locus | IRR `ramkivs/iips-review-recovered`; IPD read-only (`0` IPD writes) |
| Effective on | publication to IRR `main` by the normal PR process **and** independent remote read-back (§6) |
| Evidence | `evidence/integration/cap03-s2-published-evidence-readback-2026-10-26/06-candidate-basis.json` (`verify_candidate_basis.py`) |

---

## 1. The PA direction recorded

> *"My direction is to retain the already-passing S2 candidate run as the operative execution basis
> rather than repeat or restart the failed run. … Record this direction in the appropriate CAP-03
> governance/evidence record as a candidate-scoped baseline disposition, within my authority. Do not
> misrepresent the earlier failed approved-baseline run as passing."*
> — Program Authority, `2026-10-26`

Two obligations follow, and both bind this record: the **disposition** must be rendered, and the
**failed baseline run must remain visibly failed**. §3 and §5 are written to keep both true
simultaneously.

## 2. Designated identities (verified live, `V938`)

| Item | Value |
|---|---|
| Approved baseline (historical, unchanged) | commit **`8eec74ae27cda09f3c368b9c299895eae41554db`**, tree **`4eba29029f8d95cfe483e615a7047426b298ce50`** |
| **Operative execution basis (designated here)** | commit **`001c3c80618f2ee1d40e9a90912237e1a06e7b58`**, tree **`399fa44a5f1953c0f61b452420fefb5985426ef1`**, **single parent = the approved baseline** |
| Change set | exactly two files: `scripts/verify-public-package.mjs` (+7/−3), `tests/portfolio_ui_package.test.ts` (+2/−2) |
| IPD merge | PR **#96**, merged `2026-10-26T10:12:18Z`, merge commit **`1e76f4cf9e9ca7d385a8345c9b6f438ae1ad6745`** |
| Scope of the designation | S2 execution/evidence basis **and** the P-1 execution-pin coordinate for the P-1 attempt of record, **candidate-scoped** — see §5 non-grants |
| Verification method | live GitHub API identity reads (`gh api commits/001c3c80`, `commits/8eec74ae`, `pulls/96`), reproduced by `verify_candidate_basis.py` |

## 3. The operative run — identified exactly, including what it is not

The passing result the PA retains is **run `20261026T095613Z`**, whose captured conditions are the two
that failed at the approved baseline:

| Field | Value |
|---|---|
| Canonical guarded suite | `s2-npm-launch-fix-suite-20261026T095613Z.txt` — **`# tests 924 / # pass 920 / # fail 0 / # skipped 4`**, guard `[test-guard] OK`, exit `0`; SHA-256 **`C5DDFFA24393AED2E391EF8A72E8BFF1F8ECD9576C4349E182B288785F1B2941`** (reproduced from committed bytes, §16.141) |
| Package consumer | `s2-npm-launch-fix-consumer-20261026T095613Z.txt` — `"result": "PASS"`, pack shasum **`cc2aa70186b8fd7bc7255452ac8d8b00d094f53e`**, exit `0`; SHA-256 **`9F7C64073A849E57D472C9CA30BB7616D04D1951626E90587241D61A470A85B1`** (same bytes as `s2-05-package-consumer.txt`) |
| Capture window | `2026-10-26T09:56:14.2402846Z` – `2026-10-26T09:58:05.1795781Z` |
| Content state | the candidate **content** on branch `work/cap03-s2-windows-esm-url`; the summary states verbatim *"No candidate commit or publication performed."* — the commit `001c3c80…` was created later, at `10:01:48Z`, from exactly that content |
| Conditions evidenced | **S2 conditions 4 and 5 only** |

Conditions 1–3 are evidenced by the immediately preceding capture **`20261026T093342Z`**
(`09:33:43Z`–`09:35:15Z`, same branch and worktree, same candidate content): `npm ci` exit `0`,
`tsc --noEmit` exit `0`, `build` exit `0` with **`dist` = 1,140 files** plus a per-file inventory; that
run then **stopped with `Failure step: package-consumer`** (exit `1`, `spawnSync npm.cmd EINVAL`) —
the launcher defect that run `20261026T095613Z` fixed and re-captured.

### 3.1 Three qualifications, stated rather than smoothed away

1. **There is no single contiguous five-command run on the candidate.** The five S2 conditions are
   evidenced by two contiguous captures twenty-one minutes apart, and the only difference between them
   is the verifier launcher fix that is itself part of the candidate.
2. **No capture was executed against the committed SHA `001c3c80…`.** Both captures predate the
   commit; the commit was created from the verified content and its change set is exactly the two
   files the captures exercised.
3. **The accepted composition is a PA decision, not a technical equivalence.** This record does not
   claim the two captures are one run; it records that the PA has retained the passing capture as
   operative and treats the earlier capture's conditions 1–3 as satisfied on the same content. The
   verifier patch provably cannot affect conditions 1–3 (§4.2), which is the technical fact that makes
   the composition safe to adopt — it is not a substitute for the decision.

## 4. H-12 and digest consequences — addressed, quantified, not waived

A designation that changed a bound digest without saying so would be a silent re-pin. The consequences
were computed from the published inventories (`06-candidate-basis.json`):

### 4.1 H-12 R5 bindings

| Question | Verified answer |
|---|---|
| H-12 R5 entries | **56** per-path entries at the approved baseline (`G4-H12-MANIFEST-v2-CANDIDATE-2026-10-25-R5.json`) |
| Are either of the candidate's two changed paths H-12-bound? | **No — `0` of 56.** `scripts/verify-public-package.mjs` and `tests/portfolio_ui_package.test.ts` are not bound entries |
| Therefore H-12 re-adoption / regeneration required? | **No.** No bound digest is broken by executing from the candidate; H-12 R5 stays adopted as-is, at its own baseline coordinate |
| Bound `npm_pack_tarball_shasum_sha1` | **unchanged** — the candidate's consumer transcript reports `cc2aa701…`, identical to the bound value |
| Bound canonical `dist` inventory SHA-256 `81bddd5c…` | bound at the **baseline**; it is **not asserted for the candidate**. The candidate's inventory is byte-identical except two files, so an aggregate digest necessarily differs. Re-deriving it needs the canonicalisation procedure; **not performed**, and no manifest was edited |

### 4.2 Compiled `dist` delta (baseline → candidate content)

| Measure | Value |
|---|---|
| Entries | `1,140` vs `1,140` — count unchanged |
| Paths only in baseline / only in candidate | **0 / 0** — no additions, no removals |
| Files whose digest differs | **2** — `dist/tests/portfolio_ui_package.test.js`, `dist/tests/portfolio_ui_package.test.js.map` (both compiled from the changed test source) |
| Non-`dist` effect | none: `scripts/*.mjs` is not compiled by `tsc`, not an input to `vite build` or the package builds, and `npm ci` reads `package-lock.json`, which is unchanged |

This is why qualification 3 above is technically inert for conditions 1–3: the only difference between
the two capture windows touches compiled test output and the step-5 launcher, neither of which feeds
conditions 1, 2 or 3.

## 5. Scope of the disposition and explicit non-grants

**Granted by this disposition:** the candidate `001c3c80…` / `399fa44a…` is the operative basis for
(a) S2 evidence acceptance and (b) the coordinate at which P-1 of record would be executed, replacing
the failed approved-baseline attempt for those two purposes.

**Not granted, and unchanged by this record:**

- **P-1 execution is not authorised.** The single attempt remains `UNSPENT`; `P-1-C` (P-1-session host
  preflight PF-01…PF-10 on `desktop-no0nhtp`) and `P-1-D` (F4 store-path host facts) remain
  `NOT ESTABLISHED` / `NOT VERIFIED`, and no P-1 act was rendered.
- **No H-12 re-adoption, no manifest edit, no digest substitution** (§4).
- **PF-15 untouched** — the corrected act `…-02` remains EFFECTIVE; its F1–F6 literals are PA-owned and
  are not restated, reformatted or normalised here, and no value is invented.
- **No code, test, fence, route or pin change** in IPD (`0` IPD writes); no new IPD commit or PR.
- **No gate movement:** DQ-4 remains `8/10` (criteria 7–8 unmet), Gate 4 `AUTHORIZED — NOT STARTED`,
  S3 `NOT REACHED`, QE `0/11`, Gate 5 `NOT INITIATED`; `WRITE_NOT_AUTHORIZED`, the twelve `503` fences
  and `durable:false` are preserved.
- **No rerun, no rebuild, no re-execution of any S2 step** — this disposition consumes existing
  evidence only, as directed.

## 6. Effectiveness

This disposition becomes effective on publication to IRR `main` by the normal PR process (green
exact-head CI, regular merge, green post-merge `main` CI) and independent remote read-back of the
merged bytes; the coordinates are recorded by read-back of the carrying merge and are deliberately not
self-embedded in this text. Until then it is a prepared-and-published record, not an effective act.

## 7. Verification register (`V937`–`V946`)

| ID | Check | Result |
|---|---|---|
| `V937` | PA direction recorded verbatim; disposition rendered on instruction, no inference attributed to the agent | **PASS** — §1 |
| `V938` | Candidate commit/tree/parent and approved baseline verified live; parent = baseline; IPD PR #96 merge identity | **PASS** — `06`, §2 |
| `V939` | Operative run identified: `20261026T095613Z`, `924/920/0/4` guard `OK`, consumer `PASS`, both digests reproduced from committed bytes | **PASS** — §3 |
| `V940` | Conditions 1–3 traced to capture `20261026T093342Z` with exit `0` and `dist` `1,140`; that capture's step-6 failure recorded, not hidden | **PASS** — §3 |
| `V941` | Qualifications recorded: no single contiguous run; no capture at the committed SHA; composition is a PA decision | **PASS** — §3.1 |
| `V942` | H-12 exposure: `0` of 56 bound paths affected; no re-adoption needed; pack shasum unchanged; aggregate inventory digest not asserted | **PASS** — §4.1 |
| `V943` | `dist` delta: `1140/1140`, `0` additions, `0` removals, exactly `2` differing compiled files | **PASS** — §4.2 |
| `V944` | Failed approved-baseline run preserved and still classified failed; no clause of this record restates it as passing | **PASS** — §3, §5 |
| `V945` | Non-grants: P-1 unspent and unauthorised; PF-15 literals untouched; no code/pin/fence/manifest change; `0` IPD writes; no gate movement | **PASS** — §5 |
| `V946` | Documentation integrity: `verify_acceptance_record.py`, single `§16.143` heading, identifier census `0` prior occurrences | **PASS** — §7 |

---

*End of `IIPS-V3-CAP03-S2-CANDIDATE-SCOPED-BASELINE-DISPOSITION-2026-10-26-01` — the corrected candidate `001c3c80618f2ee1d40e9a90912237e1a06e7b58` / `399fa44a5f1953c0f61b452420fefb5985426ef1` (parent `8eec74ae…`, IPD PR #96) is designated the operative S2/execution basis on the Program Authority's `2026-10-26` direction; the passing capture `20261026T095613Z` (`924/920/0/4` guard `OK`, consumer `PASS`) is retained with its two-capture composition and pre-commit capture stated openly; `0` of 56 H-12 paths affected, `2` compiled `dist` files differ, pack shasum unchanged; the failed approved-baseline run stays failed; P-1 remains unspent and unauthorised; PF-15 and all gates untouched.*
