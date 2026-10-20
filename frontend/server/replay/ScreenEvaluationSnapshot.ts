/** Stage A application capture. NOT engine snapshot-1.0; process-local, not an evidence archive. */
import { randomUUID } from 'node:crypto';
import { ScreenDefinition, type ScreenDefinitionInput } from '../../../iips-platform/src/sector-engines/cross-sector/definition/ScreenDefinition';
import { admitMember, CANONICAL_SCREEN_SECTORS, type ScreenMemberInput } from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenMemberInput';
import type { ScreenProducerProvenance } from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenProducerAdapter';
import type { ScreenExecution, BoundMember } from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenExecution';
import type { ScreenResult } from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenResult';
import { compareMembers, populationIdentity, type CanonicalSector } from '../../../iips-platform/src/sector-engines/cross-sector/population/ScreeningPopulation';
import { memberInputHash, executionIdFrom, resultPreimage, resultIdFrom } from '../../../iips-platform/src/sector-engines/cross-sector/screen/CanonicalFormats';
import { EVALUATOR_ID, EVALUATOR_VERSION, EXECUTION_SEMANTICS_VERSION } from '../../../iips-platform/src/sector-engines/cross-sector/screen/ScreenEvaluator';

const hasOwn = (value: object, key: PropertyKey): boolean => Object.prototype.hasOwnProperty.call(value, key);

export const CAPTURE_SCHEMA = 'governed-screen-capture-1' as const;
export const CAPTURE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const LIMITS = Object.freeze({
  maxRecords: 100, maxEstimatedBytes: 33_554_432, maxCaptureBytes: 65_536,
  members: 13, bodyBytes: 16_384, predicates: 64, textBytes: 1_024,
  provenanceBytes: 16_384, entries: 4_096, depth: 8,
  bodyDeadlineMs: 5_000, responseDeadlineMs: 10_000, responseBytes: 131_072,
});
export const chargedBytes = (size: number): number => 8 * size + 4_096;
export const compactBytes = (value: unknown): number => Buffer.byteLength(JSON.stringify(value), 'utf8');
export type ReplayState = 'NOT_PERFORMED' | 'ORIGINAL_UNAVAILABLE' | 'MISSING_CONTEXT' | 'UNSUPPORTED_VERSION'
  | 'EXECUTION_FAILED' | 'COMPARISON_FAILED' | 'COMPLETED_DIFFERENT' | 'COMPLETED_EQUIVALENT' | 'ORIGINAL_INVALID';
export interface ScreenVintage {
  readonly asOf: string; readonly dataVersion: string; readonly mode: 'SNAPSHOT';
  readonly dataSource: string; readonly memberCount: number;
}
export interface ExecutionMember {
  readonly sector: string; readonly referenceId: string; readonly inputHash: string;
  readonly convictionText: string; readonly qualityText: string; readonly growthAvailability: string;
  readonly growthText?: string; readonly engineId: string; readonly engineVersion: string;
  readonly calibrationVersion: string; readonly snapshotId: string; readonly evidenceId: string;
  readonly status: string; readonly errorCode: string;
}
export interface ExecutionProjection {
  readonly executionId: string; readonly definitionId: string; readonly version: string;
  readonly definitionDigest: string; readonly populationIdentity: string; readonly evaluatorId: string;
  readonly evaluatorVersion: string; readonly executionSemanticsVersion: string;
  readonly members: readonly ExecutionMember[]; readonly memberCount: number;
  readonly timestamp?: string; readonly requestId?: string;
}
export interface PreparedScreen {
  readonly definition: ScreenDefinition;
  readonly memberInputs: readonly ScreenMemberInput[];
  readonly memberProvenance: readonly ScreenProducerProvenance[];
  readonly vintage: ScreenVintage;
  readonly timestamp?: string; readonly requestId?: string;
}
export interface OriginalScreenReceipt extends PreparedScreen {
  readonly execution: ScreenExecution; readonly result: ScreenResult;
}
export type OriginalRunner = (definition: unknown, beforeEvaluation?: (prepared: PreparedScreen) => void) => OriginalScreenReceipt;
export interface ScreenEvaluationSnapshot {
  readonly schemaVersion: typeof CAPTURE_SCHEMA;
  readonly snapshotId: string;
  readonly definition: ScreenDefinitionInput;
  readonly memberInputs: readonly ScreenMemberInput[];
  readonly memberProvenance: readonly ScreenProducerProvenance[];
  readonly execution: ExecutionProjection;
  readonly result: ScreenResult;
  readonly vintage: ScreenVintage;
}
export interface ReplayOutcome {
  readonly state: ReplayState; readonly code?: string; readonly diagnostic?: string;
  readonly attemptId?: string; readonly comparisonScope?: 'NP12RES-v01';
  readonly execution?: ExecutionProjection; readonly result?: ScreenResult;
}
export class CapturePolicyError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message); this.name = 'CapturePolicyError'; }
}
export class OriginalContractError extends Error {
  constructor(readonly state: 'MISSING_CONTEXT' | 'UNSUPPORTED_VERSION' | 'ORIGINAL_INVALID', readonly code: string, message: string) {
    super(message); this.name = 'OriginalContractError';
  }
}
export function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function invalid(message = 'Original bindings or canonical identities are inconsistent.'): never {
  throw new OriginalContractError('ORIGINAL_INVALID', 'ORIGINAL_INVALID', message);
}
function requireKeys(value: unknown, required: readonly string[], optional: readonly string[] = []): asserts value is Record<string, unknown> {
  if (!record(value) || required.some(key => !hasOwn(value, key))) {
    throw new OriginalContractError('MISSING_CONTEXT', 'MISSING_CONTEXT', 'Required original context is missing.');
  }
  if (Object.keys(value).some(key => !required.includes(key) && !optional.includes(key))) invalid('Unexpected original context fields.');
}
function text(value: unknown): value is string { return typeof value === 'string' && value.length > 0; }
function same(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => same(v, b[i]));
  if (record(a) && record(b)) return Object.keys(a).length === Object.keys(b).length
    && Object.keys(a).every(k => hasOwn(b, k) && same(a[k], b[k]));
  return false;
}

/** Copy BEFORE freezing, including children of already-frozen parents. No lossy JSON round-trip. */
export function detachedFrozen<T>(input: T): T {
  let entries = 0;
  const ancestors = new Set<object>();
  function copy(value: unknown, depth: number): unknown {
    if (depth > LIMITS.depth) throw new CapturePolicyError(422, 'CAPTURE_STRUCTURE_LIMIT', 'Capture nesting exceeds its limit.');
    if (typeof value === 'string') {
      if (Buffer.byteLength(value, 'utf8') > LIMITS.textBytes) throw new CapturePolicyError(422, 'CAPTURE_TEXT_LIMIT', 'Capture text exceeds its limit; no value was truncated.');
      return value;
    }
    if (value === null || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return value;
    if (typeof value !== 'object') throw new CapturePolicyError(422, 'CAPTURE_NOT_LOSSLESS', 'Capture contains a non-JSON value.');
    if (ancestors.has(value)) throw new CapturePolicyError(422, 'CAPTURE_NOT_LOSSLESS', 'Capture contains a cycle.');
    if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
      throw new CapturePolicyError(422, 'CAPTURE_NOT_LOSSLESS', 'Capture must contain plain data only.');
    }
    if (Object.getOwnPropertySymbols(value).length) throw new CapturePolicyError(422, 'CAPTURE_NOT_LOSSLESS', 'Capture contains symbol properties.');
    const keys = Object.keys(value);
    if (Object.getOwnPropertyNames(value).some(key => !(Array.isArray(value) && key === 'length')
      && !Object.prototype.propertyIsEnumerable.call(value, key))) {
      throw new CapturePolicyError(422, 'CAPTURE_NOT_LOSSLESS', 'Capture contains non-enumerable data.');
    }
    entries += keys.length;
    if (entries > LIMITS.entries) throw new CapturePolicyError(422, 'CAPTURE_STRUCTURE_LIMIT', 'Capture has too many entries.');
    if (Array.isArray(value) && (keys.length !== value.length || keys.some((k, i) => k !== String(i)))) {
      throw new CapturePolicyError(422, 'CAPTURE_NOT_LOSSLESS', 'Capture contains a sparse or extended array.');
    }
    ancestors.add(value);
    const out: unknown[] | Record<string, unknown> = Array.isArray(value) ? [] : {};
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !('value' in descriptor)) throw new CapturePolicyError(422, 'CAPTURE_NOT_LOSSLESS', 'Capture contains an accessor.');
      Object.defineProperty(out, key, { value: copy(descriptor.value, depth + 1), enumerable: true, configurable: true, writable: true });
    }
    ancestors.delete(value);
    return Object.freeze(out);
  }
  return copy(input, 0) as T;
}
export function projectMember(m: BoundMember): ExecutionMember {
  return {
    sector: m.sector, referenceId: m.referenceId, inputHash: m.inputHash,
    convictionText: m.convictionText, qualityText: m.qualityText, growthAvailability: m.growthAvailability,
    ...(m.growthText !== undefined ? { growthText: m.growthText } : {}),
    engineId: m.engineId, engineVersion: m.engineVersion, calibrationVersion: m.calibrationVersion,
    snapshotId: m.snapshotId, evidenceId: m.evidenceId, status: m.status, errorCode: m.errorCode,
  };
}
/** Property order intentionally matches the established ordinary Screener response. */
export function projectExecution(e: ScreenExecution): ExecutionProjection {
  return {
    executionId: e.executionId, definitionId: e.definitionId, version: e.version,
    definitionDigest: e.definitionDigest, populationIdentity: e.populationIdentity,
    evaluatorId: e.evaluatorId, evaluatorVersion: e.evaluatorVersion, executionSemanticsVersion: e.executionSemanticsVersion,
    members: e.members.map(projectMember), memberCount: e.memberCount,
    ...(hasOwn(e, 'timestamp') ? { timestamp: e.timestamp } : {}),
    ...(hasOwn(e, 'requestId') ? { requestId: e.requestId } : {}),
  };
}
export function definitionData(d: ScreenDefinition): ScreenDefinitionInput {
  return { definitionId: d.definitionId, version: d.version, populationIdentity: d.populationIdentity, predicates: d.predicates };
}

/** Integrity derivation only. This does not call the evaluator or construct a replay result. */
export function deriveExecution(definitionInput: ScreenDefinitionInput, inputs: readonly ScreenMemberInput[], audit: { timestamp?: string; requestId?: string }): {
  definition: ScreenDefinition; execution: ScreenExecution;
} {
  if (inputs.length !== LIMITS.members || new Set(inputs.map(m => m.sector)).size !== LIMITS.members
    || inputs.some(m => !CANONICAL_SCREEN_SECTORS.includes(m.sector))) invalid('The complete original governed population is required.');
  const admitted = inputs.map(input => {
    const admission = admitMember(input);
    if (admission.structural || !admission.member) return invalid('Original input admission failed.');
    return admission.member;
  }).sort((a, b) => compareMembers({ sector: a.sector as CanonicalSector, referenceId: a.referenceId },
    { sector: b.sector as CanonicalSector, referenceId: b.referenceId }));
  const identity = populationIdentity(admitted.map(m => ({ sector: m.sector as Parameters<typeof populationIdentity>[0][number]['sector'], referenceId: m.referenceId })));
  const definition = ScreenDefinition.create(definitionInput, { identity });
  if (!same(definitionData(definition), definitionInput)) invalid('Saved definition is not the original canonical definition.');
  const members: BoundMember[] = admitted.map(m => ({ ...m, inputHash: memberInputHash(m, identity) }));
  const fields = {
    definitionId: definition.definitionId, version: definition.version, definitionDigest: definition.sha256(),
    populationIdentity: identity, evaluatorId: EVALUATOR_ID, evaluatorVersion: EVALUATOR_VERSION,
    executionSemanticsVersion: EXECUTION_SEMANTICS_VERSION,
  };
  return { definition, execution: {
    executionId: executionIdFrom(fields, members), ...fields, members, memberCount: members.length,
    ...(hasOwn(audit, 'timestamp') ? { timestamp: audit.timestamp } : {}),
    ...(hasOwn(audit, 'requestId') ? { requestId: audit.requestId } : {}),
  } };
}
const memberText = ['sector', 'referenceId', 'conviction', 'quality', 'growthAvailability', 'engineId', 'engineVersion', 'calibrationVersion', 'snapshotId', 'evidenceId'];
const provenanceText = ['sector', 'companyId', 'referenceId', 'engineId', 'engineVersion', 'calibrationVersion', 'snapshotId', 'evidenceId', 'timestamp'];
const executionKeys = ['executionId', 'definitionId', 'version', 'definitionDigest', 'populationIdentity', 'evaluatorId', 'evaluatorVersion', 'executionSemanticsVersion', 'members', 'memberCount'];
const memberErrors = ['MEMBER_VALUE_MISSING', 'MEMBER_VALUE_NON_NUMERIC', 'MEMBER_VALUE_OVER_PRECISION', 'MEMBER_VALUE_OUT_OF_RANGE', 'MEMBER_VALUE_NON_FINITE', 'MEMBER_GROWTH_INVALID'];

export function validateResult(value: unknown, execution: ExecutionProjection): asserts value is ScreenResult {
  requireKeys(value, ['resultId', 'executionId', 'executionStatus', 'totalPopulationCount', 'matchedCount', 'memberResultCount', 'members']);
  if (value.executionStatus !== 'COMPLETED' || value.executionId !== execution.executionId
    || value.totalPopulationCount !== execution.memberCount || value.memberResultCount !== execution.memberCount
    || !Number.isInteger(value.matchedCount) || !Array.isArray(value.members) || value.members.length !== execution.memberCount) invalid('Screen result structure or counts are invalid.');
  let matched = 0;
  value.members.forEach((m: unknown, index: number) => {
    requireKeys(m, ['sector', 'referenceId', 'memberResultStatus', 'memberErrorCode']);
    const bound = execution.members[index];
    if (m.sector !== bound.sector || m.referenceId !== bound.referenceId) invalid('Screen result member coverage/order is invalid.');
    if (!['MATCH', 'NO_MATCH', 'INVALID_MEMBER'].includes(String(m.memberResultStatus))) invalid('Unknown Screen member status.');
    if (m.memberResultStatus === 'INVALID_MEMBER') {
      if (!memberErrors.includes(String(m.memberErrorCode)) || bound.status !== 'INVALID_MEMBER' || m.memberErrorCode !== bound.errorCode) invalid('Invalid Screen member error binding.');
    } else if (m.memberErrorCode !== '' || bound.status !== 'VALID') invalid('Invalid Screen member status/error combination.');
    if (m.memberResultStatus === 'MATCH') matched++;
  });
  if (matched !== value.matchedCount) invalid('Screen match count is inconsistent.');
  const result = value as unknown as ScreenResult;
  if (resultIdFrom(result, result.members) !== result.resultId) invalid('Screen result identity is inconsistent.');
}
export function canonicalResultBytes(result: ScreenResult): Buffer { return resultPreimage(result, result.members); }

/** Original-context admission, shared by preflight and inspection; it does not evaluate any result. */
function validateCaptureContext(value: { definition: unknown; memberInputs: unknown; memberProvenance: unknown; vintage: unknown }): void {
  requireKeys(value.definition, ['definitionId', 'version', 'populationIdentity', 'predicates']);
  if (!Array.isArray(value.definition.predicates) || value.definition.predicates.length > LIMITS.predicates) invalid('Original predicate collection is invalid.');
  for (const p of value.definition.predicates) requireKeys(p, ['field', 'operator', 'operand']);
  if (!Array.isArray(value.memberInputs) || !Array.isArray(value.memberProvenance)
    || value.memberInputs.length !== LIMITS.members || value.memberProvenance.length !== LIMITS.members) {
    throw new OriginalContractError('MISSING_CONTEXT', 'MISSING_MEMBERS', 'The complete original inputs and member provenance are required.');
  }
  for (let i = 0; i < value.memberInputs.length; i++) {
    const input: unknown = value.memberInputs[i];
    const p: unknown = value.memberProvenance[i];
    requireKeys(input, memberText, ['growth']);
    if (memberText.some(k => typeof input[k] !== 'string' || (!['conviction', 'quality'].includes(k) && input[k] === '')) || (hasOwn(input, 'growth') && typeof input.growth !== 'string')) invalid('Original member input types are invalid.');
    requireKeys(p, [...provenanceText, 'compositeIdentity'], ['requestId']);
    requireKeys(p.compositeIdentity, ['sector', 'referenceId']);
    if (provenanceText.some(k => !text(p[k])) || (hasOwn(p, 'requestId') && !text(p.requestId))
      || p.companyId !== input.referenceId || p.compositeIdentity.sector !== input.sector || p.compositeIdentity.referenceId !== input.referenceId
      || ['sector', 'referenceId', 'engineId', 'engineVersion', 'calibrationVersion', 'snapshotId', 'evidenceId'].some(k => input[k] !== p[k])) invalid('Original member provenance does not bind its input.');
  }
  requireKeys(value.vintage, ['asOf', 'dataVersion', 'mode', 'dataSource', 'memberCount']);
  if (value.vintage.mode !== 'SNAPSHOT' || value.vintage.memberCount !== LIMITS.members
    || !text(value.vintage.asOf) || !text(value.vintage.dataVersion) || !text(value.vintage.dataSource)) invalid('Original vintage is invalid.');
}

/** Validate without evaluating expected results. Does not accept engine/direct snapshots. */
export function validateOriginal(value: unknown, expectedId?: string): ScreenEvaluationSnapshot {
  if (!record(value) || !hasOwn(value, 'schemaVersion')) {
    throw new OriginalContractError('MISSING_CONTEXT', 'MISSING_CONTEXT', 'Original record kind/version is missing.');
  }
  return validateOriginalFields(value, expectedId);
}
function validateOriginalFields(value: Record<string, unknown>, expectedId?: string): ScreenEvaluationSnapshot {
  if (value.schemaVersion !== CAPTURE_SCHEMA) throw new OriginalContractError('UNSUPPORTED_VERSION', 'UNSUPPORTED_RECORD_KIND', 'Only governed Screen capture format 1 is supported.');
  requireKeys(value, ['schemaVersion', 'snapshotId', 'definition', 'memberInputs', 'memberProvenance', 'execution', 'result', 'vintage']);
  if (!text(value.snapshotId) || !CAPTURE_UUID.test(value.snapshotId) || (expectedId !== undefined && value.snapshotId !== expectedId)) invalid('Capture occurrence identity is invalid.');
  requireKeys(value.execution, executionKeys, ['timestamp', 'requestId']);
  const e = value.execution;
  if (!text(e.evaluatorId) || !text(e.evaluatorVersion) || !text(e.executionSemanticsVersion)) {
    throw new OriginalContractError('MISSING_CONTEXT', 'MISSING_EVALUATOR', 'Original evaluator identity is missing.');
  }
  if (e.evaluatorId !== EVALUATOR_ID || e.evaluatorVersion !== EVALUATOR_VERSION || e.executionSemanticsVersion !== EXECUTION_SEMANTICS_VERSION) {
    throw new OriginalContractError('UNSUPPORTED_VERSION', 'UNSUPPORTED_EVALUATOR', 'The original evaluator/semantics tuple is not supported; no fallback was used.');
  }
  validateCaptureContext({ definition: value.definition, memberInputs: value.memberInputs, memberProvenance: value.memberProvenance, vintage: value.vintage });
  for (const k of ['timestamp', 'requestId']) if (hasOwn(e, k) && !text(e[k])) invalid('Original audit value is invalid.');
  // Validate finite bounded plain data before allocating canonical frames.
  const copy = detachedFrozen(value) as unknown as ScreenEvaluationSnapshot;
  if (compactBytes(copy) > LIMITS.maxCaptureBytes || compactBytes(copy.memberProvenance) > LIMITS.provenanceBytes) invalid('Original exceeds the supported capture bounds.');
  const derived = deriveExecution(copy.definition, copy.memberInputs, copy.execution);
  if (!same(projectExecution(derived.execution), copy.execution)) invalid();
  validateResult(copy.result, copy.execution);
  return copy;
}

export interface CaptureReservation {
  readonly snapshotId: string;
  commit(value: ScreenEvaluationSnapshot): ScreenEvaluationSnapshot;
  release(): void;
}
export interface StoreConfig { readonly maxRecords: number; readonly maxEstimatedBytes: number; readonly maxCaptureBytes: number }

/** Append/get only. No eviction, mutation, deletion, restart promises or attempt history. */
export class ScreenCaptureStore {
  readonly config: Readonly<StoreConfig>;
  private readonly originals = new Map<string, ScreenEvaluationSnapshot>();
  private readonly reservations = new Set<string>();
  private estimatedBytes = 0;
  constructor(config: Partial<{ [K in keyof StoreConfig]: number }> = {}, private readonly newId: () => string = randomUUID) {
    const merged = { maxRecords: LIMITS.maxRecords, maxEstimatedBytes: LIMITS.maxEstimatedBytes, maxCaptureBytes: LIMITS.maxCaptureBytes, ...config };
    for (const key of ['maxRecords', 'maxEstimatedBytes', 'maxCaptureBytes'] as const) {
      if (!Number.isSafeInteger(merged[key]) || merged[key] <= 0 || merged[key] > LIMITS[key]) throw new Error(`Invalid finite capture setting: ${key}`);
    }
    if (chargedBytes(merged.maxCaptureBytes) > merged.maxEstimatedBytes) throw new Error('Capture budget cannot reserve one maximum-size record.');
    this.config = Object.freeze(merged) as StoreConfig;
  }
  get(snapshotId: string): ScreenEvaluationSnapshot | undefined { return this.originals.get(snapshotId); }
  stats(): { count: number; estimatedBytes: number; reservations: number; reservedBytes: number } {
    return { count: this.originals.size, estimatedBytes: this.estimatedBytes, reservations: this.reservations.size,
      reservedBytes: this.reservations.size * chargedBytes(this.config.maxCaptureBytes) };
  }
  reserve(): CaptureReservation {
    const maxCharge = chargedBytes(this.config.maxCaptureBytes);
    if (this.originals.size + this.reservations.size >= this.config.maxRecords
      || this.estimatedBytes + (this.reservations.size + 1) * maxCharge > this.config.maxEstimatedBytes) {
      throw new CapturePolicyError(503, 'CAPTURE_CAPACITY_EXHAUSTED', 'Capture capacity is reserved or full in this process. The Screen was not evaluated; existing captures were not removed.');
    }
    let id = '';
    for (let i = 0; i < 3; i++) {
      const candidate = this.newId();
      if (CAPTURE_UUID.test(candidate) && !this.originals.has(candidate) && !this.reservations.has(candidate)) { id = candidate; break; }
    }
    if (!id) throw new CapturePolicyError(500, 'CAPTURE_ID_UNAVAILABLE', 'A unique capture occurrence ID could not be allocated.');
    this.reservations.add(id);
    return Object.freeze({
      snapshotId: id,
      release: () => { this.reservations.delete(id); },
      commit: (value: ScreenEvaluationSnapshot) => {
        if (!this.reservations.has(id) || this.originals.has(id)) throw new Error('Capture reservation is no longer valid.');
        const original = validateOriginal(value, id);
        const size = compactBytes(original);
        if (size > this.config.maxCaptureBytes) throw new CapturePolicyError(422, 'CAPTURE_TOO_LARGE', 'The complete capture exceeds its record limit.');
        // All throwing preparation precedes this synchronous append/accounting commit.
        this.originals.set(id, original);
        this.estimatedBytes += chargedBytes(size);
        this.reservations.delete(id);
        return original;
      },
    });
  }
}

export function assembleCapture(id: string, prepared: Omit<PreparedScreen, 'definition'> & { definition: ScreenDefinitionInput }, execution: ExecutionProjection, result: ScreenResult): ScreenEvaluationSnapshot {
  return {
    schemaVersion: CAPTURE_SCHEMA, snapshotId: id, definition: prepared.definition,
    memberInputs: prepared.memberInputs, memberProvenance: prepared.memberProvenance,
    execution, result, vintage: prepared.vintage,
  };
}

/** Worst-case result vocabulary/count widths for sizing ONLY; never evaluated, returned or stored. */
export function preflightCapture(id: string, prepared: PreparedScreen, maxBytes: number): Omit<PreparedScreen, 'definition'> & { definition: ScreenDefinitionInput } {
  const saved = detachedFrozen({
    definition: definitionData(prepared.definition), memberInputs: prepared.memberInputs,
    memberProvenance: prepared.memberProvenance, vintage: prepared.vintage,
    ...(hasOwn(prepared, 'timestamp') ? { timestamp: prepared.timestamp } : {}),
    ...(hasOwn(prepared, 'requestId') ? { requestId: prepared.requestId } : {}),
  });
  validateCaptureContext(saved);
  if (compactBytes(saved.memberProvenance) > LIMITS.provenanceBytes) throw new CapturePolicyError(422, 'CAPTURE_PROVENANCE_LIMIT', 'Original member provenance exceeds its limit; nothing was truncated.');
  const derived = projectExecution(deriveExecution(saved.definition, saved.memberInputs, saved).execution);
  const worst: ScreenResult = {
    resultId: '0'.repeat(64), executionId: derived.executionId, executionStatus: 'COMPLETED',
    totalPopulationCount: LIMITS.members, matchedCount: LIMITS.members, memberResultCount: LIMITS.members,
    members: derived.members.map(m => ({ sector: m.sector, referenceId: m.referenceId,
      memberResultStatus: 'INVALID_MEMBER', memberErrorCode: 'MEMBER_VALUE_OVER_PRECISION' })),
  };
  const upperBound = detachedFrozen(assembleCapture(id, saved, derived, worst));
  if (compactBytes(upperBound) > maxBytes) throw new CapturePolicyError(422, 'CAPTURE_TOO_LARGE', 'The complete original cannot fit the capture limit. Screen evaluation was not started.');
  return saved;
}
