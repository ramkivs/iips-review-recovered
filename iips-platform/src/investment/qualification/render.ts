/**
 * W10 — deterministic documentation renderer for the field-level mapping matrix.
 *
 * The published matrix in `docs/integration/W10-ISSUER-TO-ENGINE-MAPPING-2026-11-12.md` is generated from
 * the same registry the qualification executes, between two markers. The W10 suite regenerates it and
 * compares byte-for-byte, so the document cannot drift away from the code that applies it.
 */
import type { EngineQualificationProfile, FieldMapping } from './types';
import { TRACKED_ENGINE_PROFILES } from './mapping';

export const MATRIX_BEGIN = '<!-- BEGIN GENERATED FIELD MATRIX -->';
export const MATRIX_END = '<!-- END GENERATED FIELD MATRIX -->';

const cell = (value: string): string => value.replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim();

function requirementLabel(field: FieldMapping): string {
  switch (field.requirement) {
    case 'REQUIRED':
      return 'REQUIRED';
    case 'CONDITIONAL':
      return 'CONDITIONAL';
    case 'DECISION_FLAG':
      return 'DECISION_FLAG';
    case 'DECLARED_UNUSED':
      return 'DECLARED_UNUSED (unread)';
  }
}

function countByStatus(profile: EngineQualificationProfile, requirement: 'REQUIRED' | 'ALL'): string {
  const fields = requirement === 'REQUIRED' ? profile.fields.filter((field) => field.requirement === 'REQUIRED') : profile.fields;
  const count = (status: FieldMapping['status']): number => fields.filter((field) => field.status === status).length;
  return `${fields.length} total · ${count('MAPPED')} mapped · ${count('DERIVED')} derived · ${count('UNMAPPED')} unmapped · ${count('CONFLICT')} conflict`;
}

function readinessVerdict(profile: EngineQualificationProfile): string {
  const blocking = profile.fields.filter(
    (field) => field.requirement === 'REQUIRED' && (field.status === 'UNMAPPED' || field.status === 'CONFLICT'),
  );
  if (blocking.length === 0) return 'no structural blocker in the registry (all required inputs have an authorized source)';
  return `structurally blocked by ${blocking.length} required input(s) with no authorized source`;
}

/** The generated matrix: one identity table and one semantics table per engine. */
export function renderMappingMatrixMarkdown(profiles: readonly EngineQualificationProfile[] = TRACKED_ENGINE_PROFILES): string {
  const lines: string[] = [];
  for (const profile of profiles) {
    lines.push(`### ${profile.sectorFamily} — \`${profile.engineId}\` (${profile.ies}, engine ${profile.engineVersion}, calibration ${profile.calibrationVersion})`);
    lines.push('');
    lines.push(`- Declared inputs: ${countByStatus(profile, 'ALL')}; **required inputs: ${countByStatus(profile, 'REQUIRED')}**.`);
    lines.push(`- ${readinessVerdict(profile)}.`);
    lines.push(`- Declared in \`${profile.declaredIn}\`${profile.hasIndexSignature ? '; the interface also declares an index signature, which is **not** permission to pass unlisted inputs' : ''}.`);
    lines.push('');
    lines.push('| Field | Label | Requirement | Mapping status | Meaning | Evidence source | Transformation |');
    lines.push('|---|---|---|---|---|---|---|');
    for (const field of profile.fields) {
      lines.push(
        `| \`${field.field}\` | ${cell(field.label)} | ${requirementLabel(field)} | **${field.status}** | ${cell(field.meaning)} | ${cell(field.evidenceSource)} | ${cell(field.transformation)} |`,
      );
    }
    lines.push('');
    lines.push('| Field | Period | Basis | Scope | Units / currency / scaling | Missing · zero · invalid semantics | Freshness / data quality | Confidence / calibration implication |');
    lines.push('|---|---|---|---|---|---|---|---|');
    for (const field of profile.fields) {
      lines.push(
        `| \`${field.field}\` | ${cell(field.period)} | ${cell(field.basis)} | ${cell(field.scope)} | ${cell(
          `${field.units.engineUnit}; currency ${field.units.currency ?? 'n/a'}; scale ${field.units.scale}; source ${field.units.sourceUnit ?? 'none'}`,
        )} | ${cell(`MISSING: ${field.missingSemantics} ZERO: ${field.zeroSemantics} INVALID: ${field.invalidSemantics}`)} | ${cell(
          `${field.freshness}; ${field.dataQuality}`,
        )} | ${cell(`${field.confidence} ${field.calibrationImplication}`)} |`,
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}

/** Counts used by the executive determination table in the published document. */
export function mappingTotals(profiles: readonly EngineQualificationProfile[] = TRACKED_ENGINE_PROFILES): {
  readonly engines: number;
  readonly fields: number;
  readonly required: number;
  readonly mapped: number;
  readonly derived: number;
  readonly unmapped: number;
  readonly conflict: number;
  readonly requiredMappedOrDerived: number;
  readonly enginesWithNoStructuralBlocker: number;
} {
  const fields = profiles.flatMap((profile) => profile.fields);
  const required = fields.filter((field) => field.requirement === 'REQUIRED');
  return {
    engines: profiles.length,
    fields: fields.length,
    required: required.length,
    mapped: fields.filter((field) => field.status === 'MAPPED').length,
    derived: fields.filter((field) => field.status === 'DERIVED').length,
    unmapped: fields.filter((field) => field.status === 'UNMAPPED').length,
    conflict: fields.filter((field) => field.status === 'CONFLICT').length,
    requiredMappedOrDerived: required.filter((field) => field.status === 'MAPPED' || field.status === 'DERIVED').length,
    enginesWithNoStructuralBlocker: profiles.filter(
      (profile) => profile.fields.filter((field) => field.requirement === 'REQUIRED').every((field) => field.status === 'MAPPED' || field.status === 'DERIVED'),
    ).length,
  };
}
