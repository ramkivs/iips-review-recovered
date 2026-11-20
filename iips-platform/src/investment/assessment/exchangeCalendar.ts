/**
 * IID Stage 4 / L-033 — exchange-session calendar consumption boundary.
 *
 * The engine is pure and performs no network or file I/O. A caller therefore supplies the exact calendar
 * artifact it has pinned from IPD (or another authorised source), together with an explicit binding from the
 * assessed security to one exchange segment. This module validates that artifact before any session is counted:
 *
 *   • the artifact must declare schema version 1, an id and a version;
 *   • the bound segment must have one continuous-coverage interval in the artifact;
 *   • every date in that interval must have exactly one explicit day row for the bound exchange;
 *   • an OPEN row must carry at least one session and a CLOSED row must carry none;
 *   • sparse holiday rows outside the continuous interval are evidence about those dates only — they never
 *     extend coverage.
 *
 * The counting convention is deliberately date based. Price `asOf` values and assessment timestamps are
 * converted to the exchange-local (Asia/Kolkata, UTC+05:30) calendar date; the observation date itself is not
 * counted, and every OPEN date after it up to and including the assessment date counts once. An exceptional
 * OPEN row (for example a Sunday Muhurat session) therefore counts, while an ordinary weekend, a mock-only
 * weekend and an exchange holiday do not. Anything missing, mismatched or outside continuous coverage is
 * UNAVAILABLE and the caller must refuse the price rather than fall back to weekdays or calendar days.
 */
import { createHash } from 'node:crypto';

import type { Exchange } from '../contracts/ids';
import { digestOf } from '../fundamentals/canonical';

export type ExchangeSegment = 'NSE_EQ' | 'BSE_EQ';

export interface ExchangeSessionCalendarSession {
  readonly opensAt: string;
  readonly closesAt: string;
}

export interface ExchangeSessionCalendarDay {
  readonly exchange: Exchange;
  readonly date: string;
  readonly status: 'OPEN' | 'CLOSED';
  readonly sessions: readonly ExchangeSessionCalendarSession[];
  readonly dayKind: string;
  readonly description?: string;
  readonly source: string;
}

export interface ExchangeSessionCalendarCoverage {
  readonly exchange: Exchange;
  readonly segment: ExchangeSegment;
  readonly startDate: string;
  readonly endDate: string;
}

export interface ExchangeSessionCalendarArtifact {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly version: string;
  readonly reviewedBy?: string;
  readonly qualification: {
    readonly asOf: string;
    readonly segment: string;
    readonly continuousCoverage: readonly ExchangeSessionCalendarCoverage[];
    readonly outsideCoverage?: string;
  };
  readonly sources: readonly {
    readonly id: string;
    readonly exchange?: Exchange;
    readonly publicationDate?: string | null;
    readonly url: string;
    readonly finding?: string;
    readonly retrievedOn?: string;
  }[];
  readonly days: readonly ExchangeSessionCalendarDay[];
}

/** Caller-asserted provenance for the artifact object. The engine records it; it does not fetch it. */
export interface ExchangeCalendarProvenance {
  readonly repository: string;
  readonly commit: string;
  readonly artifactPath: string;
  readonly sha256?: string;
}

/**
 * The deterministic security → calendar mapping. It is explicit assessment input, never inferred from a price
 * `sourceRef`: a dual-listed security has more than one listing, and only the caller that sourced the price can
 * say which exchange segment that observation belongs to.
 */
export interface PriceCalendarBinding {
  readonly calendar: ExchangeSessionCalendarArtifact;
  readonly provenance?: ExchangeCalendarProvenance;
  readonly expectedId?: string;
  readonly expectedVersion?: string;
  readonly securityId: string;
  readonly listingId?: string | null;
  readonly exchange: Exchange;
  readonly segment: ExchangeSegment;
}

export type PriceFreshnessStatus = 'WITHIN_WINDOW' | 'OUTSIDE_WINDOW' | 'UNAVAILABLE';

export interface PriceFreshnessAssessment {
  readonly status: PriceFreshnessStatus;
  /** Closed refusal vocabulary for price selection. Null only when the price is within the window. */
  readonly reason: string | null;
  readonly detail: string | null;
  readonly calendarId: string | null;
  readonly calendarVersion: string | null;
  /** Canonical digest of the exact calendar object supplied for this assessment. */
  readonly calendarDigest: string | null;
  readonly exchange: Exchange | null;
  readonly segment: ExchangeSegment | null;
  readonly listingId: string | null;
  readonly observationDate: string | null;
  readonly assessmentDate: string | null;
  /** OPEN sessions strictly after the observation date, up to and including the assessment date. */
  readonly tradingSessionsElapsed: number | null;
  readonly maxTradingSessions: number;
  readonly coverageStart: string | null;
  readonly coverageEnd: string | null;
}

interface ListingLike {
  readonly listingId: string;
  readonly securityId: string;
  readonly exchange: Exchange;
  readonly series: string;
  readonly instrumentType: string;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/;
const KOLKATA_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const MAX_COVERAGE_DAYS = 3662;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const instant = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(instant.getTime()) && instant.toISOString().slice(0, 10) === value;
}

function addDays(date: string, days: number): string {
  const instant = new Date(`${date}T00:00:00Z`);
  instant.setUTCDate(instant.getUTCDate() + days);
  return instant.toISOString().slice(0, 10);
}

function daysInclusive(start: string, end: string): number {
  const from = new Date(`${start}T00:00:00Z`).getTime();
  const to = new Date(`${end}T00:00:00Z`).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000)) + 1;
}

/** The exchange-local calendar date of a date or timestamp. Date-only values are already exchange dates. */
export function exchangeLocalDate(value: string): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const trimmed = value.trim();
  if (DATE_PATTERN.test(trimmed)) return validDate(trimmed) ? trimmed : null;
  const instant = new Date(trimmed);
  if (Number.isNaN(instant.getTime())) return null;
  return new Date(instant.getTime() + KOLKATA_OFFSET_MS).toISOString().slice(0, 10);
}

export function segmentForExchange(exchange: Exchange): ExchangeSegment {
  return exchange === 'NSE' ? 'NSE_EQ' : 'BSE_EQ';
}

interface PreparedCalendar {
  readonly artifact: ExchangeSessionCalendarArtifact;
  readonly coverage: ExchangeSessionCalendarCoverage;
  readonly byDate: ReadonlyMap<string, ExchangeSessionCalendarDay>;
  readonly digest: string;
}

type Preparation =
  | { readonly ok: true; readonly prepared: PreparedCalendar }
  | { readonly ok: false; readonly reason: string; readonly detail: string };

function prepareCalendar(binding: PriceCalendarBinding): Preparation {
  const raw: unknown = binding.calendar;
  if (!isRecord(raw)) {
    return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: 'the supplied exchange calendar is not an object' };
  }
  const artifact = raw as unknown as ExchangeSessionCalendarArtifact;
  if (artifact.schemaVersion !== 1 || typeof artifact.id !== 'string' || artifact.id.trim() === '' || typeof artifact.version !== 'string' || artifact.version.trim() === '') {
    return {
      ok: false,
      reason: 'PRICE_CALENDAR_INVALID',
      detail: 'the supplied exchange calendar must declare schemaVersion 1 and non-empty id/version identity',
    };
  }
  if (binding.expectedId !== undefined && binding.expectedId !== artifact.id) {
    return {
      ok: false,
      reason: 'PRICE_CALENDAR_IDENTITY_MISMATCH',
      detail: `calendar id ${artifact.id} does not match the pinned id ${binding.expectedId}`,
    };
  }
  if (binding.expectedVersion !== undefined && binding.expectedVersion !== artifact.version) {
    return {
      ok: false,
      reason: 'PRICE_CALENDAR_IDENTITY_MISMATCH',
      detail: `calendar version ${artifact.version} does not match the pinned version ${binding.expectedVersion}`,
    };
  }
  if (binding.provenance !== undefined) {
    const provenance = binding.provenance;
    if (
      typeof provenance.repository !== 'string' || provenance.repository.trim() === '' ||
      typeof provenance.artifactPath !== 'string' || provenance.artifactPath.trim() === '' ||
      typeof provenance.commit !== 'string' || !COMMIT_PATTERN.test(provenance.commit) ||
      (provenance.sha256 !== undefined && !SHA256_PATTERN.test(provenance.sha256))
    ) {
      return {
        ok: false,
        reason: 'PRICE_CALENDAR_PROVENANCE_INVALID',
        detail: 'calendar provenance must name a repository, artifact path and 40-hex source commit (and a sha256 digest when one is asserted)',
      };
    }
  }
  if (!isRecord(artifact.qualification) || !Array.isArray(artifact.qualification.continuousCoverage)) {
    return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: 'the calendar carries no continuous-coverage declaration' };
  }
  const coverages = artifact.qualification.continuousCoverage.filter(
    (entry) => entry.exchange === binding.exchange && entry.segment === binding.segment,
  );
  if (coverages.length !== 1) {
    return {
      ok: false,
      reason: 'PRICE_CALENDAR_COVERAGE_UNAVAILABLE',
      detail: `the calendar declares ${coverages.length} continuous-coverage interval(s) for ${binding.segment}; exactly one is required`,
    };
  }
  const coverage = coverages[0]!;
  if (!validDate(coverage.startDate) || !validDate(coverage.endDate) || coverage.startDate > coverage.endDate) {
    return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: 'the continuous-coverage interval is not a valid date range' };
  }
  if (daysInclusive(coverage.startDate, coverage.endDate) > MAX_COVERAGE_DAYS) {
    return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: 'the continuous-coverage interval is implausibly large' };
  }
  if (!Array.isArray(artifact.sources) || artifact.sources.length === 0 || artifact.sources.some((source) => !isRecord(source) || typeof source.id !== 'string' || source.id.trim() === '' || typeof source.url !== 'string' || source.url.trim() === '')) {
    return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: 'the calendar carries no usable source provenance' };
  }
  if (!Array.isArray(artifact.days)) {
    return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: 'the calendar carries no day rows' };
  }

  const byDate = new Map<string, ExchangeSessionCalendarDay>();
  for (const day of artifact.days) {
    if (!isRecord(day) || day.exchange !== binding.exchange) continue;
    if (typeof day.date !== 'string' || !validDate(day.date) || (day.status !== 'OPEN' && day.status !== 'CLOSED') || typeof day.dayKind !== 'string' || day.dayKind.trim() === '' || typeof day.source !== 'string' || day.source.trim() === '' || !Array.isArray(day.sessions)) {
      return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: `calendar day row for ${binding.exchange} is malformed` };
    }
    if (byDate.has(day.date)) {
      return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: `calendar has duplicate ${binding.exchange} rows for ${day.date}` };
    }
    if (day.status === 'OPEN') {
      if (day.sessions.length === 0 || day.sessions.some((session: unknown) => !isRecord(session) || typeof session.opensAt !== 'string' || typeof session.closesAt !== 'string' || !session.opensAt.startsWith(day.date as string) || !session.closesAt.startsWith(day.date as string) || session.opensAt >= session.closesAt)) {
        return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: `OPEN calendar row ${day.date} does not carry a valid same-day session` };
      }
    } else if (day.sessions.length !== 0) {
      return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: `CLOSED calendar row ${day.date} carries sessions` };
    }
    byDate.set(day.date, day as unknown as ExchangeSessionCalendarDay);
  }

  for (let date = coverage.startDate; ; date = addDays(date, 1)) {
    if (!byDate.has(date)) {
      return {
        ok: false,
        reason: 'PRICE_CALENDAR_COVERAGE_UNAVAILABLE',
        detail: `calendar coverage ${coverage.startDate}..${coverage.endDate} has no explicit ${binding.exchange} row for ${date}`,
      };
    }
    if (date === coverage.endDate) break;
  }

  let digest: string;
  try {
    digest = digestOf(artifact);
  } catch {
    return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: 'the supplied exchange calendar cannot be canonically digested' };
  }
  return { ok: true, prepared: { artifact, coverage, byDate, digest } };
}

function baseAssessment(input: {
  readonly binding?: PriceCalendarBinding;
  readonly observationDate: string | null;
  readonly assessmentDate: string | null;
  readonly maxTradingSessions: number;
  readonly prepared?: PreparedCalendar;
}): Omit<PriceFreshnessAssessment, 'status' | 'reason' | 'detail' | 'tradingSessionsElapsed'> {
  const calendar = input.binding?.calendar;
  return {
    calendarId: typeof calendar?.id === 'string' ? calendar.id : null,
    calendarVersion: typeof calendar?.version === 'string' ? calendar.version : null,
    calendarDigest: input.prepared?.digest ?? null,
    exchange: input.binding?.exchange ?? null,
    segment: input.binding?.segment ?? null,
    listingId: input.binding?.listingId ?? null,
    observationDate: input.observationDate,
    assessmentDate: input.assessmentDate,
    maxTradingSessions: input.maxTradingSessions,
    coverageStart: input.prepared?.coverage.startDate ?? null,
    coverageEnd: input.prepared?.coverage.endDate ?? null,
  };
}

/**
 * Evaluate one price observation against the bound calendar. This never throws and never approximates:
 * every failure is an UNAVAILABLE assessment with a named reason.
 */
export function evaluatePriceFreshness(input: {
  readonly binding?: PriceCalendarBinding;
  readonly listings?: readonly ListingLike[];
  readonly securityId: string;
  readonly observationDate: string | null;
  readonly assessmentDate: string | null;
  readonly maxTradingSessions: number;
}): PriceFreshnessAssessment {
  const base = baseAssessment(input);
  const unavailable = (reason: string, detail: string, prepared?: PreparedCalendar): PriceFreshnessAssessment => ({
    ...baseAssessment({ ...input, prepared }),
    status: 'UNAVAILABLE',
    reason,
    detail,
    tradingSessionsElapsed: null,
  });

  if (input.binding === undefined) {
    return unavailable('PRICE_CALENDAR_UNAVAILABLE', 'no exchange-session calendar binding was supplied for the price');
  }
  if (input.observationDate === null || input.assessmentDate === null) {
    return unavailable('PRICE_CALENDAR_DATE_INVALID', 'the price observation or assessment date cannot be read as an exchange-local date');
  }
  if (input.binding.securityId !== input.securityId) {
    return unavailable(
      'PRICE_CALENDAR_MAPPING_UNAVAILABLE',
      `calendar binding is for security ${input.binding.securityId}, not the assessed security ${input.securityId}`,
    );
  }
  if (input.binding.segment !== segmentForExchange(input.binding.exchange)) {
    return unavailable(
      'PRICE_CALENDAR_MAPPING_UNAVAILABLE',
      `segment ${input.binding.segment} does not belong to exchange ${input.binding.exchange}`,
    );
  }

  const preparation = prepareCalendar(input.binding);
  if (!preparation.ok) return unavailable(preparation.reason, preparation.detail);
  const prepared = preparation.prepared;
  const withPrepared = baseAssessment({ ...input, prepared });

  if (input.listings !== undefined && input.listings.length > 0) {
    const eligible = input.listings.filter(
      (listing) =>
        listing.securityId === input.securityId &&
        listing.exchange === input.binding!.exchange &&
        listing.series === 'EQ' &&
        listing.instrumentType === 'EQUITY' &&
        listing.effectiveFrom <= input.observationDate! &&
        (listing.effectiveTo === null || listing.effectiveTo >= input.observationDate!),
    );
    if (input.binding.listingId !== null && input.binding.listingId !== undefined) {
      if (!eligible.some((listing) => listing.listingId === input.binding!.listingId)) {
        return {
          ...withPrepared,
          status: 'UNAVAILABLE',
          reason: 'PRICE_CALENDAR_MAPPING_UNAVAILABLE',
          detail: `listing ${input.binding.listingId} is not an active EQ equity listing of the assessed security on ${input.binding.exchange} at ${input.observationDate}`,
          tradingSessionsElapsed: null,
        };
      }
    } else if (eligible.length === 0) {
      return {
        ...withPrepared,
        status: 'UNAVAILABLE',
        reason: 'PRICE_CALENDAR_MAPPING_UNAVAILABLE',
        detail: `the dataset carries no active EQ equity listing of the assessed security on ${input.binding.exchange} at ${input.observationDate}`,
        tradingSessionsElapsed: null,
      };
    }
  } else if (input.binding.listingId !== null && input.binding.listingId !== undefined) {
    return {
      ...withPrepared,
      status: 'UNAVAILABLE',
      reason: 'PRICE_CALENDAR_MAPPING_UNAVAILABLE',
      detail: `listing ${input.binding.listingId} was asserted but no dataset listings were supplied to verify it`,
      tradingSessionsElapsed: null,
    };
  }

  const { coverage, byDate } = prepared;
  if (
    input.observationDate < coverage.startDate || input.observationDate > coverage.endDate ||
    input.assessmentDate < coverage.startDate || input.assessmentDate > coverage.endDate
  ) {
    return {
      ...withPrepared,
      status: 'UNAVAILABLE',
      reason: 'PRICE_CALENDAR_COVERAGE_UNAVAILABLE',
      detail: `calendar ${prepared.artifact.id}@${prepared.artifact.version} continuously covers ${coverage.startDate}..${coverage.endDate} for ${input.binding.segment}; ${input.observationDate}..${input.assessmentDate} is outside it`,
      tradingSessionsElapsed: null,
    };
  }

  const observationDay = byDate.get(input.observationDate)!;
  if (observationDay.status !== 'OPEN') {
    return {
      ...withPrepared,
      status: 'UNAVAILABLE',
      reason: 'PRICE_ON_NON_SESSION_DATE',
      detail: `${input.observationDate} is ${observationDay.dayKind} on ${input.binding.exchange}, not a trading session`,
      tradingSessionsElapsed: null,
    };
  }

  let elapsed = 0;
  for (let date = addDays(input.observationDate, 1); date <= input.assessmentDate; date = addDays(date, 1)) {
    if (byDate.get(date)?.status === 'OPEN') elapsed += 1;
  }

  if (elapsed > input.maxTradingSessions) {
    return {
      ...withPrepared,
      status: 'OUTSIDE_WINDOW',
      reason: 'PRICE_OUTSIDE_POLICY_WINDOW',
      detail: `price is ${elapsed} trading sessions old; the policy window is ${input.maxTradingSessions} trading sessions`,
      tradingSessionsElapsed: elapsed,
    };
  }
  return {
    ...withPrepared,
    status: 'WITHIN_WINDOW',
    reason: null,
    detail: null,
    tradingSessionsElapsed: elapsed,
  };
}

/* -------------------------------------------------------------------------------------------------- *
 * Verified supply: exact bytes → binding.
 *
 * This is the only route by which calendar bytes become a binding. The caller supplies the artifact bytes
 * it obtained through its own authorised channel together with the SHA-256 it pinned for those bytes
 * (for the IPD calendar: repository `ramkivs/iips-production-market-data`, commit and artifact path in the
 * provenance). The digest is computed over the exact bytes and must match before the JSON is even parsed;
 * the parsed artifact must then pass the same preparation validation used at assessment time, so a supply
 * error surfaces here, named, instead of degrading a later assessment. No network, no file I/O, and no
 * fallback: any mismatch refuses the supply.
 * -------------------------------------------------------------------------------------------------- */

export interface VerifiedCalendarSupply {
  /** The pinned digest of the exact artifact bytes, as `sha256:<64 hex>`. */
  readonly expectedSha256: string;
  /** Where the bytes came from. The verified byte digest is recorded into the binding's provenance. */
  readonly provenance: ExchangeCalendarProvenance;
  readonly expectedId: string;
  readonly expectedVersion: string;
  readonly securityId: string;
  readonly exchange: Exchange;
  readonly listingId?: string | null;
}

export type VerifiedCalendarBindingResult =
  | { readonly ok: true; readonly binding: PriceCalendarBinding; readonly sha256: string }
  | { readonly ok: false; readonly reason: string; readonly detail: string };

export function bindingFromVerifiedCalendarBytes(
  bytes: Uint8Array,
  supply: VerifiedCalendarSupply,
): VerifiedCalendarBindingResult {
  if (!SHA256_PATTERN.test(supply.expectedSha256)) {
    return {
      ok: false,
      reason: 'PRICE_CALENDAR_DIGEST_MISMATCH',
      detail: 'the pinned calendar digest is not a sha256:<64 hex> value; supply refused',
    };
  }
  const sha256 = `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
  if (sha256 !== supply.expectedSha256) {
    return {
      ok: false,
      reason: 'PRICE_CALENDAR_DIGEST_MISMATCH',
      detail: `calendar bytes hash to ${sha256}, not the pinned ${supply.expectedSha256}; supply refused`,
    };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: 'the verified calendar bytes are not valid JSON' };
  }
  if (!isRecord(parsed)) {
    return { ok: false, reason: 'PRICE_CALENDAR_INVALID', detail: 'the verified calendar bytes are not a JSON object' };
  }
  const binding: PriceCalendarBinding = {
    calendar: parsed as unknown as ExchangeSessionCalendarArtifact,
    provenance: { ...supply.provenance, sha256 },
    expectedId: supply.expectedId,
    expectedVersion: supply.expectedVersion,
    securityId: supply.securityId,
    listingId: supply.listingId ?? null,
    exchange: supply.exchange,
    segment: segmentForExchange(supply.exchange),
  };
  const preparation = prepareCalendar(binding);
  if (!preparation.ok) return { ok: false, reason: preparation.reason, detail: preparation.detail };
  return { ok: true, binding, sha256 };
}
