# CAP-03 — S2 Evidence Acceptance (`2026-10-26`)

> ## STATUS: **S2 EVIDENCE ACCEPTED — CANDIDATE-SCOPED.** The five S2 gate conditions are satisfied on the operative basis designated by the Program Authority in `IIPS-V3-CAP03-S2-CANDIDATE-SCOPED-BASELINE-DISPOSITION-2026-10-26-01` (§16.143), the raw evidence is deposited in the governed record by the runbook §5.1 chain, and acceptance is rendered on that basis with **four open residuals carried explicitly and none waived** (§5).
>
> The approved-baseline run remains **`FAILED`** and is preserved as diagnostic history; this record
> does **not** restate it as passing. Acceptance is of the **candidate-scoped** evidence, not of a
> passing S2 at `8eec74ae…`.
>
> Nothing downstream is thereby authorised: P-1 stays `UNSPENT` and not authorised, S3 `NOT REACHED`,
> QE `0/11`, Gate 4 `AUTHORIZED — NOT STARTED`, Gate 5 `NOT INITIATED`, DQ-4 still `8/10`.

| Field | Value |
|---|---|
| Record ID | `IIPS-V3-CAP03-S2-EVIDENCE-ACCEPTANCE-2026-10-26-01` (census: `0` prior occurrences in IRR and IPD at publication) |
| Tracker registration | Master tracker §16.144; `CV-CORR-124`; `CHG-2026-10-26-26`; verification rows `V947`–`V956` |
| Record type | Acceptance determination — **candidate-scoped**, rendered on Program-Authority direction; not an admission, qualification gate, implementation grant, or P-1 authorisation |
| Operative basis | commit **`001c3c80618f2ee1d40e9a90912237e1a06e7b58`**, tree **`399fa44a5f1953c0f61b452420fefb5985426ef1`**, parent `8eec74ae…` (§16.143) |
| Governing locus | IRR `ramkivs/iips-review-recovered`; IPD read-only (`0` IPD writes) |
| Machine record | `evidence/integration/cap03-s2-published-evidence-readback-2026-10-26/07-acceptance-outcome.json` (`assess_candidate_scoped_acceptance.py`, inputs `03`/`04`/`06`) |
| Effectiveness | on publication to IRR `main` by the normal PR process and independent remote read-back; coordinates recorded by read-back of the carrying merge, not self-embedded |

---

## 1. What is accepted, in one sentence

The CAP-03 S2 gate conditions — clean locked install, standalone typecheck, full build with the exact
`1,140`-file `dist` set, the canonical guarded suite, and the public-package consumer — are **satisfied
on the corrected candidate `001c3c80…`**, evidenced by two contiguous native-Windows captures on that
content, and that evidence is **accepted into the governed record**, with the failed approved-baseline
run preserved, unaltered, as diagnostic history.

## 2. The evidence accepted, gate by gate

Each row names the transcript whose digest reproduced from committed bytes (§16.141/§16.142), so no row
rests on transcription alone.

| # | Gate condition | Transcript | Result | Capture |
|---|---|---|---|---|
| 1 | `npm ci --no-audit --no-fund` | `s2-fix-01-npm-ci.txt` | exit `0` | `09:33:43Z` |
| 2 | `npx tsc --noEmit` | `s2-fix-02-typecheck.txt` | exit `0`, silent | `09:34:01Z` |
| 3 | `npm run build` + `dist` inventory | `s2-fix-03-build.txt`, `s2-fix-dist-inventory-20261026T093342Z.txt` | exit `0`, **`1,140`** files | `09:34:15Z` |
| 4 | `npm test` (canonical guarded suite) | `s2-npm-launch-fix-suite-20261026T095613Z.txt` (`C5DDFFA2…`) | exit `0`, **`924 / 920 pass / 0 fail / 4 skip`**, guard `OK` | `09:57:43Z` |
| 5 | `npm run test:package-consumer` | `s2-npm-launch-fix-consumer-20261026T095613Z.txt` (`9F7C6407…`) | exit `0`, `"result": "PASS"`, shasum `cc2aa701…` | `09:56:14Z` |

The `4` skips are the documented `posixOnly` cases (§16.134.3), with pass+skip conserved at `924`; the
`1`-skip Linux baseline remains a repository-hygiene measurement and is not used as host evidence.

**Also accepted as historical, not as passing:** `s2-04-guarded-npm-test.txt` — the approved-baseline
step-4 transcript (`guard FAIL`, `924/919/1/4`, exit `1`) — and
`s2-05-package-consumer-baseline-failure-20261026.txt`. They remain in the record exactly as captured.

## 3. Criteria, evaluated against the governing words

| ID | Criterion (source) | Status | Basis |
|---|---|---|---|
| `A1` | Deposit by PR → green exact-head CI → regular merge → green post-merge CI → read-back (runbook §5.1; matrix §2.3) | **MET** | PR **#310**, regular 2-parent merge **`47133fe489e80de2af5f1b537d67865a6a7235b9`** (`2026-10-26T16:33:33Z`, 51 files); exact-head CI run **`40359958909`** `success`; post-merge `main` CI run **`40360279234`** |
| `A2` | Independent read-back of the transferred evidence (receipt §16.138.4) | **SATISFIED** | `46/47` digests reproduced from committed bytes, `9/9` required; residual **R-2** open; host-byte identity not claimed (**R-4**) |
| `A3` | The `47`-entry manifest-verification output that reported `PASS` (receipt §5) | **NOT AVAILABLE — R-1** | absent from the deposit, from IRR `main`, and from both artifact inventories; **classification in §4** |
| `A4` | Five S2 gate conditions satisfied (runbook §3; matrix §2.2) | **SATISFIED (candidate-scoped)** | §2; composition by PA disposition; residual **R-3** open |
| `A5` | Evidence accepted into the record (runbook §5.2) | **SATISFIED** | this record, published by the same chain |
| `A6` | DQ-4 criterion 7 — host sequence S2 → P-1 → S3 | **NOT MET** | freeze criterion; unaffected — P-1 unspent, S3 not reached |
| `A7` | DQ-4 criterion 8 — native-Windows canonical evidence | **NOT MET** | freeze criterion; requires `A6` |
| `A8` | Execution-baseline pin disposition (Gate 4 §6/Q5; `P-1-B`) | **SATISFIED (candidate-scoped)** | §16.143; `0` of 56 H-12 paths affected; pack shasum unchanged |
| `A9` | Formal acceptance determination rendered | **RENDERED** | this record, on PA direction |
| `A10` | PF-15 designation (S3/QE prerequisite, not an S2 criterion) | **SATISFIED** | corrected act `…-02` EFFECTIVE; literals untouched |

## 4. Are the two carried gaps absolute acceptance prerequisites?

The PA asked this to be answered against the governing text rather than by preference. Both are
recorded as open residuals either way; neither is waived.

**`R-1` — the `47`-entry manifest-verification output.** The governing S2 gate is the five commands
(runbook §3; matrix §2.2 lists exactly those five with their pass conditions). The evidence manifest is
introduced by runbook **§4** as the *preservation* step — "hash every evidence artifact; the manifest
itself is hashed last" — and by §5.1 as part of the *publication chain*. No S2 gate condition, DQ-4
criterion, or Gate 4 clause makes a host-side manifest-verification `PASS` a precondition of
acceptance. **Conclusion: not an absolute acceptance prerequisite; it is an integrity corroboration.**
*Consequence of its absence:* the reported `47`-entry `PASS` stays user-reported and cannot be
independently confirmed; the accepted gate results do not depend on it. *If the PA instead holds it
absolute*, the consequence is explicit and pre-recorded: acceptance reverts to `NOT RENDERED` pending
`R-1`, and this record must be superseded, not reinterpreted.

**`R-2` — the `s2-checkout-verification.txt` digest mismatch.** That file is **not** one of the nine
required S2 files, not a gate input, and not cited by any gate row. Its factual content (commit, tree,
clean working tree, non-shallow clone at the pin) is independently evidenced by
`s2-post-run-pin.txt`, whose digest **does** reproduce and whose statements were read at `12:34:42Z`.
**Conclusion: not an absolute acceptance prerequisite.** *Consequence:* one auxiliary record is
unverifiable; the underlying pin fact is corroborated by another reproduced transcript, and the
mismatch stays recorded.

## 5. Residuals carried with this acceptance (none waived)

| ID | Residual | Effect | Clears by |
|---|---|---|---|
| `R-1` | `47`-entry manifest-verification output absent | reported `PASS` stays user-reported | operator supplies it; read-back re-run |
| `R-2` | `s2-checkout-verification.txt` digest mismatch (`3FD31FE6…`) | one auxiliary record unverifiable; pin corroborated by `s2-post-run-pin.txt` | original bytes supplied, or PA accepts the corroborating transcript |
| `R-3` | conditions 4–5 and 1–3 come from two contiguous captures; neither at the committed SHA | the basis is the PA's candidate-scoped decision, not a single-run artifact | a future single-run capture — explicitly not required by the PA direction |
| `R-4` | host-byte identity not established (host CRLF → committed LF) | reproduction is content equality modulo line termination | not clearable from repository content; permanent boundary of this verification |

`R-3` is technically inert for `A4`: the only content difference between the two capture windows is the
step-5 verifier launcher fix, and the candidate's `dist` set differs from the baseline's in exactly two
compiled test files with no lockfile or manifest change (§16.143 §4.2).

## 6. Consequences that follow, and those that do not

**Follows:** `P-1-A` (formal S2 evidence acceptance) at §16.140.4 is **SATISFIED**; the S2 stage
condition in the runbook §5.2 ordering is met; `P-1-B` (execution-baseline) is satisfied
candidate-scoped by §16.143.

**Does not follow — and is not claimed:**

- **P-1 execution is not authorised.** The attempt is still `UNSPENT`, single-use, and blocked on
  `P-1-C` (P-1-session host preflight PF-01…PF-10) and `P-1-D` (F4 store-path facts), neither of which
  this record or any repository content can supply. Acceptance of S2 evidence is not an execution grant.
- **No gate, freeze, or admission movement:** DQ-4 `8/10` (criteria 7–8 unmet), Gate 4 `AUTHORIZED —
  NOT STARTED`, S3 `NOT REACHED`, QE `0/11`, Gate 5 `NOT INITIATED`.
- **No pin, manifest, H-12, fence or code change:** H-12 R5 stays adopted at its own coordinate with
  `0` of 56 bound paths affected; `WRITE_NOT_AUTHORIZED`, the twelve `503` fences and
  `durable:false` are preserved; `0` IPD writes.
- **PF-15 unchanged:** the corrected act `…-02` remains EFFECTIVE and its F1–F6 PA-owned literals are
  neither restated, reformatted nor normalised here; no value is invented.

## 7. Verification register (`V947`–`V956`)

| ID | Check | Result |
|---|---|---|
| `V947` | Deposit chain: PR #310 exact-head CI `40359958909` `success`; 2-parent merge `47133fe4…`; post-merge `main` CI `40360279234` | **PASS** |
| `V948` | Operative basis identifiers equal the §16.143 designation; parent = approved baseline | **PASS** — `06` |
| `V949` | Gate conditions 1–5 each mapped to a reproduced transcript with its recorded result | **PASS** — §2, `06` |
| `V950` | Guarded suite `924/920/0/4` and consumer `PASS` (shasum `cc2aa701…`) read from the accepted bytes | **PASS** — `06` |
| `V951` | Failed approved-baseline run retained in the record and classified `FAILED`; no acceptance clause covers it | **PASS** — §2, §6 |
| `V952` | `R-1`–`R-4` recorded with effect and clearing condition; none marked waived | **PASS** — `07`, §5 |
| `V953` | Prerequisite analysis: neither `R-1` nor `R-2` is an acceptance gate under the cited clauses; the contrary contingency is pre-recorded | **PASS** — §4 |
| `V954` | Non-movement: P-1 unspent/unauthorised, no S3/QE/Gate 4/Gate 5, DQ-4 `8/10`, PF-15 unchanged, H-12 unchanged, no code/pin/fence change, `0` IPD writes | **PASS** — `07.not_moved` |
| `V955` | PF-15 corrected act byte-identical to the effective blob `3fe9a2dd…`; no literal restated or normalised | **PASS** — `verify_acceptance_record.py` |
| `V956` | Documentation integrity: `verify_acceptance_record.py` all checks pass; single `§16.144` heading; identifier census `0` prior occurrences; `§16.141`/`§16.142`/`§16.143` preserved | **PASS** |

---

*End of `IIPS-V3-CAP03-S2-EVIDENCE-ACCEPTANCE-2026-10-26-01` — CAP-03 S2 evidence is ACCEPTED on the candidate-scoped operative basis `001c3c80618f2ee1d40e9a90912237e1a06e7b58` / `399fa44a5f1953c0f61b452420fefb5985426ef1` (parent `8eec74ae…`), with the five gate conditions evidenced by reproduced native-Windows transcripts, deposited through PR #310 → merge `47133fe4…` → green CI, and with residuals `R-1`–`R-4` carried openly and unwaived; the approved-baseline run stays `FAILED`; P-1 remains unspent and not authorised; no gate, pin, manifest, fence, H-12 or PF-15 change; `0` IPD writes.*
