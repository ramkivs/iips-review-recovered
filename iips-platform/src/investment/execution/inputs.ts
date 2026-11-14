/**
 * W11 — prepare a certified engine execution from W10 qualification.
 *
 * This file decides *whether* an engine may run and *with what inputs*, and publishes the lineage for both. It
 * executes nothing. The input set is exactly the fields W10 resolved for the engine — no more.
 *
 * Two rules are structural here, not advisory:
 *
 *   1. A field reaches the engine only if its qualification outcome is `RESOLVED`. A `MAPPED` label, a calibration
 *      band that happens to fit, or a same-named dataset column are not sufficient and are never consulted.
 *   2. The engine must be the one certified for the issuer's own sector family. An issuer is never executed against
 *      a second engine because its inputs "look close enough".
 */
import { createHash } from 'node:crypto';

import type { DatasetContent } from '../fundamentals/types';
import { TRACKED_ENGINE_PROFILES, canonicalJson, getEngineProfile, qualifyIssuerToEngines } from '../qualification';
import type { EngineQualification, FieldQualification, QualificationPolicy } from '../qualification/types';
import type {
  EngineExecutionPlan,
  EngineInputLine,
  ExecutionRefusal,
  ExecutionRefusalCode,
  OmittedInput,
} from './types';

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Digest over the exact dataset content this module reads — distinct from the manifest's governed digest. */
export function datasetContentDigest(content: DatasetContent): string {
  return `sha256:${sha256(canonicalJson(content))}`;
}

function refusal(
  code: ExecutionRefusalCode,
  detail: string,
  extra: Partial<Omit<ExecutionRefusal, 'code' | 'detail'>> = {},
): ExecutionRefusal {
  return Object.freeze({
    code,
    detail,
    issuerId: extra.issuerId ?? null,
    holdingIndex: extra.holdingIndex ?? null,
    engineId: extra.engineId ?? null,
    qualificationState: extra.qualificationState ?? null,
    fieldRefusals: Object.freeze([...(extra.fieldRefusals ?? [])]),
  });
}

export function refused(code: ExecutionRefusalCode, detail: string, extra: Partial<Omit<ExecutionRefusal, 'code' | 'detail'>> = {}): EngineExecutionPlan {
  return Object.freeze({ kind: 'REFUSED' as const, refusal: refusal(code, detail, extra) });
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/;

export function isValidIsoDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value));
}

function inputLine(field: FieldQualification): EngineInputLine {
  const evidence = field.evidence;
  return Object.freeze({
    field: field.field,
    requirement: field.requirement,
    mappingStatus: field.status,
    value: field.value as number | string | boolean,
    unit: field.unit,
    transformation: field.transformation,
    periodEnd: evidence?.periodEnd ?? null,
    statementScope: evidence?.statementScope ?? null,
    basis: evidence?.basis ?? null,
    presence: evidence?.presence ?? null,
    sourceRef: evidence?.source?.ref ?? null,
    filingRef: evidence?.filingRef ?? null,
    sourceClass: evidence?.sourceClass ?? null,
  });
}

function blockingFields(engine: EngineQualification): readonly { field: string; outcome: string; codes: readonly string[] }[] {
  return engine.fields
    .filter((field) => field.requirement === 'REQUIRED' && field.outcome !== 'RESOLVED')
    .map((field) => Object.freeze({ field: field.field, outcome: field.outcome, codes: field.codes }));
}

export interface PrepareInput {
  readonly content: DatasetContent;
  readonly issuerId: string;
  readonly asOf: string;
  /** Optional explicit engine; when omitted the engine certified for the issuer's sector is used. */
  readonly engineId?: string;
  readonly policy?: Partial<QualificationPolicy>;
  /** A digest the caller believes describes this dataset; a mismatch is refused. */
  readonly expectedDatasetDigest?: string | null;
}

/**
 * Decide whether `issuerId` may be executed against an engine, and with which inputs.
 *
 * Pure and clock-free: the caller supplies `asOf`. No engine runs here, so a refusal cannot carry a score.
 */
export function prepareEngineExecution(input: PrepareInput): EngineExecutionPlan {
  const { content, issuerId, asOf } = input;

  if (!isValidIsoDate(asOf)) {
    return refused('EVALUATION_CLOCK_INVALID', `asOf must be an ISO date/timestamp; received ${String(asOf)}`);
  }

  const contentDigest = datasetContentDigest(content);
  if (input.expectedDatasetDigest !== undefined && input.expectedDatasetDigest !== null && input.expectedDatasetDigest !== contentDigest) {
    return refused(
      'DATASET_DIGEST_MISMATCH',
      `The dataset content read hashes to ${contentDigest}, which is not the pinned digest ${input.expectedDatasetDigest}.`,
      { issuerId },
    );
  }

  const issuer = content.issuers.find((candidate) => candidate.issuerId === issuerId);
  if (issuer === undefined) {
    return refused('ISSUER_NOT_IN_DATASET', `Issuer '${issuerId}' is not present in the dataset roster; no financial evidence exists for it.`, { issuerId });
  }

  const profile = input.engineId === undefined ? getEngineProfileForSector(issuer.sector) : getEngineProfile(input.engineId);
  if (profile === undefined) {
    if (input.engineId === undefined) {
      return refused('NO_ENGINE_FOR_SECTOR', `No certified engine is registered for sector '${issuer.sector}'.`, { issuerId });
    }
    return refused('ENGINE_NOT_CERTIFIED', `'${input.engineId}' is not a certified engine id.`, { issuerId, engineId: input.engineId });
  }
  if (profile.sectorFamily !== issuer.sector) {
    return refused(
      'ENGINE_NOT_APPLICABLE',
      `${profile.engineId} is certified for ${profile.sectorFamily}; the issuer's sector is ${issuer.sector}. An engine is never run on another sector's inputs.`,
      { issuerId, engineId: profile.engineId },
    );
  }

  let engine: EngineQualification;
  let report: ReturnType<typeof qualifyIssuerToEngines>;
  try {
    report = qualifyIssuerToEngines({
      content,
      issuerId,
      asOf,
      engineIds: [profile.engineId],
      ...(input.policy === undefined ? {} : { policy: input.policy }),
    });
    const found = report.engines.find((candidate) => candidate.engineId === profile.engineId);
    if (found === undefined) {
      return refused('ENGINE_NOT_CERTIFIED', `${profile.engineId} was not evaluated by the qualification.`, { issuerId, engineId: profile.engineId });
    }
    engine = found;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return refused('QUALIFICATION_NOT_QUALIFIED', `The qualification refused to evaluate this issuer: ${message}`, {
      issuerId,
      engineId: profile.engineId,
    });
  }

  if (engine.state !== 'QUALIFIED') {
    return refused(
      'QUALIFICATION_NOT_QUALIFIED',
      `W10 qualification returned ${engine.state} for ${profile.engineId} at ${report.periodEnd ?? 'no evidenced period'}: ${engine.codes.join(', ') || 'no engine code'}.`,
      {
        issuerId,
        engineId: profile.engineId,
        qualificationState: engine.state,
        fieldRefusals: blockingFields(engine),
      },
    );
  }

  const requiredUnresolved = blockingFields(engine);
  if (requiredUnresolved.length > 0) {
    return refused(
      'ENGINE_INPUT_UNAUTHORIZED',
      `${profile.engineId} reported QUALIFIED with ${requiredUnresolved.length} unresolved required input(s); the execution path refuses the contradiction.`,
      { issuerId, engineId: profile.engineId, qualificationState: engine.state, fieldRefusals: requiredUnresolved },
    );
  }

  const resolved = engine.fields.filter((field) => field.outcome === 'RESOLVED');
  const inputs: Record<string, number | string | boolean> = {};
  const inputLineage: EngineInputLine[] = [];
  for (const field of resolved) {
    if (field.requirement === 'DECLARED_UNUSED') continue;
    const value = field.value;
    if (typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'boolean') {
      return refused(
        'ENGINE_INPUT_UNAUTHORIZED',
        `${field.field} resolved to ${String(value)}; only a finite number, string or boolean may reach an engine.`,
        { issuerId, engineId: profile.engineId, qualificationState: engine.state },
      );
    }
    inputs[field.field] = value;
    inputLineage.push(inputLine(field));
  }

  const omittedInputs: OmittedInput[] = engine.fields
    .filter((field) => field.outcome !== 'RESOLVED')
    .map((field) =>
      Object.freeze({
        field: field.field,
        requirement: field.requirement,
        mappingStatus: field.status,
        outcome: field.outcome,
        codes: field.codes,
      }),
    );

  const inputDigest = `sha256:${sha256(
    canonicalJson({
      engineId: profile.engineId,
      engineVersion: profile.engineVersion,
      calibrationVersion: profile.calibrationVersion,
      periodEnd: report.periodEnd,
      statementScope: report.statementScope,
      inputs,
    }),
  )}`;

  return Object.freeze({
    kind: 'PREPARED' as const,
    engineId: profile.engineId,
    ies: profile.ies,
    sectorFamily: profile.sectorFamily,
    engineVersion: profile.engineVersion,
    calibrationVersion: profile.calibrationVersion,
    periodEnd: report.periodEnd,
    statementScope: report.statementScope,
    mappingDigest: report.mappingDigest,
    mappingVersion: report.mappingVersion,
    policyVersion: report.policyVersion,
    qualificationDigest: `sha256:${sha256(canonicalJson(report))}`,
    qualificationState: engine.state,
    inputDigest,
    requestId: `w11-${inputDigest.slice('sha256:'.length, 'sha256:'.length + 24)}`,
    inputs: Object.freeze(inputs),
    inputLineage: Object.freeze(inputLineage),
    omittedInputs: Object.freeze(omittedInputs),
  });
}

function getEngineProfileForSector(sector: string) {
  // A sector maps to exactly one certified engine; an unknown sector resolves to nothing rather than to a guess.
  return TRACKED_ENGINE_PROFILES.find((profile) => profile.sectorFamily === sector);
}
