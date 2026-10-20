/** Application Screen capture/replay clients. No evaluator, comparison or engine ReplayResult reinterpretation. */
import { noAuthFetch } from '../core/network/noAuthFetch';
import type { ExecutiveProvenance } from './executive';
import type { ScreenerDefinitionInput, ScreenerExecutionDto, ScreenerResponse, ScreenerScreenResult, ScreenerVintage } from './screener';

export const CAPTURE_SCHEMA = 'governed-screen-capture-1' as const;
export const CAPTURE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const REPLAY_STATES = ['NOT_PERFORMED', 'ORIGINAL_UNAVAILABLE', 'MISSING_CONTEXT', 'UNSUPPORTED_VERSION',
  'EXECUTION_FAILED', 'COMPARISON_FAILED', 'COMPLETED_DIFFERENT', 'COMPLETED_EQUIVALENT', 'ORIGINAL_INVALID'] as const;
export type ReplayState = typeof REPLAY_STATES[number];
export interface CapturedMemberInput {
  readonly sector: string; readonly referenceId: string; readonly conviction: string; readonly quality: string;
  readonly growthAvailability: 'AVAILABLE' | 'UNAVAILABLE'; readonly growth?: string;
  readonly engineId: string; readonly engineVersion: string; readonly calibrationVersion: string;
  readonly snapshotId: string; readonly evidenceId: string;
}
export interface CapturedMemberProvenance {
  readonly sector: string; readonly companyId: string; readonly referenceId: string;
  readonly compositeIdentity: { readonly sector: string; readonly referenceId: string };
  readonly engineId: string; readonly engineVersion: string; readonly calibrationVersion: string;
  readonly snapshotId: string; readonly evidenceId: string; readonly timestamp: string; readonly requestId?: string;
}
export type CaptureExecution = ScreenerExecutionDto & { readonly timestamp?: string; readonly requestId?: string };
export interface ScreenCapture {
  readonly schemaVersion: typeof CAPTURE_SCHEMA; readonly snapshotId: string;
  readonly definition: ScreenerDefinitionInput & { readonly populationIdentity: string };
  readonly memberInputs: readonly CapturedMemberInput[];
  readonly memberProvenance: readonly CapturedMemberProvenance[];
  readonly execution: CaptureExecution; readonly result: ScreenerScreenResult; readonly vintage: ScreenerVintage;
}
export interface ReplayOutcome {
  readonly state: ReplayState; readonly code?: string; readonly diagnostic?: string;
  readonly attemptId?: string; readonly comparisonScope?: 'NP12RES-v01';
  readonly execution?: CaptureExecution; readonly result?: ScreenerScreenResult;
}
export interface ReplayData {
  readonly original: null; readonly replay: ReplayOutcome;
  readonly differenceAvailable: false; readonly note: string; readonly evidenceRefs: readonly string[];
  readonly provenance: ExecutiveProvenance;
}
export interface CaptureInspection { readonly original?: ScreenCapture; readonly snapshotId?: string; readonly replay: ReplayOutcome }
export interface CaptureAcknowledgement { readonly captureState: 'RETAINED'; readonly evaluationState: 'COMPLETED'; readonly original: ScreenCapture }
export interface CaptureFailure {
  readonly captureState: 'NOT_RETAINED'; readonly evaluationState: 'NOT_STARTED' | 'FAILED' | 'COMPLETED';
  readonly phase: 'REQUEST' | 'PRODUCTION' | 'CAPTURE' | 'EXECUTION'; readonly code: string; readonly diagnostic: string;
  readonly evaluation?: ScreenerResponse;
}
export class ReplayApiError extends Error {
  constructor(readonly status: number, message: string, readonly failure?: CaptureFailure) { super(message); this.name = 'ReplayApiError'; }
}
const isRecord = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const string = (v: unknown): v is string => typeof v === 'string';
const strings = (v: Record<string, unknown>, keys: readonly string[]) => keys.every(k => string(v[k]));
const hex = (v: unknown) => string(v) && /^[0-9a-f]{64}$/.test(v);
function malformed(): never { throw new ReplayApiError(0, 'Unexpected capture/replay response; no trustworthy outcome was established.'); }
function execution(v: unknown): v is CaptureExecution {
  return isRecord(v) && strings(v, ['executionId', 'definitionId', 'version', 'definitionDigest', 'populationIdentity', 'evaluatorId', 'evaluatorVersion', 'executionSemanticsVersion'])
    && hex(v.executionId) && hex(v.definitionDigest) && hex(v.populationIdentity)
    && v.evaluatorId === 'NP12-SCREEN-EVALUATOR' && v.evaluatorVersion === '01' && v.executionSemanticsVersion === '01'
    && (!('timestamp' in v) || string(v.timestamp)) && (!('requestId' in v) || string(v.requestId))
    && v.memberCount === 13 && Array.isArray(v.members) && v.members.length === 13 && v.members.every(m => isRecord(m)
      && strings(m, ['sector', 'referenceId', 'inputHash', 'convictionText', 'qualityText', 'growthAvailability', 'engineId', 'engineVersion', 'calibrationVersion', 'snapshotId', 'evidenceId', 'status', 'errorCode'])
      && hex(m.inputHash) && ['AVAILABLE', 'UNAVAILABLE'].includes(String(m.growthAvailability)) && ['VALID', 'INVALID_MEMBER'].includes(String(m.status))
      && (!('growthText' in m) || string(m.growthText)));
}
const errors = ['MEMBER_VALUE_MISSING', 'MEMBER_VALUE_NON_NUMERIC', 'MEMBER_VALUE_OVER_PRECISION', 'MEMBER_VALUE_OUT_OF_RANGE', 'MEMBER_VALUE_NON_FINITE', 'MEMBER_GROWTH_INVALID'];
function result(v: unknown, e: CaptureExecution): v is ScreenerScreenResult {
  return isRecord(v) && hex(v.resultId) && v.executionId === e.executionId && v.executionStatus === 'COMPLETED'
    && v.totalPopulationCount === 13 && v.memberResultCount === 13 && Array.isArray(v.members) && v.members.length === 13
    && v.members.every((m, i) => isRecord(m) && m.sector === e.members[i].sector && m.referenceId === e.members[i].referenceId
      && ['MATCH', 'NO_MATCH', 'INVALID_MEMBER'].includes(String(m.memberResultStatus))
      && (m.memberResultStatus === 'INVALID_MEMBER' ? errors.includes(String(m.memberErrorCode)) : m.memberErrorCode === ''))
    && v.matchedCount === v.members.filter(m => isRecord(m) && m.memberResultStatus === 'MATCH').length;
}
function vintage(v: unknown): v is ScreenerVintage {
  return isRecord(v) && strings(v, ['asOf', 'dataVersion', 'dataSource']) && v.mode === 'SNAPSHOT' && v.memberCount === 13;
}
export function decodeScreenCapture(v: unknown, expectedId?: string): ScreenCapture {
  if (!isRecord(v) || v.schemaVersion !== CAPTURE_SCHEMA || !string(v.snapshotId) || !CAPTURE_UUID.test(v.snapshotId)
    || (expectedId !== undefined && v.snapshotId !== expectedId) || !isRecord(v.definition)
    || !strings(v.definition, ['definitionId', 'version', 'populationIdentity']) || !Array.isArray(v.definition.predicates)
    || v.definition.predicates.length > 64 || !v.definition.predicates.every(p => isRecord(p) && strings(p, ['field', 'operator', 'operand'])
      && ['conviction', 'quality', 'growth'].includes(String(p.field)) && ['lt', 'lte', 'gt', 'gte', 'eq'].includes(String(p.operator)))
    || !execution(v.execution) || !result(v.result, v.execution) || !vintage(v.vintage)
    || v.definition.definitionId !== v.execution.definitionId || v.definition.version !== v.execution.version
    || v.definition.populationIdentity !== v.execution.populationIdentity || !Array.isArray(v.memberInputs) || v.memberInputs.length !== 13
    || !Array.isArray(v.memberProvenance) || v.memberProvenance.length !== 13) return malformed();
  const inputs = v.memberInputs;
  if (!inputs.every(m => isRecord(m) && strings(m, ['sector', 'referenceId', 'conviction', 'quality', 'growthAvailability', 'engineId', 'engineVersion', 'calibrationVersion', 'snapshotId', 'evidenceId'])
    && ['AVAILABLE', 'UNAVAILABLE'].includes(String(m.growthAvailability)) && (!('growth' in m) || string(m.growth)))) return malformed();
  if (!v.memberProvenance.every((p, i) => isRecord(p) && strings(p, ['sector', 'companyId', 'referenceId', 'engineId', 'engineVersion', 'calibrationVersion', 'snapshotId', 'evidenceId', 'timestamp'])
    && isRecord(p.compositeIdentity) && p.companyId === inputs[i].referenceId && p.compositeIdentity.sector === inputs[i].sector
    && p.compositeIdentity.referenceId === inputs[i].referenceId && (!('requestId' in p) || string(p.requestId))
    && ['sector', 'referenceId', 'engineId', 'engineVersion', 'calibrationVersion', 'snapshotId', 'evidenceId'].every(k => p[k] === inputs[i][k]))) return malformed();
  return v as unknown as ScreenCapture;
}
export function decodeReplayOutcome(v: unknown): ReplayOutcome {
  if (!isRecord(v) || !REPLAY_STATES.includes(v.state as ReplayState) || 'reproduced' in v || 'byteIdentical' in v
    || ('code' in v && !string(v.code)) || ('diagnostic' in v && !string(v.diagnostic))) return malformed();
  const completed = v.state === 'COMPLETED_EQUIVALENT' || v.state === 'COMPLETED_DIFFERENT';
  const attempted = completed || v.state === 'EXECUTION_FAILED' || v.state === 'COMPARISON_FAILED';
  if (attempted && (!string(v.attemptId) || !CAPTURE_UUID.test(v.attemptId))) return malformed();
  if (completed && (v.comparisonScope !== 'NP12RES-v01' || !execution(v.execution) || !result(v.result, v.execution))) return malformed();
  if (!completed && ('execution' in v || 'result' in v || 'comparisonScope' in v)) return malformed();
  if (!attempted && 'attemptId' in v) return malformed();
  return v as unknown as ReplayOutcome;
}
export async function fetchReplayData(sector: string, baseUrl = ''): Promise<ReplayData> {
  const res = await noAuthFetch(`${baseUrl}/api/replay/${encodeURIComponent(sector)}`);
  if (!res.ok) throw new ReplayApiError(res.status, `replay transport returned ${res.status}`);
  const v: unknown = await res.json();
  if (!isRecord(v) || v.original !== null || v.differenceAvailable !== false || !string(v.note)
    || !Array.isArray(v.evidenceRefs) || v.evidenceRefs.length !== 0 || !isRecord(v.provenance)) return malformed();
  if (decodeReplayOutcome(v.replay).state !== 'NOT_PERFORMED') return malformed();
  return v as unknown as ReplayData;
}
const BASE = '/api/replay/evaluations';
export async function captureScreen(definition: ScreenerDefinitionInput, baseUrl = ''): Promise<CaptureAcknowledgement> {
  const res = await noAuthFetch(`${baseUrl}${BASE}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ definition }) });
  const v: unknown = await res.json();
  if (res.status === 201 && isRecord(v) && v.captureState === 'RETAINED' && v.evaluationState === 'COMPLETED') {
    return { captureState: 'RETAINED', evaluationState: 'COMPLETED', original: decodeScreenCapture(v.original) };
  }
  if (!res.ok && isRecord(v) && v.captureState === 'NOT_RETAINED' && ['NOT_STARTED', 'FAILED', 'COMPLETED'].includes(String(v.evaluationState))
    && ['REQUEST', 'PRODUCTION', 'CAPTURE', 'EXECUTION'].includes(String(v.phase)) && strings(v, ['code', 'diagnostic'])) {
    if ('original' in v || (v.evaluationState === 'COMPLETED' && v.phase !== 'CAPTURE')) return malformed();
    if ('evaluation' in v && (v.evaluationState !== 'COMPLETED' || !isRecord(v.evaluation) || !execution(v.evaluation.execution)
      || !result(v.evaluation.result, v.evaluation.execution) || !vintage(v.evaluation.vintage))) return malformed();
    throw new ReplayApiError(res.status, String(v.diagnostic), v as unknown as CaptureFailure);
  }
  return malformed();
}
async function evaluationRequest(id: string, replay: boolean, baseUrl: string): Promise<CaptureInspection> {
  if (!CAPTURE_UUID.test(id)) return malformed();
  const res = await noAuthFetch(`${baseUrl}${BASE}/${encodeURIComponent(id)}${replay ? '/replay' : ''}`, { method: replay ? 'POST' : 'GET' });
  const v: unknown = await res.json();
  if (!isRecord(v)) return malformed();
  const outcome = decodeReplayOutcome(v.replay);
  const expectedStatus: Record<ReplayState, number[]> = {
    NOT_PERFORMED: [200, 400, 404, 405, 500, 503], ORIGINAL_UNAVAILABLE: [404], MISSING_CONTEXT: [422], UNSUPPORTED_VERSION: [422],
    ORIGINAL_INVALID: [422], EXECUTION_FAILED: [500], COMPARISON_FAILED: [500], COMPLETED_DIFFERENT: [200], COMPLETED_EQUIVALENT: [200],
  };
  if (!expectedStatus[outcome.state].includes(res.status) || (!replay && (outcome.state.startsWith('COMPLETED_') || outcome.attemptId))) return malformed();
  if ('snapshotId' in v && v.snapshotId !== id) return malformed();
  const original = 'original' in v ? decodeScreenCapture(v.original, id) : undefined;
  if (!replay && res.status === 200 && !original) return malformed();
  return { ...(original ? { original } : {}), ...(string(v.snapshotId) ? { snapshotId: v.snapshotId } : {}), replay: outcome };
}
export const fetchScreenCapture = (id: string, baseUrl = ''): Promise<CaptureInspection> => evaluationRequest(id, false, baseUrl);
export const replayScreenCapture = (id: string, baseUrl = ''): Promise<CaptureInspection> => evaluationRequest(id, true, baseUrl);
