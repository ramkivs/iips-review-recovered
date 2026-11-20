# IID Stage 4 — G-15 Baseline Crosswalk Disclosure (L-002 / L-009 scope completeness)

**Record date:** 2026-11-19 (UTC). **Repository:** `ramkivs/iips-review-recovered`, branch
`arena/fe76d26e-iips-review-recovered` @ `53be3f15d074a591c2634f88d76096b918a20f0a` (branched from
`1a0e3fc7a843b199c3baecb4f4e617172d802d58`).
**Work category:** Investigation / Disclosure Proof. **No implementation change is made or authorised by
this record.**

## 1. What G-15 is, and where its text lives

G-15 is one of the baseline gap entries G-1…G-15 recorded in §24 of the 11 November 2026 identity and
investment-coverage readiness assessment. On this branch that is cited, not held:
`docs/integration/CPII-01-RUNTIME-TOPOLOGY-AND-READINESS-BOUNDARY-2026-11-13.md` references the assessment
at branch `arena/iid-coverage-readiness-report-2026-11-11` @ `31a9b01e` (blob
`e6f756238089c6795c8568b37321f3e55ba60cb2`, sha256
`baac4427e543ff7749694e7fb59a4b147cb415b2f7fe3330544ce22a5d0835b6`), **not merged to `origin/main`**.
G-15's own wording is therefore not inspectable from this repository; this disclosure covers the two
register subjects G-15's scope-completeness question turns on — L-002 and L-009 — from evidence that is
committed here. Nothing below restates G-15's text.

## 2. The G-15 crosswalk entry (required disclosure)

| Subject | Required disclosure |
|---|---|
| L-002 historical wording | The register's L-002 entry (`docs/integration/IIPS_V3_IID_LIMITATION_AND_COVERAGE_REGISTER_2026-11-06.md`, "20 XBRL tags mapped…", status `OPEN`, last updated 2026-11-06) is **historical wording, retained unedited and flagged as such** — here and at register §17.26, which records the prose as "flagged for the owner, not edited". This record does not rewrite it. |
| Current tag-map count | **22 keys**, verified against current code at the commit above (§3). The reader-facing surfaces that state a count now derive it from the code or are pinned to it (§3). |
| L-009 historical wording | The register's L-009 entry ("No real issuer has been assessed", status `OPEN`, 2026-11-06) is **historical wording, retained unedited and flagged as factually superseded in scope** — here, at register §17.26, and in `frontend/src/api/investment.ts`, whose notice deliberately mirrors the register text and records that restating it is the register owner's act. It is not restated by this record. |
| Later real-input evidence | **WI-3 — Infosys** (`evidence/real-issuer/WI3-BORROWINGS-NIL-2026-11-06/`), **WI-7 — Marico** (`evidence/real-issuer/WI7-CONSUMER-MARICO-2026-11-07/`), **WI-8 — KEC** (`evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/`): real issuers assessed from primary filing evidence after L-009 was written. |
| Persistence distinction | Those are **evidence-bundle assessments**. WI-7/WI-8 record governed pipeline runs that persisted an artifact and read it back *within the evidence run*; that is not, by itself, an assessment persisted in the operated product. The only operated-environment persistence record is Infosys in the owner's Windows NP-04 store (`docs/integration/IID-NP04-FIRST-INFOSYS-PERSISTENCE-COMPLETION-2026-11-15.md`), which is **operator-reported and was not independently inspected** from this workspace, and which itself records overall IID readiness as NOT READY. No operated-product persistence is recorded for Marico or KEC. Evidence-bundle assessments do not automatically establish persisted operational assessments. |
| Limitation disposition | **No automatic closure or status change.** L-002 and L-009 remain `OPEN` in the register; this record adjudicates neither. Any status change is a register-owner act of the §17.27 kind, separately recorded. |
| Implementation scope | **No tag-map expansion or financial derivation change.** `XBRL_TAG_MAP`, derivations and ingestion behaviour are untouched by this record (docs-only diff). |

Which statements are historical, current, or later-evidence: the register's L-002 "20" and L-009 "no real
issuer" sentences are **historical** (true when written, retained as written); the **current** facts are
the 22-key map and the code-derived reader counts; the **later evidence** is WI-3/WI-7/WI-8 and the NP-04
persistence record, with the persistence qualification above.

## 3. Verified current tag count (22) and the 20-versus-22 distinction

- `XBRL_TAG_MAP` is defined at `iips-platform/src/investment/ingestion/xbrl.ts:61`. Counting its keys by
  importing the module at the commit above (`tsx` import of `src/investment/ingestion/xbrl.ts`) gives
  **22**. The last two keys are the V2 associates/JV component tags (`InvestmentsInAssociates`,
  `InvestmentsInJointVentures`), added with the L-036/V2 work — the documented 20 → 22 step.
- The committed evidence for the distinction is defect A:
  `evidence/real-issuer/HEAD-REVALIDATION-INFOSYS-2026-11-12/findings/A-STALE-LIMITATION-COUNTS.md`
  (status: CORRECTED narrowly, register prose flagged for the register owner). It records that the coverage
  path already derived 22 from code while two reader notices carried a stale literal 20.
- Runtime disclosure now derives the count, never restates it: `identity/coverage.ts:151,157`
  (`xbrlMappedTags`, coverage note sentence), `coverage/investmentCoverage.ts:743`
  (`INVESTMENT_COVERAGE_TAG_MAP_SIZE`), and the CLI notice in
  `frontend/server/investment/cli/generate-investment-artifacts.ts` (`limitationsForDatasetClass`, which
  states the register prose "is the register owner's to reconcile, and nothing here edits it"). The one
  surface that cannot import the platform, `frontend/src/api/investment.ts`
  (`LIMITATION_DISCLOSURES`, "22 XBRL tags are mapped"), is pinned instead.
- Pins that fail if either side moves alone: `frontend/server/investment/cli/rivHeadRevalidation.test.ts`
  (`Object.keys(XBRL_TAG_MAP).length` = 22; stated count must equal it), and the platform suites
  `iips-platform/tests/investment/identity-coverage.test.ts` / `identity-runtime.test.ts` ("20 tags before
  L-036/V2; the associates/JV caption adds the two component tags (22)"), re-run for this record: **18/18
  passing**.

## 4. Persistence status of the later real-input evidence

| Bundle | What it establishes | Persistence status |
|---|---|---|
| WI-3 Infosys (2026-11-06) | Real issuer assessed from filed statements; intrinsic and margin of safety computed | Evidence-bundle assessment payload. Infosys was **later** persisted in the owner's Windows NP-04 store (2026-11-15 record) — operator-reported, not independently inspected here; not claimed as production operation. |
| WI-7 Marico (2026-11-07) | First real-issuer validation outside Technology | Bundle records "read, ingested and persisted" with separate-process readback — persistence **inside the governed evidence run**. No operated-product persistence recorded. |
| WI-8 KEC (2026-11-07) | First real-issuer validation in Industrials; bridge refused on missing net debt | Same class as WI-7: evidence-run persistence and readback. No operated-product persistence recorded. |

Register sections §17 (WI-3), §17.15 (WI-7) and §17.16 (WI-8) carry the same bundles' register-level
record and likewise change neither L-009 nor its status.

## 5. Scope exclusions (strict)

No change to `XBRL_TAG_MAP`; no new XBRL tags; no financial derivation, ingestion, or application-code
change of any kind; no limitation closure, downgrade or acceptance decision; no new owner authority or
governance decision; no IPD change; no Windows-host or production change; no unrelated Stage-4/Stage-5
work; no reopening of completed phases; no frozen historical evidence file rewritten (this record and the
register appendix are the only writes).

## 6. Conclusion and remaining limitations

G-15's disclosure position is now explicit and evidence-backed: the historical L-002/L-009 wording is
retained and flagged, the current count is 22 and code-derived wherever a reader sees it, the later
real-input evidence (WI-3/WI-7/WI-8) is identified with its persistence qualification, and neither
limitation's disposition is touched. Remaining evidence limitations: (i) G-15's own §24 text is on the
unmerged 11-November branch and was not inspectable here — only its CPII-01 citation is; (ii) the NP-04
Windows persistence is operator-reported and its store was not opened from this workspace; (iii) the
frontend pin suites (`rivHeadRevalidation.test.ts`) could not be re-run in this sandbox (their IPD-pinned
private dependencies are uninstallable here, as recorded under L-033) — the platform-side pins were
re-run instead (18/18). **Completion of this record means the G-15 scope and disclosure position is
accurately evidenced and published; it does not mean L-002 or L-009 is closed, nor that Stage 4 is
complete.**
