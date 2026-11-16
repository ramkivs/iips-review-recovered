/**
 * W10 — issuer-to-engine qualification.
 *
 * One issuer, one dataset, all thirteen certified engines: for each engine, is every input the frozen
 * scoring/decision path actually reads resolvable from governed IID evidence? The answer is a readiness
 * statement with field-level evidence, never a score, verdict or recommendation.
 *
 * Fail-closed rules, all machine-readable:
 *  - an engine whose sector does not match the issuer's is `NOT_APPLICABLE` (nothing is resolved for it);
 *  - an engine with any unresolved required input is `NOT_QUALIFIED`;
 *  - cross-field violations from `contracts/operatingMetrics.ts` (NNPA > GNPA, CET1 > CAR, RevPAR ≠ ADR ×
 *    occupancy) fail the engine and mark the participating fields;
 *  - a stale, out-of-scope, out-of-period, unvalidated, weak-sourced, imputed, nil-as-number or
 *    unparseable input refuses its field with its own code.
 */
import { createHash } from 'node:crypto';
import { crossFieldIssues } from '../contracts/operatingMetrics';
import { selectSeries } from '../assessment/periods';
import type { FinancialPeriodView } from '../assessment/types';
import type { DatasetContent } from '../fundamentals/types';
import { canonicalJson, TRACKED_ENGINE_PROFILES } from './mapping';
import { FieldResolver, fieldQualification } from './resolve';
import {
  DEFAULT_QUALIFICATION_POLICY,
  ISSUER_QUALIFICATION_MAPPING_VERSION,
  ISSUER_QUALIFICATION_POLICY_VERSION,
  ISSUER_QUALIFICATION_SCHEMA_VERSION,
  QUALIFICATION_CODE_SEVERITY,
  type EngineQualification,
  type EngineQualificationProfile,
  type EngineQualificationState,
  type FieldQualification,
  type IssuerEngineQualificationReport,
  type QualificationCode,
  type QualificationContext,
  type QualificationPolicy,
  type QualificationRequest,
  type QualificationSummary,
} from './types';

/** A caller error the report cannot express as an engine outcome. */
export class IssuerQualificationError extends Error {
  constructor(
    readonly code: 'REQUEST_INVALID' | 'ISSUER_NOT_FOUND' | 'ENGINE_UNKNOWN',
    message: string,
  ) {
    super(message);
    this.name = 'IssuerQualificationError';
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/;

function policyOf(overrides: Partial<QualificationPolicy> | undefined): QualificationPolicy {
  return Object.freeze({ ...DEFAULT_QUALIFICATION_POLICY, ...(overrides ?? {}) });
}

function mappingDigest(profiles: readonly EngineQualificationProfile[]): string {
  return createHash('sha256').update(canonicalJson(profiles)).digest('hex');
}

function latestAnnualAtScope(content: DatasetContent, issuerId: string, scope: 'CONSOLIDATED' | 'STANDALONE'): FinancialPeriodView | null {
  const series = selectSeries(content.periods, issuerId);
  const matching = series.annual.filter((view) => view.statementScope === scope);
  if (matching.length === 0) return null;
  return [...matching].sort((a, b) => (a.periodEnd < b.periodEnd ? 1 : a.periodEnd > b.periodEnd ? -1 : 0))[0] ?? null;
}

function drawLimitations(profiles: readonly EngineQualificationProfile[], policy: QualificationPolicy): string[] {
  const indexSignatureEngines = profiles.filter((profile) => profile.hasIndexSignature).map((profile) => profile.engineId);
  const limitations = [
    'Qualification is a readiness statement about inputs only. It is not an investment decision, a score, a verdict or a recommendation, and this module never executes a sector engine.',
    'Decision override flags (governance, adverse events) have no governed dataset field. Their absence is published as FIELD_DECISION_FLAG_UNSUPPORTED and is never read as evidence that no adverse event occurred, so no qualification certifies the absence of one.',
    'Statement-derived ratios carry basis=DERIVED. The frozen engine bands were calibrated on as-reported metrics; each derivation’s formula and declared deviation are published on the field that uses it.',
    policy.allowClosingBalanceRatioDerivations
      ? 'Closing-balance ROA/ROE derivations are ENABLED by policy: the denominator is period-end assets/equity, not an average, and that declared deviation travels with every field that consumes it.'
      : 'Closing-balance ROA/ROE derivations are DISABLED by policy: a required ROA/ROE input therefore refuses with FIELD_DERIVATION_NOT_PERMITTED rather than substituting a period-end denominator.',
    'W07 capital-structure safeguards are consumed unchanged: gross debt comes from capital-structure/1.0.0, net debt is never substituted, and a missing CURRENT_INVESTMENTS (KEC L-039) or PREFERENCE_CAPITAL (Marico L-038) blocks exactly what W07 blocks.',
    indexSignatureEngines.length === 0
      ? 'No evaluated engine declares an index signature.'
      : `Engines with a declared index signature (${indexSignatureEngines.join(', ')}) accept extra keys at runtime; the mapping deliberately covers only the declared fields and never treats the index signature as permission to pass unlisted inputs.`,
  ];
  return limitations;
}

function stateOf(requiredUnresolved: number, engineCodes: readonly QualificationCode[]): EngineQualificationState {
  const blocking = engineCodes.some((code) => QUALIFICATION_CODE_SEVERITY[code] === 'BLOCKING');
  if (requiredUnresolved > 0 || blocking) return 'NOT_QUALIFIED';
  return 'QUALIFIED';
}

/**
 * Qualify one issuer against the certified engines.
 *
 * Pure: dataset in, report out. No clock read (the caller supplies `asOf`), no I/O, no network, no
 * persistence, and no engine execution.
 */
export function qualifyIssuerToEngines(request: QualificationRequest): IssuerEngineQualificationReport {
  const { content, issuerId, asOf } = request;
  if (typeof asOf !== 'string' || !ISO_DATE.test(asOf) || Number.isNaN(Date.parse(asOf))) {
    throw new IssuerQualificationError('REQUEST_INVALID', `asOf must be an ISO date/timestamp string; received ${String(asOf)}`);
  }
  if (content === null || content === undefined || !Array.isArray(content.periods)) {
    throw new IssuerQualificationError('REQUEST_INVALID', 'A dataset content object with a periods array is required.');
  }
  const issuer = content.issuers.find((candidate) => candidate.issuerId === issuerId);
  if (issuer === undefined) {
    throw new IssuerQualificationError('ISSUER_NOT_FOUND', `Issuer '${issuerId}' is not present in the dataset roster.`);
  }

  const policy = policyOf(request.policy);
  const allProfiles = request.profiles ?? TRACKED_ENGINE_PROFILES;
  let profiles: readonly EngineQualificationProfile[] = allProfiles;
  if (request.engineIds !== undefined) {
    const unknown = request.engineIds.filter((engineId) => !allProfiles.some((profile) => profile.engineId === engineId));
    if (unknown.length > 0) {
      throw new IssuerQualificationError('ENGINE_UNKNOWN', `Unknown engine id(s): ${unknown.join(', ')}`);
    }
    const requested = request.engineIds;
    profiles = allProfiles.filter((profile) => requested.includes(profile.engineId));
  }

  const series = selectSeries(content.periods, issuerId);
  const pinned = request.periodEnd ?? null;
  const chosen = pinned === null
    ? latestAnnualAtScope(content, issuerId, policy.requiredStatementScope)
    : series.annual.find((view) => view.periodEnd === pinned && view.statementScope === policy.requiredStatementScope) ?? null;
  if (pinned !== null && chosen === null) {
    throw new IssuerQualificationError(
      'REQUEST_INVALID',
      `No ${policy.requiredStatementScope} annual period ends ${pinned} for issuer '${issuerId}'.`,
    );
  }
  const prior = chosen === null
    ? null
    : series.annual.find(
        (view) =>
          view.statementScope === chosen.statementScope &&
          view.fiscalYear === chosen.fiscalYear - 1 &&
          view.periodEnd < chosen.periodEnd,
      ) ?? null;

  const context: QualificationContext = Object.freeze({
    content,
    issuerId,
    legalName: issuer.legalName,
    sector: issuer.sector,
    asOf,
    datasetVersion: request.datasetVersion ?? null,
    period: content.periods.find((period) => period.issuerId === issuerId && period.period.periodEnd === chosen?.periodEnd) ?? null,
    prior: content.periods.find((period) => period.issuerId === issuerId && period.period.periodEnd === prior?.periodEnd) ?? null,
    statementScope: chosen?.statementScope ?? null,
    policy,
  });

  const resolver = new FieldResolver(content, context, series, chosen, prior);
  const engines: EngineQualification[] = [];

  for (const profile of profiles) {
    const sectorApplicable = issuer.sector === profile.sectorFamily;
    if (!sectorApplicable) {
      engines.push(
        Object.freeze({
          engineId: profile.engineId,
          ies: profile.ies,
          sectorFamily: profile.sectorFamily,
          engineVersion: profile.engineVersion,
          calibrationVersion: profile.calibrationVersion,
          sectorApplicable: false,
          state: 'NOT_APPLICABLE' as const,
          codes: Object.freeze(['ENGINE_SECTOR_MISMATCH' as QualificationCode]),
          requiredInputs: profile.fields.filter((field) => field.requirement === 'REQUIRED').length,
          requiredResolved: 0,
          fields: Object.freeze(
            profile.fields.map((field) =>
              fieldQualification(field, {
                outcome: 'NOT_EVALUATED',
                value: null,
                unit: null,
                codes: [],
                evidence: null,
                note: `Not evaluated: the issuer’s sector is ${issuer.sector}, not ${profile.sectorFamily}.`,
              }),
            ),
          ),
        }),
      );
      continue;
    }

    const fields: FieldQualification[] = profile.fields.map((field) => fieldQualification(field, resolver.resolve(field)));

    // Cross-field consistency over the canonical metrics that actually resolved for this engine.
    const resolvedMetrics = profile.fields
      .map((field, index) => ({ field, result: fields[index]! }))
      .filter((entry) => entry.field.source.kind === 'OPERATING_METRIC' && entry.result.outcome === 'RESOLVED')
      .map((entry) => ({
        metricId: (entry.field.source as { kind: 'OPERATING_METRIC'; metricId: import('../contracts/operatingMetrics').MetricId }).metricId,
        value: entry.result.value as number,
        field: entry.field.field,
      }));
    const crossField = crossFieldIssues(resolvedMetrics.map(({ metricId, value }) => ({ metricId, value })));
    const crossFieldMetrics = new Set(crossField.flatMap((issue) => issue.metrics ?? []));
    const marked = fields.map((field, index) => {
      const mapping = profile.fields[index]!;
      if (mapping.source.kind !== 'OPERATING_METRIC' || !crossFieldMetrics.has(mapping.source.metricId)) return field;
      return Object.freeze({
        ...field,
        outcome: 'INVALID' as const,
        codes: Object.freeze([...field.codes, 'FIELD_CROSS_FIELD_VIOLATION' as QualificationCode]),
        note: `${field.note} Cross-field violation: ${crossField.map((issue) => issue.detail).join('; ')}`,
      });
    });

    const engineCodes: QualificationCode[] = [];
    if (chosen === null) engineCodes.push('ENGINE_NO_CONSOLIDATED_PERIOD');
    if (crossField.length > 0) engineCodes.push('ENGINE_CROSS_FIELD_VIOLATION');
    const requiredFields = profile.fields.filter((field) => field.requirement === 'REQUIRED');
    const requiredUnresolved = marked.filter((field) => field.requirement === 'REQUIRED' && field.outcome !== 'RESOLVED').length;
    if (requiredUnresolved > 0) engineCodes.push('ENGINE_REQUIRED_INPUT_UNRESOLVED');
    const state = stateOf(requiredUnresolved, engineCodes);

    engines.push(
      Object.freeze({
        engineId: profile.engineId,
        ies: profile.ies,
        sectorFamily: profile.sectorFamily,
        engineVersion: profile.engineVersion,
        calibrationVersion: profile.calibrationVersion,
        sectorApplicable: true,
        state,
        codes: Object.freeze([...new Set(engineCodes)]),
        requiredInputs: requiredFields.length,
        requiredResolved: requiredFields.length - requiredUnresolved,
        fields: Object.freeze(marked),
      }),
    );
  }

  const allFields = engines.flatMap((engine) => engine.fields);
  const summary: QualificationSummary = Object.freeze({
    enginesEvaluated: engines.length,
    enginesApplicable: engines.filter((engine) => engine.sectorApplicable).length,
    enginesQualified: engines.filter((engine) => engine.state === 'QUALIFIED').length,
    enginesNotQualified: engines.filter((engine) => engine.state === 'NOT_QUALIFIED').length,
    enginesNotApplicable: engines.filter((engine) => engine.state === 'NOT_APPLICABLE').length,
    fieldsEvaluated: allFields.length,
    fieldsResolved: allFields.filter((field) => field.outcome === 'RESOLVED').length,
    fieldsUnsupported: allFields.filter((field) => field.outcome === 'UNSUPPORTED').length,
    fieldsConflicting: allFields.filter((field) => field.outcome === 'CONFLICT').length,
    fieldsMissing: allFields.filter((field) => field.outcome === 'MISSING' || field.outcome === 'PERIOD_MISMATCH' || field.outcome === 'SCOPE_MISMATCH' || field.outcome === 'NIL_NOT_ZERO' || field.outcome === 'SELECTOR_UNRESOLVED').length,
    fieldsStale: allFields.filter((field) => field.outcome === 'STALE').length,
    fieldsInvalid: allFields.filter((field) => field.outcome === 'INVALID' || field.outcome === 'DERIVATION_BLOCKED' || field.outcome === 'DERIVATION_NOT_PERMITTED').length,
    fieldsNotEvaluated: allFields.filter((field) => field.outcome === 'NOT_EVALUATED').length,
    fieldsOptionalAbsent: allFields.filter((field) => field.outcome === 'OPTIONAL_ABSENT').length,
  });

  return Object.freeze({
    schemaVersion: ISSUER_QUALIFICATION_SCHEMA_VERSION,
    mappingVersion: ISSUER_QUALIFICATION_MAPPING_VERSION,
    policyVersion: ISSUER_QUALIFICATION_POLICY_VERSION,
    mappingDigest: mappingDigest(allProfiles),
    issuerId,
    legalName: issuer.legalName,
    sector: issuer.sector,
    asOf,
    datasetVersion: request.datasetVersion ?? null,
    periodEnd: chosen?.periodEnd ?? null,
    statementScope: chosen?.statementScope ?? null,
    engines: Object.freeze(engines),
    summary,
    limitations: Object.freeze(drawLimitations(profiles, policy)),
    note:
      'Readiness only: this report states whether each certified engine’s declared inputs are resolvable from governed IID evidence at the evaluated period. It publishes no score, verdict or recommendation, and it does not execute any engine.',
  });
}
