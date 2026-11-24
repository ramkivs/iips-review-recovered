/**
 * Phase C (`PA-DEC-04` / `D-4.7`) — `HistoricalPriceEvidence` v1 contract, validator,
 * embedding helper, and `W16` deterministic diff helper for `NP-04` / `NP-06` reports.
 *
 * Ensures every persisted report referencing historical prices embeds all 6 normative
 * components directly inside `ReportContent.canonicalPayload`:
 *   1. `observations` + `observationDigest` (SHA-256 over canonicalized `observations`)
 *   2. `sourceIdentity` (closed `source` enum, canonical `securityId`, `exchange`, `exchangeSegment`)
 *   3. `adjustment` (`mode`, `isAdjusted`, `corporateActionApplied`, `factor`, `corporateActionId`, `unitsProvenanceNote`)
 *   4. `provenance` (`specVersion`, `runId`, `baselineManifestSha256`, `compositeGeneration`, ...)
 *   5. `temporal` & `completeness` (`temporalModel`, calendar & unexplained-date accounting)
 *   6. `integrity` (`responseDigest`, `digestVerified`, `retrievedAt` UTC ISO-8601)
 *
 * Read-path guarantee: validation and rendering execute strictly offline from persisted
 * `canonicalPayload` bytes — EquiCore or Dhan is never contacted on report read.
 */

import { createHash } from 'node:crypto';
import { canonicalizePayload } from './canonical.js';

export const HISTORICAL_PRICE_EVIDENCE_SCHEMA = 'iips.historical-price-evidence/v1' as const;

export const HISTORICAL_EVIDENCE_SOURCES = [
  'EQUICORE_NSE_EOD',
  'DHAN_D02_OHLCV',
  'D114_PIT',
  'PIT_D01',
  'DATASET_EOD',
] as const;

export type HistoricalEvidenceSource = (typeof HISTORICAL_EVIDENCE_SOURCES)[number];

export type HistoricalEvidenceExchange = 'NSE' | 'BSE';
export type HistoricalEvidenceExchangeSegment = 'NSE_EQ' | 'BSE_EQ';
export type HistoricalEvidenceAdjustmentMode = 'RAW_UNADJUSTED' | 'ADJUSTED';
export type HistoricalEvidenceTemporalModel =
  | 'PINNED_GENERATION_EOD_SNAPSHOT'
  | 'VENDOR_HISTORICAL_SNAPSHOT'
  | 'PIT_BITEMPORAL';

export type ScalarPriceLiteral = string | number | null;

export interface HistoricalPriceObservation {
  readonly businessDate: string;
  readonly open: ScalarPriceLiteral;
  readonly high: ScalarPriceLiteral;
  readonly low: ScalarPriceLiteral;
  readonly close: ScalarPriceLiteral;
  readonly last: ScalarPriceLiteral;
  readonly prevClose: ScalarPriceLiteral;
  readonly volume: ScalarPriceLiteral;
  readonly tradedValue: ScalarPriceLiteral;
  readonly tradesCount: number | string | null;
  readonly observedSymbol: string | null;
  readonly isinValidity: string | null;
  readonly flags: readonly (string | Readonly<Record<string, unknown>>)[];
  readonly archiveSha256: string | null;
  readonly sourceArchive: string | null;
  readonly memberName: string | null;
  readonly sourceFile: string | null;
  readonly sourceLineNumber: number | null;
}

export interface HistoricalPriceEvidence {
  readonly schema: typeof HISTORICAL_PRICE_EVIDENCE_SCHEMA;
  readonly observations: readonly HistoricalPriceObservation[];
  readonly observationDigest: string;
  readonly sourceIdentity: {
    readonly source: HistoricalEvidenceSource;
    readonly exchange: HistoricalEvidenceExchange;
    readonly exchangeSegment: HistoricalEvidenceExchangeSegment;
    readonly securityId: string;
    readonly isin: string;
    readonly series: string;
    readonly companyId: string;
    readonly isinValidity: string | null;
    readonly frequency: string;
    readonly observedSymbols: readonly string[];
  };
  readonly adjustment: {
    readonly mode: HistoricalEvidenceAdjustmentMode;
    readonly isAdjusted: boolean;
    readonly corporateActionApplied: boolean;
    readonly factor: number | null;
    readonly corporateActionId: string | null;
    readonly unitsProvenanceNote: string;
  };
  readonly provenance: {
    readonly specVersion: string | null;
    readonly runId: string | null;
    readonly baselineManifestSha256: string | null;
    readonly compositeGeneration: string | null;
    readonly servingIndexSha256: string | null;
    readonly isinIndexSha256: string | null;
    readonly engineToolSha256: string | null;
    readonly runnerSha256: string | null;
    readonly corpusCoverageFrom: string | null;
    readonly corpusCoverageTo: string | null;
  };
  readonly temporal: {
    readonly temporalModel: HistoricalEvidenceTemporalModel;
    readonly bitemporalKnowledgeAsOf: boolean;
    readonly requestedFromDate: string;
    readonly requestedToDate: string;
  };
  readonly completeness: {
    readonly status: 'exact' | 'calendar-unavailable' | 'unverified';
    readonly tradingDaysWithArchive: number | null;
    readonly returnedBarCount: number;
    readonly securityAbsentOnTradingDaysCount: number | null;
    readonly unexplainedCalendarDates: readonly string[] | null;
    readonly notRetrievedCalendarDates: readonly string[] | null;
    readonly officialHolidayDates: readonly {
      readonly trade_date: string;
      readonly official_holiday_label: string | null;
    }[] | null;
    readonly d21HeldDates: readonly string[];
  };
  readonly integrity: {
    readonly responseDigest: string | null;
    readonly responseDigests: readonly string[];
    readonly digestVerified: boolean;
    readonly retrievedAt: string;
  };
}

export class HistoricalPriceEvidenceError extends Error {
  constructor(message: string, readonly detail: Record<string, unknown> = {}) {
    super(message);
    this.name = 'HistoricalPriceEvidenceError';
  }
}

const SHA256_HEX = /^[0-9a-f]{64}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SECURITY_ID_PATTERN = /^ISIN:([A-Za-z0-9]{12}):([^:\s]+)$/;
const ISIN_12 = /^[A-Za-z0-9]{12}$/;

function reject(message: string, detail: Record<string, unknown> = {}): never {
  throw new HistoricalPriceEvidenceError(message, detail);
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertIsoDate(value: unknown, field: string): string {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) {
    reject(`${field} must be an ISO calendar date (YYYY-MM-DD)`, { field, value });
  }
  const ms = Date.parse(`${value}T00:00:00.000Z`);
  if (Number.isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== value) {
    reject(`${field} is not a real calendar date`, { field, value });
  }
  return value;
}

function assertUtcTimestamp(value: unknown, field: string): string {
  if (typeof value !== 'string') reject(`${field} must be a string`, { field, value });
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!m) reject(`${field} must be ISO-8601 UTC with explicit offset`, { field, value });
  const offset = m[8]!;
  if (offset !== 'Z' && offset !== '+00:00' && offset !== '-00:00') {
    reject(`${field} must be UTC`, { field, value });
  }
  const [, y, mo, d, h, mi, s] = m;
  const year = Number(y), month = Number(mo), day = Number(d);
  const hour = Number(h), minute = Number(mi), second = Number(s);
  if (hour > 23 || minute > 59 || second > 59) {
    reject(`${field} has out-of-range time components`, { field, value });
  }
  const utc = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) {
    reject(`${field} is not a real calendar date`, { field, value });
  }
  return value;
}

function assertScalarLiteral(value: unknown, field: string): ScalarPriceLiteral {
  if (value === null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  reject(`${field} must be a string literal, finite number, or null`, { field, value });
}

function assertNullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value === 'string') return value;
  reject(`${field} must be a string or null`, { field, value });
}

function assertStringArray(value: unknown, field: string): readonly string[] {
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
    reject(`${field} must be an array of strings`, { field });
  }
  return value as readonly string[];
}

/**
 * Computes the deterministic SHA-256 `observationDigest` over canonicalized `observations`.
 */
export function computeObservationDigest(observations: readonly HistoricalPriceObservation[]): string {
  return createHash('sha256').update(canonicalizePayload(observations), 'utf8').digest('hex');
}

/**
 * Validates a `HistoricalPriceEvidence` v1 structure fail-closed, including recomputing
 * `observationDigest` and enforcing cross-field invariants.
 */
export function validateHistoricalPriceEvidence(input: unknown): HistoricalPriceEvidence {
  if (!isPlainRecord(input)) {
    reject('historicalPriceEvidence must be an object');
  }
  if (input.schema !== HISTORICAL_PRICE_EVIDENCE_SCHEMA) {
    reject(`historicalPriceEvidence.schema must be ${HISTORICAL_PRICE_EVIDENCE_SCHEMA}`, {
      schema: input.schema,
    });
  }

  // 1. Observations + observationDigest
  if (!Array.isArray(input.observations)) {
    reject('historicalPriceEvidence.observations must be an array');
  }
  for (const [idx, rawObs] of input.observations.entries()) {
    if (!isPlainRecord(rawObs)) {
      reject(`observations[${idx}] must be an object`, { index: idx });
    }
    assertIsoDate(rawObs.businessDate, `observations[${idx}].businessDate`);
    for (const key of ['open', 'high', 'low', 'close', 'last', 'prevClose', 'volume', 'tradedValue'] as const) {
      assertScalarLiteral(rawObs[key], `observations[${idx}].${key}`);
    }
    if (
      rawObs.tradesCount !== null &&
      typeof rawObs.tradesCount !== 'string' &&
      (typeof rawObs.tradesCount !== 'number' || !Number.isFinite(rawObs.tradesCount))
    ) {
      reject(`observations[${idx}].tradesCount must be a finite number, string, or null`, { index: idx });
    }
    assertNullableString(rawObs.observedSymbol, `observations[${idx}].observedSymbol`);
    assertNullableString(rawObs.isinValidity, `observations[${idx}].isinValidity`);
    if (!Array.isArray(rawObs.flags)) {
      reject(`observations[${idx}].flags must be an array`, { index: idx });
    }
    assertNullableString(rawObs.archiveSha256, `observations[${idx}].archiveSha256`);
    assertNullableString(rawObs.sourceArchive, `observations[${idx}].sourceArchive`);
    assertNullableString(rawObs.memberName, `observations[${idx}].memberName`);
    assertNullableString(rawObs.sourceFile, `observations[${idx}].sourceFile`);
    if (
      rawObs.sourceLineNumber !== null &&
      (typeof rawObs.sourceLineNumber !== 'number' || !Number.isInteger(rawObs.sourceLineNumber))
    ) {
      reject(`observations[${idx}].sourceLineNumber must be an integer or null`, { index: idx });
    }
  }
  const observations = input.observations as unknown as readonly HistoricalPriceObservation[];
  if (typeof input.observationDigest !== 'string' || !SHA256_HEX.test(input.observationDigest)) {
    reject('historicalPriceEvidence.observationDigest must be 64 lowercase hex characters', {
      observationDigest: input.observationDigest,
    });
  }
  const recomputedObsDigest = computeObservationDigest(observations);
  if (recomputedObsDigest !== input.observationDigest) {
    reject('historicalPriceEvidence.observationDigest does not match canonical observations', {
      declared: input.observationDigest,
      recomputed: recomputedObsDigest,
    });
  }

  // 2. Source & canonical security identity
  if (!isPlainRecord(input.sourceIdentity)) {
    reject('historicalPriceEvidence.sourceIdentity must be an object');
  }
  const si = input.sourceIdentity;
  if (
    typeof si.source !== 'string' ||
    !(HISTORICAL_EVIDENCE_SOURCES as readonly string[]).includes(si.source)
  ) {
    reject('sourceIdentity.source must be an admitted historical source', { source: si.source });
  }
  if (si.exchange !== 'NSE' && si.exchange !== 'BSE') {
    reject('sourceIdentity.exchange must be NSE or BSE', { exchange: si.exchange });
  }
  if (si.exchangeSegment !== 'NSE_EQ' && si.exchangeSegment !== 'BSE_EQ') {
    reject('sourceIdentity.exchangeSegment must be NSE_EQ or BSE_EQ', {
      exchangeSegment: si.exchangeSegment,
    });
  }
  if (
    (si.exchange === 'NSE' && si.exchangeSegment !== 'NSE_EQ') ||
    (si.exchange === 'BSE' && si.exchangeSegment !== 'BSE_EQ')
  ) {
    reject('sourceIdentity.exchange contradicts exchangeSegment', {
      exchange: si.exchange,
      exchangeSegment: si.exchangeSegment,
    });
  }
  if (typeof si.securityId !== 'string' || !SECURITY_ID_PATTERN.test(si.securityId)) {
    reject('sourceIdentity.securityId must be ISIN:<12-alnum>:<series>', {
      securityId: si.securityId,
    });
  }
  if (typeof si.isin !== 'string' || !ISIN_12.test(si.isin)) {
    reject('sourceIdentity.isin must be a 12-character ISIN', { isin: si.isin });
  }
  if (typeof si.series !== 'string' || si.series.length === 0) {
    reject('sourceIdentity.series must be a non-empty string', { series: si.series });
  }
  if (typeof si.companyId !== 'string' || si.companyId.length === 0) {
    reject('sourceIdentity.companyId must be a non-empty string', { companyId: si.companyId });
  }
  assertNullableString(si.isinValidity, 'sourceIdentity.isinValidity');
  if (typeof si.frequency !== 'string' || si.frequency.length === 0) {
    reject('sourceIdentity.frequency must be a non-empty string', { frequency: si.frequency });
  }
  assertStringArray(si.observedSymbols, 'sourceIdentity.observedSymbols');

  // 3. Adjustment
  if (!isPlainRecord(input.adjustment)) {
    reject('historicalPriceEvidence.adjustment must be an object');
  }
  const adj = input.adjustment;
  if (adj.mode !== 'RAW_UNADJUSTED' && adj.mode !== 'ADJUSTED') {
    reject('adjustment.mode must be RAW_UNADJUSTED or ADJUSTED', { mode: adj.mode });
  }
  if (typeof adj.isAdjusted !== 'boolean' || typeof adj.corporateActionApplied !== 'boolean') {
    reject('adjustment.isAdjusted and adjustment.corporateActionApplied must be booleans');
  }
  if (adj.mode === 'RAW_UNADJUSTED' && (adj.isAdjusted !== false || adj.corporateActionApplied !== false)) {
    reject('RAW_UNADJUSTED adjustment cannot mark isAdjusted=true or corporateActionApplied=true');
  }
  if (adj.factor !== null && (typeof adj.factor !== 'number' || !Number.isFinite(adj.factor))) {
    reject('adjustment.factor must be a finite number or null');
  }
  assertNullableString(adj.corporateActionId, 'adjustment.corporateActionId');
  if (typeof adj.unitsProvenanceNote !== 'string' || adj.unitsProvenanceNote.length === 0) {
    reject('adjustment.unitsProvenanceNote must be a non-empty string');
  }

  // 4. Baseline & generation provenance
  if (!isPlainRecord(input.provenance)) {
    reject('historicalPriceEvidence.provenance must be an object');
  }
  const prov = input.provenance;
  for (const field of [
    'specVersion',
    'runId',
    'baselineManifestSha256',
    'compositeGeneration',
    'servingIndexSha256',
    'isinIndexSha256',
    'engineToolSha256',
    'runnerSha256',
    'corpusCoverageFrom',
    'corpusCoverageTo',
  ] as const) {
    assertNullableString(prov[field], `provenance.${field}`);
  }
  if (si.source === 'EQUICORE_NSE_EOD') {
    if (typeof prov.baselineManifestSha256 !== 'string' || !SHA256_HEX.test(prov.baselineManifestSha256)) {
      reject('EQUICORE_NSE_EOD requires provenance.baselineManifestSha256 (64 hex chars)');
    }
  }

  // 5. Temporal & completeness
  if (!isPlainRecord(input.temporal)) {
    reject('historicalPriceEvidence.temporal must be an object');
  }
  const temp = input.temporal;
  if (
    temp.temporalModel !== 'PINNED_GENERATION_EOD_SNAPSHOT' &&
    temp.temporalModel !== 'VENDOR_HISTORICAL_SNAPSHOT' &&
    temp.temporalModel !== 'PIT_BITEMPORAL'
  ) {
    reject('temporal.temporalModel is invalid', { temporalModel: temp.temporalModel });
  }
  if (typeof temp.bitemporalKnowledgeAsOf !== 'boolean') {
    reject('temporal.bitemporalKnowledgeAsOf must be a boolean');
  }
  assertIsoDate(temp.requestedFromDate, 'temporal.requestedFromDate');
  assertIsoDate(temp.requestedToDate, 'temporal.requestedToDate');

  if (!isPlainRecord(input.completeness)) {
    reject('historicalPriceEvidence.completeness must be an object');
  }
  const comp = input.completeness;
  if (comp.status !== 'exact' && comp.status !== 'calendar-unavailable' && comp.status !== 'unverified') {
    reject('completeness.status is invalid', { status: comp.status });
  }
  if (typeof comp.returnedBarCount !== 'number' || !Number.isInteger(comp.returnedBarCount) || comp.returnedBarCount < 0) {
    reject('completeness.returnedBarCount must be a non-negative integer');
  }
  if (comp.returnedBarCount !== observations.length) {
    reject('completeness.returnedBarCount must equal observations.length', {
      returnedBarCount: comp.returnedBarCount,
      observationsLength: observations.length,
    });
  }
  if (
    comp.tradingDaysWithArchive !== null &&
    (typeof comp.tradingDaysWithArchive !== 'number' || !Number.isInteger(comp.tradingDaysWithArchive))
  ) {
    reject('completeness.tradingDaysWithArchive must be an integer or null');
  }
  if (
    comp.securityAbsentOnTradingDaysCount !== null &&
    (typeof comp.securityAbsentOnTradingDaysCount !== 'number' ||
      !Number.isInteger(comp.securityAbsentOnTradingDaysCount))
  ) {
    reject('completeness.securityAbsentOnTradingDaysCount must be an integer or null');
  }
  if (comp.unexplainedCalendarDates !== null) {
    assertStringArray(comp.unexplainedCalendarDates, 'completeness.unexplainedCalendarDates');
  }
  if (comp.notRetrievedCalendarDates !== null) {
    assertStringArray(comp.notRetrievedCalendarDates, 'completeness.notRetrievedCalendarDates');
  }
  if (comp.officialHolidayDates !== null) {
    if (!Array.isArray(comp.officialHolidayDates)) {
      reject('completeness.officialHolidayDates must be an array or null');
    }
    for (const entry of comp.officialHolidayDates) {
      if (!isPlainRecord(entry) || typeof entry.trade_date !== 'string') {
        reject('completeness.officialHolidayDates entries must have trade_date');
      }
      assertNullableString(entry.official_holiday_label, 'completeness.officialHolidayDates[].official_holiday_label');
    }
  }
  assertStringArray(comp.d21HeldDates, 'completeness.d21HeldDates');

  // 6. Integrity
  if (!isPlainRecord(input.integrity)) {
    reject('historicalPriceEvidence.integrity must be an object');
  }
  const integ = input.integrity;
  if (integ.responseDigest !== null && (typeof integ.responseDigest !== 'string' || !SHA256_HEX.test(integ.responseDigest))) {
    reject('integrity.responseDigest must be 64 hex chars or null');
  }
  assertStringArray(integ.responseDigests, 'integrity.responseDigests');
  if (typeof integ.digestVerified !== 'boolean') {
    reject('integrity.digestVerified must be a boolean');
  }
  if (si.source === 'EQUICORE_NSE_EOD') {
    if (integ.responseDigest === null || integ.digestVerified !== true) {
      reject('EQUICORE_NSE_EOD requires non-null integrity.responseDigest and digestVerified=true');
    }
  }
  assertUtcTimestamp(integ.retrievedAt, 'integrity.retrievedAt');

  return input as unknown as HistoricalPriceEvidence;
}

/**
 * Pure embedding helper for `ReportContent.canonicalPayload`: validates `evidence` and
 * returns a new payload object carrying `historicalPriceEvidence`.
 */
export function embedHistoricalPriceEvidence<T extends Record<string, unknown>>(
  payload: T,
  evidence: HistoricalPriceEvidence,
): T & { readonly historicalPriceEvidence: HistoricalPriceEvidence } {
  const validated = validateHistoricalPriceEvidence(evidence);
  return {
    ...payload,
    historicalPriceEvidence: validated,
  };
}

/**
 * Extracts and validates `historicalPriceEvidence` from a persisted `canonicalPayload` JSON
 * string offline. Returns `null` if the payload carries no `historicalPriceEvidence`, or
 * throws `HistoricalPriceEvidenceError` if present and invalid/corrupted.
 */
export function extractHistoricalPriceEvidenceFromPayload(canonicalPayloadJson: string): HistoricalPriceEvidence | null {
  const parsed = JSON.parse(canonicalPayloadJson) as unknown;
  if (!isPlainRecord(parsed) || !('historicalPriceEvidence' in parsed)) {
    return null;
  }
  return validateHistoricalPriceEvidence(parsed.historicalPriceEvidence);
}

export interface HistoricalPriceFieldDelta {
  readonly businessDate: string;
  readonly field: string;
  readonly before: ScalarPriceLiteral;
  readonly after: ScalarPriceLiteral;
}

export interface HistoricalPriceEvidenceDiff {
  readonly identical: boolean;
  readonly sourceChanged: { readonly before: HistoricalEvidenceSource; readonly after: HistoricalEvidenceSource; readonly changed: boolean };
  readonly baselineManifestSha256: { readonly before: string | null; readonly after: string | null; readonly changed: boolean };
  readonly compositeGeneration: { readonly before: string | null; readonly after: string | null; readonly changed: boolean };
  readonly responseDigest: { readonly before: string | null; readonly after: string | null; readonly changed: boolean };
  readonly observationDigest: { readonly before: string; readonly after: string; readonly changed: boolean };
  readonly adjustment: {
    readonly before: HistoricalPriceEvidence['adjustment'];
    readonly after: HistoricalPriceEvidence['adjustment'];
    readonly changed: boolean;
  };
  readonly addedDates: readonly string[];
  readonly removedDates: readonly string[];
  readonly priceDeltas: readonly HistoricalPriceFieldDelta[];
}

const PRICE_DIFF_FIELDS = [
  'open',
  'high',
  'low',
  'close',
  'last',
  'prevClose',
  'volume',
  'tradedValue',
  'tradesCount',
] as const;

/**
 * Computes a deterministic structural & numerical diff between two validated
 * `HistoricalPriceEvidence` blocks (e.g. NP-04 report `v1` vs `v2` in `W16`).
 */
export function diffHistoricalPriceEvidence(
  rawA: HistoricalPriceEvidence,
  rawB: HistoricalPriceEvidence,
): HistoricalPriceEvidenceDiff {
  const a = validateHistoricalPriceEvidence(rawA);
  const b = validateHistoricalPriceEvidence(rawB);

  const byDateA = new Map<string, HistoricalPriceObservation>();
  for (const obs of a.observations) byDateA.set(obs.businessDate, obs);
  const byDateB = new Map<string, HistoricalPriceObservation>();
  for (const obs of b.observations) byDateB.set(obs.businessDate, obs);

  const addedDates = [...byDateB.keys()].filter((d) => !byDateA.has(d)).sort();
  const removedDates = [...byDateA.keys()].filter((d) => !byDateB.has(d)).sort();
  const sharedDates = [...byDateA.keys()].filter((d) => byDateB.has(d)).sort();

  const priceDeltas: HistoricalPriceFieldDelta[] = [];
  for (const businessDate of sharedDates) {
    const obsA = byDateA.get(businessDate)!;
    const obsB = byDateB.get(businessDate)!;
    for (const field of PRICE_DIFF_FIELDS) {
      const valA = obsA[field];
      const valB = obsB[field];
      if (valA !== valB) {
        priceDeltas.push({ businessDate, field, before: valA, after: valB });
      }
    }
  }

  const sourceChanged = {
    before: a.sourceIdentity.source,
    after: b.sourceIdentity.source,
    changed: a.sourceIdentity.source !== b.sourceIdentity.source,
  };
  const baselineManifestSha256 = {
    before: a.provenance.baselineManifestSha256,
    after: b.provenance.baselineManifestSha256,
    changed: a.provenance.baselineManifestSha256 !== b.provenance.baselineManifestSha256,
  };
  const compositeGeneration = {
    before: a.provenance.compositeGeneration,
    after: b.provenance.compositeGeneration,
    changed: a.provenance.compositeGeneration !== b.provenance.compositeGeneration,
  };
  const responseDigest = {
    before: a.integrity.responseDigest,
    after: b.integrity.responseDigest,
    changed: a.integrity.responseDigest !== b.integrity.responseDigest,
  };
  const observationDigest = {
    before: a.observationDigest,
    after: b.observationDigest,
    changed: a.observationDigest !== b.observationDigest,
  };
  const adjustmentChanged =
    a.adjustment.mode !== b.adjustment.mode ||
    a.adjustment.isAdjusted !== b.adjustment.isAdjusted ||
    a.adjustment.corporateActionApplied !== b.adjustment.corporateActionApplied ||
    a.adjustment.factor !== b.adjustment.factor ||
    a.adjustment.corporateActionId !== b.adjustment.corporateActionId;
  const adjustment = {
    before: a.adjustment,
    after: b.adjustment,
    changed: adjustmentChanged,
  };

  const identical =
    !sourceChanged.changed &&
    !baselineManifestSha256.changed &&
    !compositeGeneration.changed &&
    !responseDigest.changed &&
    !observationDigest.changed &&
    !adjustment.changed &&
    addedDates.length === 0 &&
    removedDates.length === 0 &&
    priceDeltas.length === 0;

  return {
    identical,
    sourceChanged,
    baselineManifestSha256,
    compositeGeneration,
    responseDigest,
    observationDigest,
    adjustment,
    addedDates,
    removedDates,
    priceDeltas,
  };
}
