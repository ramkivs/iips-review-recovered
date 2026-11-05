/** AMEND-02 closed parsed-evidence boundary. No raw bytes, owner fields or holdings writes. */
import type { BrokerHoldingsPreview } from './brokerHoldingsPreview';

export const EVIDENCE_SUBMISSION_SCHEMA = 'IIPS_BROKER_IMPORT_EVIDENCE_SUBMISSION_V1';
export const EVIDENCE_BODY_LIMIT = 4 * 1024 * 1024;
export interface EvidenceSubmission {
  readonly schema: typeof EVIDENCE_SUBMISSION_SCHEMA;
  readonly fileName: string;
  readonly preview: BrokerHoldingsPreview;
}

type Check = (v: unknown) => boolean;
const str: Check = v => typeof v === 'string' && v.length <= 4096;
const nullable = (check: Check): Check => v => v === null || check(v);
const num: Check = v => typeof v === 'number' && Number.isFinite(v);
const count: Check = v => num(v) && Number.isSafeInteger(v) && (v as number) >= 0;
const bool: Check = v => typeof v === 'boolean';
const one = (...values: unknown[]): Check => v => values.includes(v);
const array = (check: Check, max = 10000): Check => v => Array.isArray(v) && v.length <= max && v.every(check);
function object(required: Record<string, Check>, optional: Record<string, Check> = {}): Check {
  return v => v !== null && typeof v === 'object' && !Array.isArray(v)
    && Object.keys(v).every(k => Object.prototype.hasOwnProperty.call(required, k) || Object.prototype.hasOwnProperty.call(optional, k))
    && Object.entries(required).every(([k, c]) => Object.prototype.hasOwnProperty.call(v, k) && c((v as Record<string, unknown>)[k]))
    && Object.entries(optional).every(([k, c]) => !Object.prototype.hasOwnProperty.call(v, k) || c((v as Record<string, unknown>)[k]));
}
const lookup = object({ identifierType: str, identifierValue: str, outcome: str }, { quarantineRecordId: str, details: str });
const row = object({
  symbol: str, isin: nullable(str), exchange: nullable(str), quantity: num, averagePrice: num,
  currentPrice: nullable(num), identityStatus: one('RESOLVED', 'UNRESOLVED'),
  identityBasis: one('PIPELINE_RESOLVED', 'PIPELINE_ASSESSED_UNRESOLVED', 'PIPELINE_ASSESSED_AMBIGUOUS', 'PIPELINE_ASSESSED_EXCLUDED', 'FILE_LEVEL_P04_REFUSAL', 'NOT_EVALUATED'),
  pipelineIdentityStatus: nullable(one('RESOLVED', 'UNRESOLVED', 'AMBIGUOUS', 'EXCLUDED', 'NOT_EVALUATED')), identityRefusalCode: nullable(str), identifierClass: nullable(str),
  quarantineIds: array(str, 100), lookups: array(lookup, 100), missingEvidence: nullable(str),
});
const summary = object({
  evaluated: count, resolved: count, unresolved: count, ambiguous: count, notEvaluated: count, excluded: count,
  identitySource: str, masterRevision: nullable(str), saveable: bool,
  refusalCodes: v => v !== null && typeof v === 'object' && !Array.isArray(v)
    && Object.keys(v).length <= 100 && Object.entries(v).every(([k, n]) => /^[A-Z][A-Z0-9_]{0,127}$/.test(k) && count(n)),
});
const preview = object({
  mode: one('NATIVE_BROKER_PREVIEW'), persisted: one(false), canSave: one(false),
  broker: one('DHAN', 'ZERODHA', 'GROWW'),
  status: one('PARSED_UNRESOLVED', 'PARSED_IDENTITIES_RESOLVED'),
  contentDigest: v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v),
  asOf: v => typeof v === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString() === v,
  identityAuthority: object({ source: one('IPD_GOVERNED_D05_SECURITY_MASTER'), entities: count }),
  identitySummary: nullable(summary),
  counts: object({ nativeRows: count, identityAssessedRows: count, identityResolvedRows: count, identityUnresolvedRows: count, savedRows: one(0) }),
  notPerformed: object({ validation: one('NOT_PERFORMED'), saveAuthorization: one('NOT_PERFORMED'), persistence: one('NOT_PERFORMED'), reason: str }),
  warnings: array(str), errors: array(str),
  rejections: array(object({ reason: str, details: str, stage: str }, { recordIndex: count, rawIdentifier: str })),
  perRowIdentityEvidencePublished: bool, holdings: array(row),
}, { variant: str });
const submission = object({ schema: one(EVIDENCE_SUBMISSION_SCHEMA), fileName: v => typeof v === 'string' && v.length > 0 && v.length <= 256 && !/[\\/\u0000-\u001f]/.test(v), preview });

/** A bounded traversal BEFORE schema validation; every level is explicit, maps have closed key grammar. */
export function validateEvidenceSubmission(value: unknown): value is EvidenceSubmission {
  function bounded(v: unknown, depth: number): boolean {
    if (depth > 12) return false;
    if (typeof v === 'string') return v.length <= 4096;
    if (v === null || typeof v !== 'object') return true;
    if (Object.keys(v).length > 10000) return false;
    return Object.entries(v).every(([k, x]) => k.length <= 128 && bounded(x, depth + 1));
  }
  if (!bounded(value, 0) || !submission(value)) return false;
  const p = (value as EvidenceSubmission).preview;
  const c = p.counts;
  if (!p.holdings.length || c.nativeRows !== p.holdings.length || c.identityAssessedRows > c.nativeRows
    || c.identityResolvedRows + c.identityUnresolvedRows > c.identityAssessedRows) return false;
  if (new Set(p.holdings.map(r => JSON.stringify([r.symbol, r.isin, r.exchange]))).size !== c.nativeRows) return false;
  if (p.holdings.filter(r => r.identityStatus === 'RESOLVED').length !== c.identityResolvedRows) return false;
  if (p.holdings.some(r => (r.identityStatus === 'RESOLVED') !== (r.identityBasis === 'PIPELINE_RESOLVED'))) return false;
  if (p.status === 'PARSED_IDENTITIES_RESOLVED' && c.identityResolvedRows !== c.nativeRows) return false;
  if (p.status === 'PARSED_UNRESOLVED' && c.identityResolvedRows === c.nativeRows) return false;
  if (p.perRowIdentityEvidencePublished !== (p.identitySummary !== null)) return false;
  if (p.holdings.filter(r => r.pipelineIdentityStatus !== null).length !== c.identityAssessedRows
    || p.holdings.filter(r => r.pipelineIdentityStatus === 'UNRESOLVED' || r.pipelineIdentityStatus === 'AMBIGUOUS').length !== c.identityUnresolvedRows) return false;
  const s = p.identitySummary;
  if (s && (s.evaluated + s.excluded + s.notEvaluated !== c.identityAssessedRows || s.resolved !== c.identityResolvedRows
    || s.unresolved + s.ambiguous !== c.identityUnresolvedRows
    || s.evaluated + s.excluded + s.notEvaluated !== c.nativeRows
    || s.resolved + s.unresolved + s.ambiguous !== s.evaluated
    || s.saveable !== (s.resolved === c.nativeRows))) return false;
  return true;
}

/** Freeze by value, not by a mutable caller reference. Retries never rerun the pipeline. */
export function freezeEvidenceSubmission(fileName: string, preview: BrokerHoldingsPreview): EvidenceSubmission {
  const copy: unknown = JSON.parse(JSON.stringify({ schema: EVIDENCE_SUBMISSION_SCHEMA, fileName, preview }));
  if (!validateEvidenceSubmission(copy)) throw new Error('Evidence snapshot cannot be submitted');
  function freeze(v: unknown): void {
    if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); }
  }
  freeze(copy);
  return copy;
}
