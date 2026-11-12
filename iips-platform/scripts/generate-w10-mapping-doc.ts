/**
 * Regenerate `docs/integration/W10-ISSUER-TO-ENGINE-MAPPING-2026-11-12.md` from the qualification registry.
 *
 * Usage (from `iips-platform/`):  npx tsx scripts/generate-w10-mapping-doc.ts
 *
 * The same renderer is asserted byte-for-byte by `tests/investment/w10IssuerEngineMapping.test.ts`, so the published
 * document and the mapping the qualification applies cannot drift apart.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  MATRIX_BEGIN,
  MATRIX_END,
  QUALIFICATION_CODE_SEVERITY,
  TRACKED_ENGINE_PROFILES,
  mappingTotals,
  renderMappingMatrixMarkdown,
  type EngineQualificationProfile,
  type FieldMapping,
} from '../src/investment/qualification';

const DOC = resolve(__dirname, '..', '..', 'docs', 'integration', 'W10-ISSUER-TO-ENGINE-MAPPING-2026-11-12.md');

const row = (cells: readonly string[]): string => `| ${cells.map((cell) => cell.replace(/\|/g, '\\|')).join(' | ')} |`;

function counts(profile: EngineQualificationProfile): string[] {
  const statuses = (status: FieldMapping['status']): number => profile.fields.filter((field) => field.status === status).length;
  return [
    profile.engineId,
    profile.ies,
    profile.sectorFamily,
    String(profile.fields.length),
    String(profile.fields.filter((field) => field.requirement === 'REQUIRED').length),
    String(statuses('MAPPED')),
    String(statuses('DERIVED')),
    String(statuses('UNMAPPED')),
    String(statuses('CONFLICT')),
    String(
      profile.fields.filter(
        (field) => field.requirement === 'REQUIRED' && (field.status === 'UNMAPPED' || field.status === 'CONFLICT'),
      ).length,
    ),
  ];
}

function structuralBlockers(profile: EngineQualificationProfile): FieldMapping[] {
  return profile.fields.filter((field) => field.status === 'CONFLICT' || (field.status === 'UNMAPPED' && field.requirement === 'REQUIRED'));
}

function unread(profile: EngineQualificationProfile): FieldMapping[] {
  return profile.fields.filter((field) => field.requirement === 'DECLARED_UNUSED');
}

function render(): string {
  const totals = mappingTotals();
  const profiles = TRACKED_ENGINE_PROFILES;
  const blockers = profiles.flatMap((profile) => structuralBlockers(profile).map((field) => ({ profile, field })));
  const unreadFields = profiles.flatMap((profile) => unread(profile).map((field) => ({ profile, field })));
  const flags = profiles.flatMap((profile) =>
    profile.fields.filter((field) => field.requirement === 'DECISION_FLAG').map((field) => ({ profile, field })),
  );

  const lines: string[] = [];
  lines.push('# W10 — issuer-to-engine field mapping and qualification (2026-11-12)');
  lines.push('');
  lines.push('**Status: COMPLETE.** This document is the auditable, field-level mapping of every input declared by the thirteen certified sector engines, together with the rules the integrated issuer-to-engine qualification applies to each one. The matrix in §7 is generated from the executing registry (`iips-platform/src/investment/qualification/mapping.ts`) and is asserted byte-for-byte by the W10 suite, so the published mapping and the mapping the code applies are the same artefact.');
  lines.push('');
  lines.push('Qualification is a **readiness** statement: it says whether each engine’s declared inputs can be resolved from governed IID evidence at an evaluated period. It publishes no score, verdict, rank, target price or recommendation, and it does not execute any engine. No golden, expected-output or validation fixture is used as issuer evidence anywhere in this work.');
  lines.push('');
  lines.push('## 1. Scope and authority');
  lines.push('');
  lines.push('- **Engines covered:** exactly the thirteen entries of the frozen `CERTIFIED_ENGINES` registry (`iips-platform/src/integration/EngineRegistry.ts`). The W10 suite asserts that the qualification registry and the certified registry name the same engines, with the same IES, sector family, engine version and calibration profile.');
  lines.push('- **Inputs covered:** every property declared by each engine’s `…Input` interface, including declared decision-override flags. Where an interface also declares an index signature, that signature is recorded as `hasIndexSignature` and is **not** treated as permission to pass unlisted keys; only declared fields are mapped, qualified or forwarded.');
  lines.push('- **Not in scope:** any change to a sector engine, its calibration, its scoring or decision path; any W11 work; Dhan live integration; the IPD; and any reinterpretation of W05 or W07 evidence. Nothing under `iips-platform/src/sector-engines` or `iips-platform/src/integration` is modified, and the A13 protected-surface guard is untouched.');
  lines.push('');
  lines.push('## 2. How the mapping was built');
  lines.push('');
  lines.push('Each declared input was traced through the frozen engine in three steps, and only findings that survived all three were recorded:');
  lines.push('');
  lines.push('1. **Declaration.** The field was read from the engine’s `…Input` interface, with its declared type and optionality.');
  lines.push('2. **Consumption.** The field was traced into the engine’s metrics, scoring, calibration and decision code to establish whether the path actually reads it, how many times, with what transform, and against which calibration band table. This step is why the registry distinguishes `DECLARED_UNUSED` (declared, never read) and `CONFLICT` (read, but the canonical quantity the engine expects cannot be reproduced without an undeclared transform) from `MAPPED`/`DERIVED`.');
  lines.push('3. **Evidence.** A source was authorized only where a governed IID contract supplies exactly that quantity: a canonical line item through the closed line-item table, a canonical operating metric through the closed `MetricId` table (with its unit, range and minimum source class), or a statement-derived ratio whose inputs are canonical line items and whose formula is declared on the field. No mapping was inferred from a similar-looking name, and no mapping was authorized by a calibration band that merely happens to fit.');
  lines.push('');
  lines.push('Derived ratios are computed by the qualification itself (seven declared derivations) and published with `basis=DERIVED`, their formula, their inputs and their declared deviation. Nothing is backfilled into the dataset, and a derived value is never presented as a filed figure.');
  lines.push('');
  lines.push(`## 3. Field-level determination`);
  lines.push('');
  lines.push(`${totals.engines} engines · ${totals.fields} declared inputs · ${totals.required} required · ${totals.mapped} mapped · ${totals.derived} derived · ${totals.unmapped} unmapped · ${totals.conflict} conflict. Of the ${totals.required} required inputs, ${totals.requiredMappedOrDerived} have an authorized source and ${totals.required - totals.requiredMappedOrDerived} do not. ${totals.enginesWithNoStructuralBlocker} of ${totals.engines} engines ${totals.enginesWithNoStructuralBlocker === 1 ? 'has' : 'have'} no structural blocker in the registry.`);
  lines.push('');
  lines.push(row(['Engine', 'IES', 'Sector', 'Declared', 'Required', 'Mapped', 'Derived', 'Unmapped', 'Conflict', 'Structural blockers']));
  lines.push(row(['---', '---', '---', '---:', '---:', '---:', '---:', '---:', '---:', '---:']));
  for (const profile of profiles) lines.push(row(counts(profile)));
  lines.push('');
  lines.push('A structural blocker is a **required** input whose mapping status is `CONFLICT` or `UNMAPPED`. An engine with any structural blocker can never be qualified from any dataset, and the qualification reports `NOT_QUALIFIED` with `ENGINE_REQUIRED_INPUT_UNRESOLVED` regardless of the evidence supplied. Only Banking has none — and even Banking is qualified by default policy only when its two closing-balance ratios are permitted, because `BM-001`/`BM-002` are declared deviations (§6).');
  lines.push('');
  lines.push('## 4. Structural blockers (required inputs with no authorized source)');
  lines.push('');
  lines.push(row(['Engine', 'Field', 'Label', 'Status', 'Why no authorized mapping exists']));
  lines.push(row(['---', '---', '---', '---', '---']));
  for (const { profile, field } of blockers) lines.push(row([profile.engineId, `\`${field.field}\``, field.label, field.status, field.calibrationImplication]));
  lines.push('');
  lines.push('`CONFLICT` is a stronger statement than `UNMAPPED`: a canonical source exists, but the frozen path applies an undeclared transform (a doubling, an inversion, a hard-coded unit assumption or a band scale) that the canonical quantity does not carry. Mapping such a field would silently change the engine’s output, so it is refused and the conflict is published instead. This is the mechanism by which the inventory’s risk register became machine-enforced rather than prose.');
  lines.push('');
  lines.push('## 5. Declared but unread inputs');
  lines.push('');
  lines.push(row(['Engine', 'Field', 'Label', 'Evidence note']));
  lines.push(row(['---', '---', '---', '---']));
  for (const { profile, field } of unreadFields) lines.push(row([profile.engineId, `\`${field.field}\``, field.label, field.calibrationImplication]));
  lines.push('');
  lines.push('These fields are declared by the interface and never read by their engine. They are published as `DECLARED_UNUSED` and never qualified, so a caller cannot mistake a declared-but-unread property for an input that changes the engine’s result. Where such a field would have been required, the requirement was corrected in the registry, not in the engine.');
  lines.push('');
  lines.push('## 6. Decision-override flags');
  lines.push('');
  lines.push(row(['Engine', 'Field', 'Label']));
  lines.push(row(['---', '---', '---']));
  for (const { profile, field } of flags) lines.push(row([profile.engineId, `\`${field.field}\``, field.label]));
  lines.push('');
  lines.push('The dataset contract carries no governance, adverse-event or catastrophe declaration, and none of these flags can be evidenced from a financial statement. Each is therefore published as `OPTIONAL_ABSENT` with `FIELD_DECISION_FLAG_UNSUPPORTED` and a report-level limitation: the engine will run without it, and **the absence of a flag is never evidence that the event did not occur**. No qualification certifies the absence of an adverse event.');
  lines.push('');
  lines.push('## 7. The matrix');
  lines.push('');
  lines.push('One identity table and one semantics table per engine. The identity table states what the field means, what evidence would satisfy it and how it is transformed; the semantics table states the period, basis and scope it is read at, its units/currency/scaling, what missing, zero and invalid mean, its freshness window and data-quality rule, and how the frozen calibration consumes it.');
  lines.push('');
  lines.push(MATRIX_BEGIN);
  lines.push('');
  lines.push(renderMappingMatrixMarkdown(profiles).trimEnd());
  lines.push('');
  lines.push(MATRIX_END);
  lines.push('');
  lines.push('## 8. Fail-closed rules applied by the qualification');
  lines.push('');
  lines.push('Every field resolves to exactly one outcome, published with a code set, a note and (where a value exists) the evidence that produced it: the period, statement scope, basis, presence, reason, source reference, filing reference and the observations a derivation consumed.');
  lines.push('');
  lines.push('| Outcome | Meaning |');
  lines.push('|---|---|');
  lines.push('| `RESOLVED` | A governed value exists at the evaluated period, scope and basis, and passes every check. |');
  lines.push('| `MISSING` | The source exists in the contracts but carries no record for this issuer; absence is not zero. |');
  lines.push('| `NIL_NOT_ZERO` | The source positively declares nil; a nil is not a number. |');
  lines.push('| `STALE` | The latest evidenced period is outside the frozen freshness window (P&L 200 days, balance sheet 250 days). |');
  lines.push('| `SCOPE_MISMATCH` / `PERIOD_MISMATCH` | The value exists only at another statement scope or another period, and is not substituted. |');
  lines.push('| `INVALID` | The value exists but fails a contract check (unit, range, validation state, source class, imputation, future observation, ambiguity, cross-field contradiction). |');
  lines.push('| `DERIVATION_BLOCKED` | A declared derivation cannot be computed (missing input, zero denominator, negative base). |');
  lines.push('| `DERIVATION_NOT_PERMITTED` | The derivation is a closing-balance ratio and the policy does not permit that declared deviation. |');
  lines.push('| `UNSUPPORTED` | The registry declares no authorized source for this input. |');
  lines.push('| `CONFLICT` | The registry declares that the frozen path’s transform cannot be reproduced from a canonical quantity. |');
  lines.push('| `SELECTOR_UNRESOLVED` | The issuer’s sector classification does not name a member of the engine’s closed vocabulary. |');
  lines.push('| `OPTIONAL_ABSENT` | An advisory decision flag with no governed source; recorded as a limitation, never blocking. |');
  lines.push('| `NOT_EVALUATED` | The field is declared-but-unread, or the engine does not apply to the issuer’s sector. |');
  lines.push('');
  lines.push('Codes and their severities:');
  lines.push('');
  lines.push(row(['Code', 'Severity']));
  lines.push(row(['---', '---']));
  for (const [code, severity] of Object.entries(QUALIFICATION_CODE_SEVERITY)) lines.push(row([`\`${code}\``, severity]));
  lines.push('');
  lines.push('Engine state is derived, never assumed: an engine whose sector does not match the issuer is `NOT_APPLICABLE`; an applicable engine with any non-`RESOLVED` **required** input, or with any blocking engine code, is `NOT_QUALIFIED`; otherwise it is `QUALIFIED`. Cross-field contradictions stated in the canonical contracts (NNPA ≤ GNPA, CET1 ≤ CAR, RevPAR = ADR × occupancy) fail both participating fields and the engine.');
  lines.push('');
  lines.push('## 9. W07 and W05 interplay');
  lines.push('');
  lines.push('The qualification consumes the W07 capital-structure block unchanged (`capital-structure/1.0.0`) rather than recomputing debt:');
  lines.push('');
  lines.push('- Gross debt is the W07 aggregate over short-term borrowings, current maturities, long-term borrowings and lease liabilities. A component that is absent blocks the aggregate; a component the filer declared nil is counted as zero only under the W07 aggregation contract, and the nil keeps its source and period.');
  lines.push('- Net debt is never substituted for gross debt. Where W07 cannot build net debt (for example the unresolved KEC `CURRENT_INVESTMENTS`), the qualification simply does not need it: no engine input is mapped to net debt.');
  lines.push('- A leverage multiple is refused when the debt instant differs from the period the EBITDA belongs to. W07 will resolve borrowings from the latest year that reported them; the qualification will not divide this year’s earnings by last year’s balance sheet, so a missing current-year borrowing block yields `PERIOD_MISMATCH`, not a stale ratio.');
  lines.push('- The unresolved Marico `PREFERENCE_CAPITAL` (W07 `L-038`) and KEC `CURRENT_INVESTMENTS` (W07 `L-039`) remain unresolved and unvalued here. Neither is mapped to any engine input, and neither is turned into a zero by this work.');
  lines.push('');
  lines.push('## 10. What this document and the qualification do not do');
  lines.push('');
  lines.push('- They do not score, rank, value or recommend any issuer, and they do not assert that a qualified engine would produce a particular verdict.');
  lines.push('- They do not claim that a `MAPPED` field is economically identical to the label the frozen engine uses: the mapping states the canonical quantity, its unit and the transform, and it preserves every known semantic gap as `CONFLICT` or as an explicit note.');
  lines.push('- They do not authorize any currently unmapped or conflicting input. Mapping a conflict remains a methodology decision for its owner, not a qualification concern.');
  lines.push('- They do not validate the frozen calibration. Where a calibration band table is inconsistent (for example a band boundary that cannot be reached, or a field reused from the wrong table), the registry records the fact on the field and the qualification refuses only where the *input* cannot be evidenced. Scoring defects inside a frozen engine are outside W10’s authority to fix and are not silently worked around.');
  lines.push('');
  lines.push('## 11. Reproduce and verify');
  lines.push('');
  lines.push('```bash');
  lines.push('cd iips-platform');
  lines.push('npx tsx scripts/generate-w10-mapping-doc.ts          # regenerate this document from the registry');
  lines.push('npx tsx --test tests/investment/w10IssuerEngineMapping.test.ts');
  lines.push('npx tsx --test tests/investment/w10IssuerEngineQualification.test.ts');
  lines.push('```');
  lines.push('');
  lines.push('The W10 suite fails if any declared interface property is missing from the registry, if any extra property is invented, if any mapping attribute is empty, if a `MAPPED` metric’s engine unit differs from its canonical unit, if a `DERIVED` field names an unknown derivation or an unknown line item, if the certified registry and the qualification registry diverge, or if this document is stale.');
  lines.push('');
  return lines.join('\n');
}

writeFileSync(DOC, render(), 'utf8');
process.stdout.write(`wrote ${DOC}\n`);
