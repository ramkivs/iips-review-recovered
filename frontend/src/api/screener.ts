/**
 * Governed Screener application composition — typed API client for `POST /api/screener`.
 *
 * Mirrors the server transport response 1:1. Semantically inert: maps governed fields
 * only — never computes scores, thresholds, or verdicts, and never supplies population
 * membership (the screened population is derived server-side; a client `members` field
 * is rejected fail-closed with 422).
 *
 * Certified contract (frozen):
 *   definition = { definitionId, version, populationIdentity?, predicates[] }
 *   predicate  = { field: conviction|quality|growth, operator: lt|lte|gt|gte|eq,
 *                  operand: decimal text 0–100, ≤6dp } — flat AND only.
 * Criteria and operators follow NP-12-SCREENING-CRITERIA-OPERATOR-BOOLEAN-GOVERNANCE.md;
 * `verdict`, `sector`, `companyId` etc. are explicitly non-screenable and are not offered.
 */

export type ScreeningField = 'conviction' | 'quality' | 'growth';
export type ScreeningOperator = 'lt' | 'lte' | 'gt' | 'gte' | 'eq';

export interface ScreeningPredicate {
  readonly field: ScreeningField;
  readonly operator: ScreeningOperator;
  readonly operand: string;
}

export interface ScreenerDefinitionInput {
  readonly definitionId: string;
  readonly version: string;
  /** Optional echo only: the server binds its own verified identity and rejects (422) any mismatch. */
  readonly populationIdentity?: string;
  readonly predicates: readonly ScreeningPredicate[];
}

export interface ScreenerRequest {
  readonly definition: ScreenerDefinitionInput;
}

export type MemberResultStatus = 'MATCH' | 'NO_MATCH' | 'INVALID_MEMBER';

export interface ScreenerMemberResult {
  readonly sector: string;
  readonly referenceId: string;
  readonly memberResultStatus: MemberResultStatus;
  readonly memberErrorCode: string;
}

export interface ScreenerScreenResult {
  readonly resultId: string;
  readonly executionId: string;
  readonly executionStatus: 'COMPLETED';
  readonly totalPopulationCount: number;
  readonly matchedCount: number;
  readonly memberResultCount: number;
  readonly members: readonly ScreenerMemberResult[];
}

export interface ScreenerExecutionMember {
  readonly sector: string;
  readonly referenceId: string;
  readonly inputHash: string;
  readonly convictionText: string;
  readonly qualityText: string;
  readonly growthAvailability: string;
  readonly growthText?: string;
  readonly engineId: string;
  readonly engineVersion: string;
  readonly calibrationVersion: string;
  readonly snapshotId: string;
  readonly evidenceId: string;
  readonly status: string;
  readonly errorCode: string;
}

export interface ScreenerExecutionDto {
  readonly executionId: string;
  readonly definitionId: string;
  readonly version: string;
  readonly definitionDigest: string;
  readonly populationIdentity: string;
  readonly evaluatorId: string;
  readonly evaluatorVersion: string;
  readonly executionSemanticsVersion: string;
  readonly members: readonly ScreenerExecutionMember[];
  readonly memberCount: number;
}

export interface ScreenerVintage {
  readonly asOf: string;
  readonly dataVersion: string;
  readonly mode: 'SNAPSHOT';
  readonly dataSource: string;
  readonly memberCount: number;
}

export interface ScreenerResponse {
  readonly execution: ScreenerExecutionDto;
  readonly result: ScreenerScreenResult;
  readonly vintage: ScreenerVintage;
}

const BASE = '/api/screener';

export class ScreenerApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'ScreenerApiError';
  }
}

/** Execute a governed screen. The server derives membership; only the definition is sent. */
export async function screen(
  definition: ScreenerDefinitionInput,
  baseUrl = '',
): Promise<ScreenerResponse> {
  const body: ScreenerRequest = { definition };
  const res = await fetch(`${baseUrl}${BASE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
    throw new ScreenerApiError(res.status, err.error ?? `screener transport returned ${res.status}`);
  }
  return (await res.json()) as ScreenerResponse;
}

/** Deep-link: encode a definition into shareable query params (predicates only; no membership). */
export function encodeScreenLink(definition: ScreenerDefinitionInput): string {
  const params = new URLSearchParams();
  params.set('definitionId', definition.definitionId);
  params.set('version', definition.version);
  definition.predicates.forEach((p, i) => {
    params.set(`f${i}`, p.field);
    params.set(`o${i}`, p.operator);
    params.set(`v${i}`, p.operand);
  });
  params.set('n', String(definition.predicates.length));
  return `/screener?${params.toString()}`;
}

/** Deep-link: decode query params back into a definition, or null when absent/invalid. */
export function decodeScreenLink(search: string): ScreenerDefinitionInput | null {
  const params = new URLSearchParams(search);
  const definitionId = params.get('definitionId');
  const version = params.get('version');
  const nRaw = params.get('n');
  if (!definitionId || !version || nRaw === null) return null;
  const n = Number(nRaw);
  if (!Number.isInteger(n) || n < 0 || n > 64) return null;
  const fields: ScreeningField[] = ['conviction', 'quality', 'growth'];
  const operators: ScreeningOperator[] = ['lt', 'lte', 'gt', 'gte', 'eq'];
  const predicates: ScreeningPredicate[] = [];
  for (let i = 0; i < n; i++) {
    const field = params.get(`f${i}`);
    const operator = params.get(`o${i}`);
    const operand = params.get(`v${i}`);
    if (!field || !operator || operand === null) return null;
    if (!fields.includes(field as ScreeningField)) return null;
    if (!operators.includes(operator as ScreeningOperator)) return null;
    predicates.push({ field: field as ScreeningField, operator: operator as ScreeningOperator, operand });
  }
  return { definitionId, version, predicates };
}
