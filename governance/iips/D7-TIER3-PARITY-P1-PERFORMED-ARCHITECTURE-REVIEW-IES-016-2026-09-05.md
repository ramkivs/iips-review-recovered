# D7-TIER3-PARITY - P1 PERFORMED ARCHITECTURE REVIEW - IES-016 Telecommunications

- Date: 2026-09-05 (Asia/Calcutta).
- Artifact class: P1 PERFORMED-REVIEW record for IES-016 ONLY. This is the per-engine performed architecture review contemplated by Section 11 of the durably recorded P1 findings artifact. It records performed-review findings and verdicts only; it grants no authority, authorizes nothing, executes nothing, and issues no implementation instructions.
- Status: PREPARED 2026-09-05 - NEW work, not recovered/historical material. NOT YET DURABLY RECORDED (separate maintainer recording protocol; nothing staged/committed/pushed).
- Source of truth (adjudication): durably recorded findings artifact governance/iips/D7-TIER3-PARITY-P1-ARCHITECTURE-REVIEW-FINDINGS-2026-09-05.md at governance commit 367ffdbc71babfc63fa54e5238be91cedb6fc0bf, content SHA-256 ea6a23b48205fc9fa64174835bd29c0b64f8fc0b3d65002245275484117e4e55. Every verdict and qualification in this artifact is carried from that adjudication WITHOUT alteration; this artifact expands them into standalone per-engine records and adds no new adjudications.
- Authority chain (context only): D7 substantive Tier3 parity programme authority a98a5da478a9a0b0d492a777ea3dbe8c8768a62a; P1 architecture-review scope authority b4abf34d73dfb396fea24a0faf433d28574a8b90 (Decision A; authority artifact blob fe3e382a5f7f67c640212a0a9a5d8e9921d012f5, artifact SHA-256 0f643a253108f0e4d8fad5787f247eaf291e09c110aaed50dc5d1551aea79775); P1 findings durable recording 367ffdbc71babfc63fa54e5238be91cedb6fc0bf. P1 scope remains exactly IES-016 / IES-017 / IES-020; this artifact covers IES-016 only.
- Product evidence baseline: 830bd7218f6a77274e3d58eef09d706a3a99794f (refs/heads/phase13-next).
- Evidence classes: [ATTESTED] = supplied Windows maintainer execution attestation for gate v3 (workspace D7-P1-EXECUTION-V3-20260905-111442; Arena did NOT access, and does not claim to have accessed, any Windows path; attested facts are never upgraded to Arena-verified); [ARENA] = verified read-only by Arena (git advertisement, tree/blob reads at the pinned baseline, first-hand governance blob reads); [DEVELOPMENT] = Arena sandbox development testing, explicitly NOT P1 evidence.

## 1. Scope and standalone basis

- Engine under review: IES-016 Telecommunications (product directory ies-016-telecommunications). Review framework: the eight-question P1 architecture-review framework fixed by the P1 scope authority (consistency; deterministic replay; calibration correctness; override precedence; ontology compatibility; CSIP/platform zero-modification; traceability; frozen-state readiness).
- This record is independently complete and auditable on its own; it relies on no other engine artifact and uses no compressed cross-engine statements. Cross-engine uniformity observations live in the recorded findings artifact, not here.
- Distinction from the in-engine stub: the Tier-3 architecture-review stub in the engine directory (blob ec715ca1e2305d11bb51f2aac7a307a74b06042e) remains UNTOUCHED at the pinned baseline; it is NOT a performed review, is not retro-filled by this artifact, and this artifact is a governance-side record, not a product-tree change.

## 2. Execution evidence relied upon [ATTESTED]

- Per-engine evidence JSON: evidence/p1-evidence-IES-016.json; generator transcript: evidence/gen-stdout-016.txt. Shared bundle files: evidence/DEC-D25-TIER3-EVIDENTIARY-STANDARD.md, evidence/DEC-D15-VERIFICATION-METHODOLOGY.md (captures from pinned governance blobs), evidence/BUNDLE-SUMMARY.json, evidence/SHA256SUMS.txt. The 9-file v3 bundle was supplied as an attestation only.
- Attested execution facts for IES-016: fresh disposable clone (--no-checkout, core.autocrlf=false); governance tracking ref == b4abf34d73dfb396fea24a0faf433d28574a8b90; baseline == 830bd7218f6a77274e3d58eef09d706a3a99794f; all 33 pinned inputs verified; excluded D36 stubs untouched; in-engine acceptance-matrix path resolved; 13 cases recomputed; generator exit 0; expected-output comparison completed; replay re-derivation completed; caseDiffs=0; byteIdentical=false; zero repository mutation.
- Case count is exactly 13 for this engine. The case count is not changed by this review: 13 cases recomputed, 13 committed expected cases, 13 replay cases (corroborated [ARENA] by the pinned expected-outputs blob structure, and by D25's acceptance evidence citing "13/13 frozen expected outputs reproduced").

## 3. First-hand governance evidence [ARENA]

- D25 (DEC-D25-TIER3-EVIDENTIARY-STANDARD, blob cbab4da9ce922aacf45e513954d6e325bb037810, read first-hand): D25 records ACCEPT for all three engine methodologies (D16 v1.0 / D17 v1.0 / D20 v1.0). For this engine: D16 v1.0 = ACCEPT, as a FRESH forward-looking acceptance; historical acceptance is NOT established; the engine remains Class A, maturity A2. Acceptance matrices: 16 gates, all PASS. Calibration: matches pack field-for-field (IES-016 calibration "Matches pack section 4 field-for-field - all 5 segment weight vectors, leverageAlert values, archetypeRisk"). Readiness certificates: "13/13 frozen expected outputs reproduced". Anchor composite for this engine: 77.8 Buy (case TC-001), matching the recomputed first case (the full D25 anchor set 77.8 Buy / 71.3 Buy / 82.5 Strong Buy matches the recomputed first cases of IES-016 / IES-017 / IES-020 respectively).
- D15 (DEC-D15-VERIFICATION-METHODOLOGY, blob 8cc089df6ae680706921dd5ecb57b75776ad4580, read first-hand): the authoritative verification model is role separation + clean-workspace reproducibility. Mandatory labelling convention (D25/D15): "independent" denotes exactly that role separation and clean-workspace reproducibility, and nothing more; no organizational, external, third-party, or accredited independence is claimed anywhere in this artifact.
- D25/D15 establish exactly what is stated above and nothing beyond it: they are governance evidence of acceptance standards and verification methodology; they do not certify product parity, do not re-adjudicate readiness-certificate content, and do not grant promotion or release authority.

## 4. Input identity verification [ARENA, read-only at baseline]

- All 33 pinned inputs for this engine were blob-verified at baseline in the recorded findings review; the frozen manifest (blob 70018bdb38849d50af7258f62d0341ac2bf64f1a) holds a complete 12-key documentHashes set, 1:1, no orphans.
- Key pins relied on in this record (blob ids at baseline 830bd7218f6a77274e3d58eef09d706a3a99794f): calibration 178160fcbe0a30975c6796ac22c73a9bd03ab91a; generator c69ce2eb5d989f63a0618406b103dc398ebc4948; expected-outputs 0d45ffc44df6d61a6f95dac15a12cb6f88be3155; replay dataset ed6bbeb8b127f45ac8c8d99f9baee8c42bd60001; golden reference f0dfc647b8e0220d04a241902a82899e3a667393; ontology metadata 31383863e126a6688bd95249522e654c933ec6f1; acceptance matrix 0a45484582300d106c104e093a176d9ba52f6aec; readiness certificate d764f276d980b6843e1b68939803299181bd3a47; D16 authority review 7f796754cb04eeb75e87000c760bbef587eb060c.
- Expected/replay basis [ARENA, from the pinned expected-outputs blob]: telecommunications-golden-reference-1.0.0; 13 == 13 == 13 cases (expected / golden-derived / replay).

## 5. Determinism finding DF-1 - byteIdentical=false / caseDiffs=0 (carried unchanged from the recorded findings)

- Observed fact [ATTESTED]: for IES-016, the regenerated expected-outputs (and replay datasets) differ from the committed files at the byte level (SHA-256 inequality), while the case-wise comparison returns zero differences across all 13 cases and all compared fields (providerId, subsegment, archetype, composite, verdict, overrides, pillars for expected; providerId, expected.composite/verdict/overrides, reproduced, byteIdentical for replay).
- Analysis [ARENA + ATTESTED]: the pinned generator (c69ce2eb5d989f63a0618406b103dc398ebc4948) serializes outputs with Python text-mode open(path, 'w') + json.dump (generator source read by Arena). Python text mode on Windows translates LF to CRLF (documented Python behavior); the committed artifacts are LF-serialized (verified [ARENA] against raw blob content, autocrlf=false). Regeneration on Windows is therefore EXPECTED to differ from the committed LF files by the newline convention exactly, with unchanged JSON values - precisely the observed byteIdentical=false + caseDiffs=0.
- Convention identified (explicit): Windows Python text-mode CRLF write versus committed LF serialization. This is a platform serialization/newline convention, distinct from the freeze manifests' CRLF-rendering hashNormalization convention (a different, documented hash convention for asset pinning).
- Corroboration [DEVELOPMENT, explicitly NOT P1 evidence]: Linux execution of the same pinned chain reproduces both files byte-identically (LF vs LF), confirming content equality and isolating the platform newline as the only byte-level difference observed anywhere.
- Residual (fail-closed, NOT normalized away, NOT resolved by this artifact): newline-only-ness was NOT cryptographically proven from the Windows attestation alone; the attestation carries no regenerated bytes and no newline-normalized hash, and caseDiffs=0 normalizes both sides through JSON parsing, so a non-newline cosmetic delta (e.g., float representation) is not logically excluded by caseDiffs=0 alone. What IS established: value-level equivalence of every substantive output field across all 13 cases. This residual is mechanically closable from the bundle's recomputed SHA-256 values (recomputedExpectedSha256 / recomputedReplaySha256) or a newline-normalized re-hash, at durable recording.
- Effect: the Q2 and Q7 verdicts below rest on value-level equivalence (established); byte identity is NOT claimed anywhere in this artifact.

## 6. Manifest corroboration distinction (carried unchanged)

- Manifest SHA-256 corroboration rows exist in the per-engine evidence JSON [ATTESTED as created], but the per-key results were NOT quoted in the Windows attestation. The PRIMARY input-identity check - blob verification of all 33 pinned inputs - was attested 33/33. Arena's [DEVELOPMENT] run corroborated 12/12 convention matches per engine; that is development testing, NOT P1 evidence. No upgrade of the unquoted rows is made here.

## 7. Eight-question performed review - IES-016 Telecommunications

### Q1 - consistency
- Question: Consistency: is the frozen asset chain for this engine internally consistent - all pinned inputs present at the baseline, complete FROZEN manifest key set, expected/replay derived from the named golden reference, and matching case counts?
- Finding class: architecture
- Evidence artifact(s): evidence/p1-evidence-IES-016.json [ATTESTED]; pinned input set + frozen manifest 70018bdb38849d50af7258f62d0341ac2bf64f1a + expected-outputs basis field [ARENA]
- Observed: 33/33 pinned inputs blob-verified at baseline 830bd7218f6a77274e3d58eef09d706a3a99794f; FROZEN manifest set complete (12 keys 1:1); expected/replay basis == telecommunications-golden-reference-1.0.0; 13 == 13 cases.
- Analysis: The complete frozen asset chain (golden reference, calibration, generator, expected outputs, replay dataset, governance documents) plus deterministic reproduction establish structural and chain consistency. Limitation noted: content-level cross-reading of the 19-document set is P2 scope and is not claimed here.
- Verdict: PASS
- Rationale: Complete frozen asset chain + deterministic reproduction establish structural and chain consistency, as adjudicated in the recorded findings.
- Downstream implication: Content-level document cross-reading remains P2 scope; this PASS does not pre-adjudicate it.

### Q2 - deterministic replay
- Question: Deterministic replay: does the pinned generator deterministically re-derive the committed outputs from the frozen inputs, with no nondeterministic sources?
- Finding class: execution/determinism
- Evidence artifact(s): evidence/p1-evidence-IES-016.json + evidence/gen-stdout-016.txt [ATTESTED]; generator source c69ce2eb5d989f63a0618406b103dc398ebc4948 + replay dataset ed6bbeb8b127f45ac8c8d99f9baee8c42bd60001 [ARENA]
- Observed: Replay re-derivation 13/13 case-equal (caseDiffs=0); stored reproduced/byteIdentical claims in the replay dataset were NOT trusted and were re-derived; generator source contains no random/date/time sources [ARENA].
- Analysis: Determinism is established at the value level for all 13 cases; the stored self-referential claims in the replay dataset were treated as claims, not evidence. The byte-level difference between regenerated and committed files is fully addressed by DF-1 (Section 5): a platform newline convention with a registered residual.
- Verdict: PASS
- Rationale: Value-level deterministic equality 13/13 with no nondeterministic sources in the pinned generator, per the recorded findings.
- Downstream implication: The DF-1 recording obligation applies: the bundle's recomputed SHA-256 values can close the byte-level residual mechanically at durable recording.

### Q3 - calibration correctness
- Question: Calibration correctness: is scoring driven exactly by the frozen calibration, and is that calibration accepted by governance evidence?
- Finding class: architecture
- Evidence artifact(s): evidence/p1-evidence-IES-016.json [ATTESTED]; frozen calibration 178160fcbe0a30975c6796ac22c73a9bd03ab91a consumed by the pinned generator [ARENA]; D25 governance blob cbab4da9ce922aacf45e513954d6e325bb037810 read first-hand [ARENA]; acceptance matrix 0a45484582300d106c104e093a176d9ba52f6aec [ARENA]
- Observed: Frozen calibration 178160fcbe0a30975c6796ac22c73a9bd03ab91a consumed by the pinned generator; 13/13 reproduction including override-bearing cases. Governance evidence [ARENA, D25 first-hand]: IES-016 calibration "Matches pack section 4 field-for-field - all 5 segment weight vectors, leverageAlert values, archetypeRisk".
- Analysis: Execution establishes that the frozen calibration drives the recomputation exactly (13/13 value-equal). Acceptance is governance evidence relied upon as such: D25 records the acceptance matrix at 16 gates, all PASS, and the calibration match field-for-field. Limitation: row-level matrix re-trace was not re-performed by the P1 execution; D25 acceptance evidence is relied upon as governance evidence, labelled as such.
- Verdict: PASS
- Rationale: Frozen-calibration consumption is execution-verified; acceptance is carried from D25 first-hand evidence with its labelling, per the recorded findings.
- Downstream implication: A row-level matrix re-trace remains available only to a later pass under separate authorization; nothing here re-adjudicates D25 acceptance content.

### Q4 - override precedence
- Question: Override precedence: do multiple concurrent overrides apply with deterministic, correctly encoded precedence in the override list, composite, and verdict?
- Finding class: architecture
- Evidence artifact(s): evidence/p1-evidence-IES-016.json [ATTESTED]; pinned expected-outputs blob 0d45ffc44df6d61a6f95dac15a12cb6f88be3155 [ARENA]
- Observed: Multi-override case TC-006 (3 concurrent overrides: leverage-breach, competition-pressure, margin-compression; frozen expected composite 60.5, verdict Watch; a second multi-override case TC-011 carries leverage-breach + governance, composite 38.6, verdict Avoid) reproduced exactly - the override list, composite, and verdict encode the precedence outcome; 13/13 equality.
- Analysis: The frozen expected outputs pin multi-override behavior explicitly, and the recomputation reproduced those cases value-exactly; precedence encoding is therefore deterministic and consistent with the committed contract for the frozen case set.
- Verdict: PASS
- Rationale: Multi-override precedence reproduced exactly with 13/13 case equality, per the recorded findings.
- Downstream implication: None registered beyond the frozen case set; no claim is made about inputs outside the frozen 13 cases.

### Q5 - ontology compatibility
- Question: Ontology compatibility: is the engine's ontology registration compatible with the platform ontology at the content/dimension level?
- Finding class: architecture
- Evidence artifact(s): Ontology metadata 31383863e126a6688bd95249522e654c933ec6f1 present and pinned [ARENA]; freeze-manifest recorded claim "CSIP (ontology registration, zero change)" [recorded claim, not re-derived]
- Observed: Ontology metadata present and pinned; the manifest records "CSIP (ontology registration, zero change)" as a recorded claim. The dimension-level registration analysis the IES-010 exemplar performed (8/8 dimensions) has no equivalent in the execution evidence.
- Analysis: No content-level or dimension-level ontology compatibility evidence exists in the v3 bundle. Fail closed: registration metadata existence is not content compatibility. This is not converted to PASS, and no additional evidence is invented here.
- Verdict: UNVERIFIABLE at content level
- Rationale: Fail-closed: the evidence class required for this question was not produced by the P1 execution, per the recorded findings.
- Downstream implication: The dimension-level ontology analysis (IES-010-exemplar style, 8/8 dimensions) remains outstanding and requires separate authorization; registration metadata must not be treated as content compatibility.

### Q6 - CSIP/platform zero-modification
- Question: CSIP/platform zero-modification: did the review execution leave the platform and CSIP untouched?
- Finding class: execution/determinism + governance
- Evidence artifact(s): v3 attestation (zero-mutation statement, disposable clone) [ATTESTED]; fetch-free ref advertisement + pinned baseline [ARENA]
- Observed: Zero mutation attested [ATTESTED]; disposable clone only; baseline pinned; clone executed with --no-checkout and core.autocrlf=false; the Arena-side product trees remain porcelain-clean [ARENA].
- Analysis: Zero-modification is established for the P1 execution window: the execution used a disposable clone, committed nothing, and the baseline advertisement is unchanged. Historical platform-unchanged status is a recorded freeze-manifest claim ("iips-platform unchanged"), cited as such, not re-derived.
- Verdict: PASS (for the P1 execution window)
- Rationale: Attested disposable-clone execution plus Arena-verified unchanged advertisements, per the recorded findings.
- Downstream implication: The PASS is scoped to the P1 execution window only; historical platform-unchanged claims remain recorded claims and are not upgraded here.

### Q7 - traceability
- Question: Traceability: does recomputation reproduce the committed expected outputs and replay datasets (recomputation == committed)?
- Finding class: execution/determinism
- Evidence artifact(s): evidence/p1-evidence-IES-016.json [ATTESTED]; D25 anchor record [ARENA]; pinned expected-outputs blob 0d45ffc44df6d61a6f95dac15a12cb6f88be3155 [ARENA]
- Observed: 13/13 cases equal on all substantive fields [ATTESTED]; anchor cross-check: D25 records frozen expectedOutput 77.8 Buy for this engine's case 1 [ARENA], matching the recomputed first-case values (77.8 Buy (case TC-001)).
- Analysis: Recomputation reproduces the committed outputs at the value level for every substantive field of every case, and the first-case composite/verdict match D25's independently frozen anchor values. Byte identity is NOT established - DF-1 applies with its residual (Section 5).
- Verdict: PASS (at value level)
- Rationale: Value-level traceability 13/13 with a D25 anchor cross-check, per the recorded findings; byte identity never claimed.
- Downstream implication: The DF-1 residual is closable mechanically from the bundle's recomputed SHA-256 values at durable recording; until then, traceability stands at value level only.

### Q8 - frozen-state readiness
- Question: Frozen-state readiness: is the frozen state implementation-ready as claimed by its readiness certificate?
- Finding class: architecture
- Evidence artifact(s): FROZEN manifest 70018bdb38849d50af7258f62d0341ac2bf64f1a (2026-08-29) + full-chain reproducibility [ATTESTED+ARENA]; readiness certificate d764f276d980b6843e1b68939803299181bd3a47 as frozen artifact [ARENA]; D25 readiness citation [ARENA]
- Observed: FROZEN manifest dated 2026-08-29 with the full chain reproducible (13/13 value-level); the readiness certificate exists as a frozen artifact, and D25 cites "13/13 frozen expected outputs reproduced" in the readiness evidence.
- Analysis: The frozen state is reproducible at the authorized level. The certificate's content is a prior frozen claim, not re-adjudicated here; the labelling convention is applied: the certificate is evidence of a frozen readiness record, not a maintainer-issued certification (no Issuer/Issued/Status fields, unlike A1 certificates).
- Verdict: PASS (with labelling)
- Rationale: Frozen-state reproducibility established at the authorized level; certificate content carried as a labelled frozen claim, per the recorded findings.
- Downstream implication: Any issuance or promotion decision requires separate authority; none is granted or implied by this review.

## 8. Overall verdict and registered open items - IES-016

Overall performed-review verdict IES-016: **CONDITIONAL APPROVE (P1 performed-review level)** - all evidence-supported questions PASS; Q5 content-level UNVERIFIABLE (registered); DF-1 byte-level residual registered (Section 5).

Registered open items for this engine (all carried from the recorded findings; none resolved by this artifact):
1. Q5 ontology compatibility: UNVERIFIABLE at content level - not converted to PASS.
2. DF-1: byteIdentical=false / caseDiffs=0 - convention identified (Windows Python text-mode CRLF write versus committed LF serialization, corroborated by [DEVELOPMENT] Linux byte-identity, which is not P1 evidence); newline-only-ness not cryptographically proven from the Windows attestation alone; mechanically closable from the bundle's recomputed SHA-256 values.
3. Manifest corroboration rows exist in the bundle but were not quoted in the Windows attestation, while primary 33/33 blob verification was attested.

## 9. Four-state distinction - IES-016 (do not conflate)

- Evidence complete: YES for this engine (attested 9-file bundle, premise-validated, reviewed [ATTESTED+ARENA]).
- Architecture review complete: YES AT THE AUTHORIZED LEVEL - this record is the performed review for this engine, WITH the registered UNVERIFIABLE/residual items above; it is NOT an all-questions-PASS certificate.
- Parity certified: NO. Nothing here certifies product parity; D7-TIER3-PARITY remains NOT SATISFIED until a separate determination evaluates this evidence; IES-016 remains Class A, maturity A2.
- Product promotion/release authority: NONE. No A2 to A1, no certification, no release/tag, no promotion, no implementation authority is granted or implied by this artifact.

## 10. Boundaries and prohibitions observed by this artifact

- No P2 or P3 work begun or authorized; content-level cross-reading is expressly out of scope here.
- No parity certification; no promotion or release authority; no implementation instructions.
- The already-recorded P1 findings artifact, the P1 scope authority, and the product baseline are NOT modified by this authoring; the D36/AR stubs are NOT retro-filled.
- Fail-closed rules applied throughout: attested facts never upgraded to Arena-verified; unavailable evidence not treated as absent; byteIdentical=false interpreted explicitly (Section 5), never silently normalized; every unsupported claim remains UNVERIFIABLE.

## 11. Provenance and integrity

- NEW work, dated 2026-09-05, authored by the Arena agent as a downstream authoring from the durably recorded findings artifact (commit 367ffdbc71babfc63fa54e5238be91cedb6fc0bf, content SHA-256 ea6a23b48205fc9fa64174835bd29c0b64f8fc0b3d65002245275484117e4e55) and the same first-hand [ARENA] verifications cited therein (pinned product blobs at baseline 830bd7218f6a77274e3d58eef09d706a3a99794f; governance blobs cbab4da9ce922aacf45e513954d6e325bb037810 / 8cc089df6ae680706921dd5ecb57b75776ad4580).
- No repository mutation occurred in this authoring (nothing staged, committed, or pushed; product and governance repositories untouched; Windows paths not accessed).
- Identity at authoring time: see the SHA-256 / byte count / line count reported by the authoring gate that produced this file.

