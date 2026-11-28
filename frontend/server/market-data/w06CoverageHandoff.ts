/**
 * Snapshot-to-Live W-06 — deterministic Coverage-to-W-06 identity handoff adapter and
 * read-only observation runner.
 *
 * WHY THIS MODULE EXISTS
 *   `GET /api/investment/coverage` (`IdentityCoverageReport`) and the D01 market-data routes
 *   (`POST /api/dhan/quotes`, `GET /api/dhan/freshness`) speak two distinct identifier shapes:
 *     1. `CoverageItem.binding` carries IRR IID-0 canonical identifiers:
 *          - `issuerId`:   `IN:EQISIN:<12-alnum>` | `IN:CIN:<21-char>`
 *          - `securityId`: `IN:ISIN:<12-alnum>` (2-segment; omits `:series`)
 *          - `listingId`:  `IN:<EXCHANGE>:<SYMBOL>:<SERIES>:<INSTRUMENT>` (5-segment)
 *     2. IPD/Dhan D01 market-data routes require the D-4.6 / D114 3-tuple:
 *          - `companyId`:       `item.raw.companyId` (e.g. `EQ_AGI_IN`)
 *          - `exchangeSegment`: `'NSE_EQ' | 'BSE_EQ'` derived from a resolved equity `listingId`
 *          - `securityId`:      `ISIN:<12-alnum>:<series>` stored at the literal flat dotted key
 *                               `item.raw["securityIdentity.securityId"]`
 *
 *   Reading top-level `item.companyId` or nested `item.raw.securityIdentity.securityId` on a
 *   served `CoverageItem` collapses resolved holdings to `companyId: ""` and `storedSecurityId: null`,
 *   while reading `item.raw["securityIdentity.securityId"]` WITHOUT gating on `item.state === "RESOLVED"`
 *   would misclassify ambiguous listings (such as `ASKAUTOLTD` with `AMBIGUOUS_LISTING` and stored
 *   `ISIN:INE491J01022:B`) as quote-eligible.
 *
 * BOUNDARY INVARIANTS
 *   - Deterministic, fail-closed, no identifier inference from symbols, names, or row positions.
 *   - `exchangeSegment` is derived ONLY from a valid resolved equity `binding.listingId`; it is
 *     never defaulted to `'NSE_EQ'`.
 *   - Out-of-scope items (`source !== 'HOLDING'` or `portfolioId !== targetPortfolioId`, such as
 *     inactive `AIIL` on `PERSONAL-...`) are excluded from `rows` and recorded in `excludedItems`.
 *   - Unresolved or incoherent in-scope rows remain in `rows` with `identityResolved: false`,
 *     preserving `observationId` and diagnostics while issuing zero market-data calls.
 *   - Read-only HTTP runner: issues one `GET /api/investment/coverage` read (plus one read-only
 *     `GET /api/user-portfolios/:portfolioId` only when no `CapturedRevisionRef` is pre-supplied),
 *     and at most one `POST /api/dhan/quotes` + one `GET /api/dhan/freshness` per resolved identity,
 *     with no retries and no refreshes.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import {
  isSectorReferenceId,
  listingParts,
  parseIssuerId,
  parseListingId,
  parseSecurityId,
  securityIsin,
} from '../../../iips-platform/src/investment/contracts/ids';
import type { IdentityCoverageReport } from '../../../iips-platform/src/investment/identity/coverage';
import type { ObservationSource, ResolutionState } from '../../../iips-platform/src/investment/identity/types';
import {
  exchangeSegmentForExchange,
  validateCanonicalDhanIdentity,
  type DhanExchangeSegment,
} from './dhanCanonicalIdentity';
import type { DhanQuoteView } from './dhanMarketDataRoutes';
import type { IpdFreshnessStatus } from './dhanMarketDataTransport';
import {
  measureDhanRevisionCoverage,
  validateCapturedRevisionRef,
  type CapturedHoldingRow,
  type CapturedRevisionRef,
  type DhanRevisionCoverageReport,
  type HoldingIdentityDiagnostics,
  type IdentityCoverageCategory,
  type RevisionCoverageReaders,
  type RevisionCoverageTotals,
  type RevisionFreshnessReadOutcome,
  type RevisionQuoteReadOutcome,
} from './dhanRevisionCoverage';

export const W06_OBSERVATION_SUMMARY_SCHEMA = 'iips.w06.observation-summary/v1' as const;

export const W06_MEASUREMENT_BOUNDARY =
  'one POST /api/dhan/quotes + one GET /api/dhan/freshness per resolved identity; none for unresolved; no retry/refresh' as const;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_HTTP_TIMEOUT_MS = 10_000;

/** Why a coverage observation was excluded from the target portfolio's W-06 row set. */
export type CoverageExclusionReason = 'NON_HOLDING_SOURCE' | 'OUT_OF_SCOPE_PORTFOLIO';

/** Recorded out-of-scope observation from `GET /api/investment/coverage`. */
export interface ExcludedCoverageObservation {
  readonly observationId: string;
  readonly source: ObservationSource | string;
  readonly portfolioId: string | null;
  readonly symbol: string | null;
  readonly active: boolean | null;
  readonly state: ResolutionState | string;
  readonly exclusionReason: CoverageExclusionReason;
}

export type ProjectCoverageReportOutcome =
  | {
      readonly ok: true;
      readonly portfolioId: string;
      readonly observedItems: number;
      readonly rows: readonly CapturedHoldingRow[];
      readonly excludedItems: readonly ExcludedCoverageObservation[];
    }
  | {
      readonly ok: false;
      readonly code: 'INVALID_PORTFOLIO_ID' | 'MALFORMED_COVERAGE_REPORT';
      readonly message: string;
    };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function readOwnString(record: Record<string, unknown> | null, key: string): string | null {
  if (record === null || !hasOwn(record, key)) return null;
  const value = record[key];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Projects a single in-scope `HOLDING` `CoverageItem` onto a `CapturedHoldingRow`.
 *
 * Enforces exact coherence across `state`, `outcomeClass`, `binding`, `resolution`, `raw`, and
 * `validateCanonicalDhanIdentity`. Any unresolved or contradictory state returns an ineligible
 * row (`identityResolved: false`, `securityId: null`, `exchangeSegment: null`) with full
 * diagnostics preserved.
 */
function projectInScopeHoldingItem(
  item: Record<string, unknown>,
  portfolioId: string,
): CapturedHoldingRow {
  const rowId = (item.observationId as string).trim();
  const raw = isPlainObject(item.raw) ? item.raw : null;

  // 1. Read IPD's companyId strictly from `item.raw.companyId` (never top-level, never issuerId).
  const companyId =
    raw !== null && hasOwn(raw, 'companyId') && typeof raw.companyId === 'string'
      ? raw.companyId.trim()
      : '';

  // 2. Read the stored D114 securityId strictly from the literal flat dotted key
  //    `item.raw["securityIdentity.securityId"]` (never nested `raw.securityIdentity`, never inferred).
  const storedSecurityId = readOwnString(raw, 'securityIdentity.securityId');
  const isinAuthority = readOwnString(raw, 'securityIdentity.isinAuthority');

  const itemState = typeof item.state === 'string' ? item.state : null;
  const itemReason = typeof item.reason === 'string' ? item.reason : null;
  const itemDetail =
    typeof item.detail === 'string' && item.detail.trim() !== ''
      ? item.detail
      : typeof item.reasonText === 'string' && item.reasonText.trim() !== ''
        ? item.reasonText
        : null;

  const binding = isPlainObject(item.binding) ? item.binding : null;
  const resolution = isPlainObject(item.resolution) ? item.resolution : null;
  const bindingSecurityId =
    binding !== null && typeof binding.securityId === 'string' ? binding.securityId : null;
  const bindingListingId =
    binding !== null && typeof binding.listingId === 'string' ? binding.listingId : null;

  const unresolvedRow = (detail: string): CapturedHoldingRow => ({
    rowId,
    companyId,
    exchangeSegment: null,
    securityId: null,
    identityResolved: false,
    diagnostics: {
      identityState: itemState,
      identityReason: itemReason,
      identityDetail: itemDetail ?? detail,
      storedSecurityId,
      canonicalSecurityId: bindingSecurityId,
      listingId: bindingListingId,
      isinAuthority,
    },
  });

  if (raw === null) {
    return unresolvedRow('coverage item carries no raw holding projection.');
  }
  if (raw.active === false) {
    return unresolvedRow('holding is inactive (raw.active=false); excluded from active quote/freshness calls.');
  }
  if (raw.active !== true) {
    return unresolvedRow('holding raw.active flag is missing or non-boolean.');
  }
  if (raw.securityIdentityMalformed === true) {
    return unresolvedRow('holding D114 securityIdentity was flagged malformed.');
  }

  // Require coherent resolved state across item, binding, and resolution.
  if (itemState !== 'RESOLVED' || item.outcomeClass !== 'RESOLVED') {
    return unresolvedRow(`coverage item state is ${String(itemState)} (not RESOLVED).`);
  }
  if (binding === null || resolution === null) {
    return unresolvedRow('coverage item is missing binding or resolution envelope.');
  }
  if (
    binding.status !== 'RESOLVED' ||
    binding.assessable !== true ||
    resolution.state !== 'RESOLVED'
  ) {
    return unresolvedRow('binding/resolution status is not RESOLVED and assessable.');
  }
  if (
    binding.observationId !== rowId ||
    resolution.observationId !== rowId ||
    binding.portfolioId !== portfolioId
  ) {
    return unresolvedRow('binding/resolution observationId or portfolioId does not match the item.');
  }

  // Validate canonical IRR issuerId, securityId, and listingId — and mutual agreement.
  if (
    typeof binding.issuerId !== 'string' ||
    binding.issuerId !== resolution.issuerId ||
    typeof binding.securityId !== 'string' ||
    binding.securityId !== resolution.securityId ||
    typeof binding.listingId !== 'string' ||
    binding.listingId !== resolution.listingId
  ) {
    return unresolvedRow('resolved binding and resolution identifiers are missing or disagree.');
  }

  let bindingIsin: string;
  let canonicalSecurityId: string;
  let canonicalListingId: string;
  let listing: ReturnType<typeof listingParts>;
  try {
    parseIssuerId(binding.issuerId);
    const parsedSec = parseSecurityId(binding.securityId);
    canonicalSecurityId = parsedSec;
    bindingIsin = securityIsin(parsedSec);
    const parsedListing = parseListingId(binding.listingId);
    canonicalListingId = parsedListing;
    listing = listingParts(parsedListing);
  } catch (error) {
    return unresolvedRow(
      error instanceof Error ? error.message : 'canonical binding identifier failed validation.',
    );
  }

  if (listing.instrumentType !== 'EQUITY') {
    return unresolvedRow(`resolved listing instrumentType is ${listing.instrumentType}, not EQUITY.`);
  }

  if (!companyId || isSectorReferenceId(companyId)) {
    return unresolvedRow('holding raw.companyId is missing or is a sector reference.');
  }
  if (storedSecurityId === null) {
    return unresolvedRow('holding raw["securityIdentity.securityId"] is absent or null.');
  }

  // Optional raw coherence checks: flat D114 sub-keys and explicit raw exchange/isin if present.
  if (hasOwn(raw, 'securityIdentity.isin') && raw['securityIdentity.isin'] !== null) {
    if (
      typeof raw['securityIdentity.isin'] !== 'string' ||
      raw['securityIdentity.isin'].trim().toUpperCase() !== bindingIsin
    ) {
      return unresolvedRow('raw["securityIdentity.isin"] contradicts resolved binding.securityId.');
    }
  }
  if (hasOwn(raw, 'securityIdentity.series') && raw['securityIdentity.series'] !== null) {
    if (
      typeof raw['securityIdentity.series'] !== 'string' ||
      raw['securityIdentity.series'].trim() !== listing.series
    ) {
      return unresolvedRow('raw["securityIdentity.series"] contradicts resolved binding.listingId series.');
    }
  }
  if (hasOwn(raw, 'isin') && raw.isin !== null && raw.isin !== '') {
    if (
      typeof raw.isin !== 'string' ||
      raw.isin.replace(/[\s-]/g, '').toUpperCase() !== bindingIsin
    ) {
      return unresolvedRow('raw.isin contradicts resolved binding.securityId.');
    }
  }
  if (hasOwn(raw, 'exchange') && raw.exchange !== null && raw.exchange !== '') {
    if (raw.exchange !== listing.exchange) {
      return unresolvedRow('raw.exchange contradicts resolved binding.listingId exchange.');
    }
  }

  // 3. Derive exchangeSegment ONLY from the validated resolved equity listingId (never defaulted).
  const derivedSegment = exchangeSegmentForExchange(listing.exchange);

  // 4. Validate the complete canonical Dhan D01 3-tuple and cross-check ISIN/series/exchange coherence.
  const dhanIdentity = validateCanonicalDhanIdentity(
    {
      companyId,
      exchangeSegment: derivedSegment,
      securityId: storedSecurityId,
      isin: bindingIsin,
      series: listing.series,
      exchange: listing.exchange,
    },
    'quote',
  );
  if (!dhanIdentity.ok) {
    return unresolvedRow(dhanIdentity.message);
  }

  const diagnostics: HoldingIdentityDiagnostics = {
    identityState: 'RESOLVED',
    identityReason: null,
    identityDetail: null,
    storedSecurityId: dhanIdentity.securityId,
    canonicalSecurityId,
    listingId: canonicalListingId,
    isinAuthority,
  };

  return {
    rowId,
    companyId: dhanIdentity.companyId,
    exchangeSegment: dhanIdentity.exchangeSegment,
    securityId: dhanIdentity.securityId,
    identityResolved: true,
    diagnostics,
  };
}

/**
 * Deterministically converts an `IdentityCoverageReport` (`GET /api/investment/coverage`) into
 * portfolio-scoped W-06 `CapturedHoldingRow[]` plus `excludedItems`.
 */
export function projectCoverageReportToW06Rows(
  report: Pick<IdentityCoverageReport, 'items'> | unknown,
  portfolioId: string,
): ProjectCoverageReportOutcome {
  if (typeof portfolioId !== 'string' || portfolioId.trim() === '' || portfolioId !== portfolioId.trim()) {
    return {
      ok: false,
      code: 'INVALID_PORTFOLIO_ID',
      message: 'portfolioId must be a non-empty trimmed string.',
    };
  }
  if (!isPlainObject(report) || !Array.isArray(report.items)) {
    return {
      ok: false,
      code: 'MALFORMED_COVERAGE_REPORT',
      message: 'coverage report must be a JSON object carrying an items array.',
    };
  }

  const rows: CapturedHoldingRow[] = [];
  const excludedItems: ExcludedCoverageObservation[] = [];

  for (let index = 0; index < report.items.length; index += 1) {
    const rawItem = report.items[index];
    if (!isPlainObject(rawItem)) {
      return {
        ok: false,
        code: 'MALFORMED_COVERAGE_REPORT',
        message: `coverage report items[${index}] is not an object.`,
      };
    }
    const observationId =
      typeof rawItem.observationId === 'string' ? rawItem.observationId.trim() : '';
    const source = typeof rawItem.source === 'string' ? rawItem.source : '';
    if (!observationId || !source) {
      return {
        ok: false,
        code: 'MALFORMED_COVERAGE_REPORT',
        message: `coverage report items[${index}] is missing observationId or source.`,
      };
    }

    const rawRecord = isPlainObject(rawItem.raw) ? rawItem.raw : null;
    const itemPortfolioId = typeof rawItem.portfolioId === 'string' ? rawItem.portfolioId : null;
    const state = typeof rawItem.state === 'string' ? rawItem.state : 'UNMATCHED';

    if (source !== 'HOLDING') {
      excludedItems.push({
        observationId,
        source,
        portfolioId: itemPortfolioId,
        symbol: readOwnString(rawRecord, 'symbol'),
        active: rawRecord !== null && typeof rawRecord.active === 'boolean' ? rawRecord.active : null,
        state,
        exclusionReason: 'NON_HOLDING_SOURCE',
      });
      continue;
    }

    if (itemPortfolioId !== portfolioId) {
      excludedItems.push({
        observationId,
        source: 'HOLDING',
        portfolioId: itemPortfolioId,
        symbol: readOwnString(rawRecord, 'symbol'),
        active: rawRecord !== null && typeof rawRecord.active === 'boolean' ? rawRecord.active : null,
        state,
        exclusionReason: 'OUT_OF_SCOPE_PORTFOLIO',
      });
      continue;
    }

    rows.push(projectInScopeHoldingItem(rawItem, portfolioId));
  }

  return {
    ok: true,
    portfolioId,
    observedItems: report.items.length,
    rows,
    excludedItems,
  };
}

/* ------------------------------------------------------------------ *
 * Read-only HTTP observation runner and summary builder
 * ------------------------------------------------------------------ */

export interface W06RecordedDataCall {
  readonly endpoint: 'POST /api/dhan/quotes' | 'GET /api/dhan/freshness';
  readonly httpStatus: number | null;
  readonly ok: boolean;
  readonly code: string | null;
}

export interface W06ObservationSummaryRow {
  readonly rowId: string;
  readonly companyId: string;
  readonly exchangeSegment: DhanExchangeSegment | null;
  readonly storedSecurityId: string | null;
  readonly securityId: string | null;
  readonly identityState: string | null;
  readonly identityReason: string | null;
  readonly calls: readonly W06RecordedDataCall[];
  readonly category: IdentityCoverageCategory;
}

export interface W06ObservationSummary {
  readonly schema: typeof W06_OBSERVATION_SUMMARY_SCHEMA;
  readonly asOf: string;
  readonly portfolioId: string;
  readonly capture: CapturedRevisionRef;
  readonly evaluatedAt: string;
  readonly providerQualification: DhanRevisionCoverageReport['providerQualification'];
  readonly observedCoverageItems: number;
  readonly excludedItems: readonly ExcludedCoverageObservation[];
  readonly rows: readonly W06ObservationSummaryRow[];
  readonly totals: RevisionCoverageTotals;
  readonly quoteCalls: number;
  readonly freshnessCalls: number;
  readonly totalDataCalls: number;
  readonly boundary: typeof W06_MEASUREMENT_BOUNDARY;
}

/** Validates that the IRR API base URL points strictly to a loopback host. */
export function validateLoopbackApiBaseUrl(
  rawUrl: string,
): { readonly ok: true; readonly baseUrl: string } | { readonly ok: false; readonly code: string; readonly message: string } {
  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return { ok: false, code: 'INVALID_API_BASE_URL', message: 'apiBaseUrl is required.' };
  }
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { ok: false, code: 'INVALID_API_BASE_URL', message: 'apiBaseUrl is not a valid URL.' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, code: 'INVALID_API_BASE_URL', message: 'apiBaseUrl must use http or https.' };
  }
  if (parsed.username !== '' || parsed.password !== '') {
    return { ok: false, code: 'INVALID_API_BASE_URL', message: 'apiBaseUrl must not embed credentials.' };
  }
  const host = parsed.hostname.toLowerCase();
  if (host !== '127.0.0.1' && host !== 'localhost' && host !== '::1' && host !== '[::1]') {
    return {
      ok: false,
      code: 'NON_LOOPBACK_API_BASE_URL',
      message: 'apiBaseUrl must target a loopback host (127.0.0.1, localhost, or ::1).',
    };
  }
  const normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/+$/, '')}`;
  return { ok: true, baseUrl: normalized };
}

/**
 * Extracts a `CapturedRevisionRef` from either a direct `CapturedRevisionRef` JSON document or
 * a LOCAL-ONLY W11-DEP1 `exact-owner-bound-portfolio-capture.json` document.
 *
 * Refuses sanitized W11-DEP1 summaries (`iips.w11-dep1.owner-bound-portfolio-capture.summary/v1`)
 * because they omit `portfolioId` and `provenanceDigest` by design.
 */
export function parseCaptureDocumentToRevisionRef(
  doc: unknown,
  expectedPortfolioId: string,
):
  | { readonly ok: true; readonly capture: CapturedRevisionRef; readonly expectedHoldingsCount: number | null }
  | { readonly ok: false; readonly code: 'CAPTURE_REF_INCOMPLETE' | 'PORTFOLIO_MISMATCH'; readonly message: string } {
  if (!isPlainObject(doc)) {
    return { ok: false, code: 'CAPTURE_REF_INCOMPLETE', message: 'capture document must be a JSON object.' };
  }

  if (doc.schema === 'iips.w11-dep1.owner-bound-portfolio-capture.summary/v1') {
    return {
      ok: false,
      code: 'CAPTURE_REF_INCOMPLETE',
      message:
        'sanitized W11-DEP1 summary carries no portfolioId or provenanceDigest; supply the exact capture JSON, explicit revision/provenanceDigest flags, or read-only portfolio detail.',
    };
  }

  if (doc.schema === 'iips.w11-dep1.owner-bound-portfolio-capture.exact/v1') {
    const irrMirror = isPlainObject(doc.irrMirror) ? doc.irrMirror : null;
    const firstView = irrMirror !== null && isPlainObject(irrMirror.firstView) ? irrMirror.firstView : null;
    const consumerObs = isPlainObject(doc.consumerObservation) ? doc.consumerObservation : null;
    if (firstView === null || consumerObs === null) {
      return {
        ok: false,
        code: 'CAPTURE_REF_INCOMPLETE',
        message: 'exact W11-DEP1 capture is missing irrMirror.firstView or consumerObservation.',
      };
    }
    const candidate: CapturedRevisionRef = {
      portfolioId: typeof firstView.portfolioId === 'string' ? firstView.portfolioId : '',
      revision: typeof firstView.revision === 'number' ? firstView.revision : Number.NaN,
      provenanceDigest: typeof firstView.provenanceDigest === 'string' ? firstView.provenanceDigest : '',
      capturedAt:
        typeof consumerObs.finalReadCompletedAtUtc === 'string' ? consumerObs.finalReadCompletedAtUtc : '',
    };
    const check = validateCapturedRevisionRef(candidate);
    if (!check.ok) return { ok: false, code: 'CAPTURE_REF_INCOMPLETE', message: check.message };
    if (candidate.portfolioId !== expectedPortfolioId) {
      return {
        ok: false,
        code: 'PORTFOLIO_MISMATCH',
        message: `capture portfolioId "${candidate.portfolioId}" does not match requested "${expectedPortfolioId}".`,
      };
    }
    const holdingsCount = Array.isArray(firstView.holdings) ? firstView.holdings.length : null;
    return { ok: true, capture: candidate, expectedHoldingsCount: holdingsCount };
  }

  const candidate: CapturedRevisionRef = {
    portfolioId: typeof doc.portfolioId === 'string' ? doc.portfolioId : '',
    revision: typeof doc.revision === 'number' ? doc.revision : Number.NaN,
    provenanceDigest: typeof doc.provenanceDigest === 'string' ? doc.provenanceDigest : '',
    capturedAt: typeof doc.capturedAt === 'string' ? doc.capturedAt : '',
  };
  const check = validateCapturedRevisionRef(candidate);
  if (!check.ok) return { ok: false, code: 'CAPTURE_REF_INCOMPLETE', message: check.message };
  if (candidate.portfolioId !== expectedPortfolioId) {
    return {
      ok: false,
      code: 'PORTFOLIO_MISMATCH',
      message: `capture portfolioId "${candidate.portfolioId}" does not match requested "${expectedPortfolioId}".`,
    };
  }
  return { ok: true, capture: candidate, expectedHoldingsCount: null };
}

function parseQuoteResponseBody(status: number, parsed: unknown): RevisionQuoteReadOutcome {
  if (status >= 200 && status < 300 && isPlainObject(parsed) && isPlainObject(parsed.data)) {
    const data = parsed.data;
    if (
      typeof data.freshness === 'string' &&
      typeof data.qualityState === 'string' &&
      typeof data.providerQualification === 'string' &&
      (data.quote === null || isPlainObject(data.quote))
    ) {
      return { ok: true, view: data as unknown as DhanQuoteView };
    }
    return {
      ok: false,
      code: 'MALFORMED_RESPONSE',
      message: 'POST /api/dhan/quotes returned HTTP 200 with a malformed quote view.',
      identityFailure: false,
    };
  }

  if (isPlainObject(parsed) && isPlainObject(parsed.error)) {
    const err = parsed.error;
    return {
      ok: false,
      code: typeof err.code === 'string' && err.code !== '' ? err.code : `HTTP_${status}`,
      message: typeof err.message === 'string' && err.message !== '' ? err.message : `HTTP ${status}`,
      identityFailure: err.identityFailure === true,
    };
  }

  return {
    ok: false,
    code: `HTTP_${status}`,
    message: `POST /api/dhan/quotes returned HTTP ${status} without a structured error envelope.`,
    identityFailure: false,
  };
}

function parseFreshnessResponseBody(status: number, parsed: unknown): RevisionFreshnessReadOutcome {
  if (status >= 200 && status < 300 && isPlainObject(parsed) && isPlainObject(parsed.data)) {
    const d = parsed.data;
    const lastRefresh = isPlainObject(d.lastRefresh) ? d.lastRefresh : null;
    const valid =
      typeof d.domain === 'string' &&
      typeof d.cacheState === 'string' &&
      (d.asOf === null || typeof d.asOf === 'string') &&
      typeof d.timestampEvidence === 'string' &&
      (d.receivedAt === null || typeof d.receivedAt === 'string') &&
      typeof d.evaluatedAt === 'string' &&
      (d.observationEvaluatedAt === null || typeof d.observationEvaluatedAt === 'string') &&
      typeof d.thresholdSeconds === 'number' &&
      Number.isFinite(d.thresholdSeconds) &&
      (d.ageSeconds === null || (typeof d.ageSeconds === 'number' && Number.isFinite(d.ageSeconds))) &&
      typeof d.verdict === 'string' &&
      typeof d.staleConcessionActive === 'boolean' &&
      typeof d.suppressExecution === 'boolean' &&
      typeof d.eligibleForUse === 'boolean' &&
      lastRefresh !== null &&
      typeof lastRefresh.outcome === 'string';
    if (!valid) {
      return {
        ok: false,
        code: 'MALFORMED_RESPONSE',
        message: 'GET /api/dhan/freshness returned HTTP 200 with a malformed freshness view.',
      };
    }

    const statusObj: IpdFreshnessStatus = {
      domain: d.domain as string,
      cacheState: d.cacheState as string,
      asOf: d.asOf as string | null,
      timestampEvidence: d.timestampEvidence as string,
      receivedAt: d.receivedAt as string | null,
      evaluatedAt: d.evaluatedAt as string,
      observationEvaluatedAt: d.observationEvaluatedAt as string | null,
      thresholdSeconds: d.thresholdSeconds as number,
      ageSeconds: d.ageSeconds as number | null,
      verdict: d.verdict as string,
      staleConcessionActive: d.staleConcessionActive as boolean,
      suppressExecution: d.suppressExecution as boolean,
      eligibleForUse: d.eligibleForUse as boolean,
      lastRefresh: {
        outcome: lastRefresh.outcome as string,
        lastFailure: isPlainObject(lastRefresh.lastFailure)
          ? {
              code: String(lastRefresh.lastFailure.code ?? ''),
              priorPreserved: lastRefresh.lastFailure.priorPreserved === true,
            }
          : null,
      },
    };
    return { ok: true, status: statusObj };
  }

  if (isPlainObject(parsed) && isPlainObject(parsed.error)) {
    const err = parsed.error;
    return {
      ok: false,
      code: typeof err.code === 'string' && err.code !== '' ? err.code : `HTTP_${status}`,
      message: typeof err.message === 'string' && err.message !== '' ? err.message : `HTTP ${status}`,
    };
  }

  return {
    ok: false,
    code: `HTTP_${status}`,
    message: `GET /api/dhan/freshness returned HTTP ${status} without a structured error envelope.`,
  };
}

export interface RecordedPairCalls {
  readonly quoteCall: W06RecordedDataCall;
  readonly freshnessCall: W06RecordedDataCall;
}

/**
 * Builds single-attempt, read-only HTTP readers targeting IRR's `/api/dhan/quotes` and
 * `/api/dhan/freshness` routes. Never retries and never calls a refresh route.
 */
export function createHttpRevisionCoverageReaders(options: {
  readonly apiBaseUrl: string;
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
  readonly now?: () => Date;
}): {
  readonly readers: RevisionCoverageReaders;
  readonly recordedQuoteCalls: W06RecordedDataCall[];
  readonly recordedFreshnessCalls: W06RecordedDataCall[];
} {
  const fetchFn = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_HTTP_TIMEOUT_MS;
  const baseUrl = options.apiBaseUrl.replace(/\/+$/, '');
  const recordedQuoteCalls: W06RecordedDataCall[] = [];
  const recordedFreshnessCalls: W06RecordedDataCall[] = [];

  const readers: RevisionCoverageReaders = {
    ...(options.now !== undefined ? { now: options.now } : {}),
    readQuote: async (scope) => {
      try {
        const res = await fetchFn(`${baseUrl}/api/dhan/quotes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            companyId: scope.companyId,
            exchangeSegment: scope.exchangeSegment,
            securityId: scope.securityId,
          }),
          redirect: 'error',
          signal: AbortSignal.timeout(timeoutMs),
        });
        const text = await res.text();
        let parsed: unknown = null;
        try {
          parsed = text.trim() === '' ? null : (JSON.parse(text) as unknown);
        } catch {
          parsed = null;
        }
        const outcome = parseQuoteResponseBody(res.status, parsed);
        recordedQuoteCalls.push({
          endpoint: 'POST /api/dhan/quotes',
          httpStatus: res.status,
          ok: outcome.ok,
          code: outcome.ok ? null : outcome.code,
        });
        return outcome;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'quote HTTP request failed';
        recordedQuoteCalls.push({
          endpoint: 'POST /api/dhan/quotes',
          httpStatus: null,
          ok: false,
          code: 'TRANSPORT_FAILURE',
        });
        return {
          ok: false,
          code: 'TRANSPORT_FAILURE',
          message,
          identityFailure: false,
        };
      }
    },
    readFreshness: async (query) => {
      const params = new URLSearchParams({
        domain: query.domain,
        companyId: query.companyId,
        exchangeSegment: query.exchangeSegment,
        securityId: query.securityId,
      });
      try {
        const res = await fetchFn(`${baseUrl}/api/dhan/freshness?${params.toString()}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          redirect: 'error',
          signal: AbortSignal.timeout(timeoutMs),
        });
        const text = await res.text();
        let parsed: unknown = null;
        try {
          parsed = text.trim() === '' ? null : (JSON.parse(text) as unknown);
        } catch {
          parsed = null;
        }
        const outcome = parseFreshnessResponseBody(res.status, parsed);
        recordedFreshnessCalls.push({
          endpoint: 'GET /api/dhan/freshness',
          httpStatus: res.status,
          ok: outcome.ok,
          code: outcome.ok ? null : outcome.code,
        });
        return outcome;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'freshness HTTP request failed';
        recordedFreshnessCalls.push({
          endpoint: 'GET /api/dhan/freshness',
          httpStatus: null,
          ok: false,
          code: 'TRANSPORT_FAILURE',
        });
        return {
          ok: false,
          code: 'TRANSPORT_FAILURE',
          message,
        };
      }
    },
  };

  return { readers, recordedQuoteCalls, recordedFreshnessCalls };
}

/**
 * Builds the `w06-observation-summary.json` artifact from a completed `DhanRevisionCoverageReport`,
 * its handoff exclusions, and the recorded HTTP calls.
 */
export function buildW06ObservationSummary(params: {
  readonly asOf: string;
  readonly portfolioId: string;
  readonly observedCoverageItems: number;
  readonly excludedItems: readonly ExcludedCoverageObservation[];
  readonly report: DhanRevisionCoverageReport;
  readonly recordedQuoteCalls: readonly W06RecordedDataCall[];
  readonly recordedFreshnessCalls: readonly W06RecordedDataCall[];
}): W06ObservationSummary {
  const {
    asOf,
    portfolioId,
    observedCoverageItems,
    excludedItems,
    report,
    recordedQuoteCalls,
    recordedFreshnessCalls,
  } = params;

  let resolvedCallCursor = 0;
  const rows: W06ObservationSummaryRow[] = report.identities.map((entry) => {
    const isResolved = entry.category !== 'IDENTITY_UNRESOLVED';
    let calls: readonly W06RecordedDataCall[] = [];
    if (isResolved) {
      const q = recordedQuoteCalls[resolvedCallCursor];
      const f = recordedFreshnessCalls[resolvedCallCursor];
      resolvedCallCursor += 1;
      calls = [
        q ?? {
          endpoint: 'POST /api/dhan/quotes',
          httpStatus: entry.quotePresent ? 200 : null,
          ok: entry.quoteError === null,
          code: entry.quoteError?.code ?? null,
        },
        f ?? {
          endpoint: 'GET /api/dhan/freshness',
          httpStatus: entry.freshnessError === null ? 200 : null,
          ok: entry.freshnessError === null,
          code: entry.freshnessError?.code ?? null,
        },
      ];
    }

    return {
      rowId: entry.rowId,
      companyId: entry.companyId,
      exchangeSegment: entry.exchangeSegment,
      storedSecurityId: entry.storedSecurityId,
      securityId: entry.securityId,
      identityState: entry.diagnostics?.identityState ?? (isResolved ? 'RESOLVED' : null),
      identityReason: entry.diagnostics?.identityReason ?? null,
      calls,
      category: entry.category,
    };
  });

  const quoteCalls = recordedQuoteCalls.length;
  const freshnessCalls = recordedFreshnessCalls.length;

  return {
    schema: W06_OBSERVATION_SUMMARY_SCHEMA,
    asOf,
    portfolioId,
    capture: report.capture,
    evaluatedAt: report.evaluatedAt,
    providerQualification: report.providerQualification,
    observedCoverageItems,
    excludedItems,
    rows,
    totals: report.totals,
    quoteCalls,
    freshnessCalls,
    totalDataCalls: quoteCalls + freshnessCalls,
    boundary: W06_MEASUREMENT_BOUNDARY,
  };
}

/** Writes UTF-8 JSON without a byte-order mark. */
export function writeJsonUtf8NoBom(filePath: string, value: unknown): void {
  const resolved = resolve(filePath);
  mkdirSync(dirname(resolved), { recursive: true });
  const bytes = Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
  writeFileSync(resolved, bytes);
}

export interface RunW06ObservationOptions {
  readonly apiBaseUrl: string;
  readonly portfolioId: string;
  readonly asOf: string;
  /** Pre-captured revision reference (preferred when running after a W11-DEP1 capture). */
  readonly capture?: CapturedRevisionRef;
  /** Optional expected holdings count from an exact capture file, cross-checked fail-closed. */
  readonly expectedHoldingsCount?: number | null;
  /** Designated output path for the canonical `iips.w06.dhan-revision-coverage/v1` report. */
  readonly reportOutPath?: string;
  /** Designated output path for `w06-observation-summary.json`. */
  readonly summaryOutPath?: string;
  /** Optional output path to retain the exact `/api/investment/coverage` response verbatim. */
  readonly coverageOutPath?: string;
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
  readonly now?: () => Date;
}

export type RunW06ObservationOutcome =
  | {
      readonly ok: true;
      readonly report: DhanRevisionCoverageReport;
      readonly summary: W06ObservationSummary;
      readonly writtenFiles: readonly string[];
    }
  | {
      readonly ok: false;
      readonly code: string;
      readonly message: string;
    };

/**
 * End-to-end read-only W-06 observation workflow:
 *   1. `GET /api/investment/coverage?asOf=<YYYY-MM-DD>`
 *   2. Deterministic Coverage-to-W-06 projection (`projectCoverageReportToW06Rows`)
 *   3. Revision binding verification (pre-supplied `CapturedRevisionRef` or read-only
 *      `GET /api/user-portfolios/:portfolioId`, cross-checked against `raw.portfolioRevision`
 *      and holding count)
 *   4. Single-pass `measureDhanRevisionCoverage` over `/api/dhan/quotes` + `/api/dhan/freshness`
 *   5. Writes only the designated evidence JSON files (UTF-8 without BOM).
 */
export async function runW06CoverageObservation(
  options: RunW06ObservationOptions,
): Promise<RunW06ObservationOutcome> {
  const urlCheck = validateLoopbackApiBaseUrl(options.apiBaseUrl);
  if (!urlCheck.ok) return urlCheck;

  if (!ISO_DATE_PATTERN.test(options.asOf)) {
    return {
      ok: false,
      code: 'INVALID_AS_OF_DATE',
      message: 'asOf must be an ISO calendar date (YYYY-MM-DD).',
    };
  }
  if (
    typeof options.portfolioId !== 'string' ||
    options.portfolioId.trim() === '' ||
    options.portfolioId !== options.portfolioId.trim()
  ) {
    return {
      ok: false,
      code: 'INVALID_PORTFOLIO_ID',
      message: 'portfolioId must be a non-empty trimmed string.',
    };
  }

  const fetchFn = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_HTTP_TIMEOUT_MS;
  const now = options.now ?? (() => new Date());
  const baseUrl = urlCheck.baseUrl;
  const portfolioId = options.portfolioId;

  // 1. Fetch `/api/investment/coverage?asOf=...` once (read-only).
  let coverageStatus: number;
  let coverageJson: unknown;
  try {
    const res = await fetchFn(
      `${baseUrl}/api/investment/coverage?asOf=${encodeURIComponent(options.asOf)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        redirect: 'error',
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
    coverageStatus = res.status;
    coverageJson = JSON.parse(await res.text()) as unknown;
  } catch (error) {
    return {
      ok: false,
      code: 'COVERAGE_FETCH_FAILED',
      message:
        error instanceof Error
          ? `Failed to read GET /api/investment/coverage: ${error.message}`
          : 'Failed to read GET /api/investment/coverage.',
    };
  }

  if (coverageStatus !== 200 || !isPlainObject(coverageJson) || !Array.isArray(coverageJson.items)) {
    return {
      ok: false,
      code: 'COVERAGE_ROUTE_UNAVAILABLE',
      message: `GET /api/investment/coverage returned HTTP ${coverageStatus} without a valid coverage report.`,
    };
  }

  // 2. Project coverage items onto W-06 rows + excludedItems.
  const projected = projectCoverageReportToW06Rows(coverageJson, portfolioId);
  if (!projected.ok) return projected;

  // 3. Establish and cross-check CapturedRevisionRef.
  let capture: CapturedRevisionRef;
  if (options.capture !== undefined) {
    const refCheck = validateCapturedRevisionRef(options.capture);
    if (!refCheck.ok) return refCheck;
    if (options.capture.portfolioId !== portfolioId) {
      return {
        ok: false,
        code: 'PORTFOLIO_MISMATCH',
        message: `capture.portfolioId "${options.capture.portfolioId}" disagrees with "${portfolioId}".`,
      };
    }
    if (
      typeof options.expectedHoldingsCount === 'number' &&
      options.expectedHoldingsCount !== projected.rows.length
    ) {
      return {
        ok: false,
        code: 'HOLDINGS_COUNT_MISMATCH',
        message: `capture holdings count (${options.expectedHoldingsCount}) disagrees with in-scope coverage rows (${projected.rows.length}).`,
      };
    }
    capture = options.capture;
  } else {
    let detailStatus: number;
    let detailJson: unknown;
    try {
      const res = await fetchFn(
        `${baseUrl}/api/user-portfolios/${encodeURIComponent(portfolioId)}`,
        {
          method: 'GET',
          headers: { Accept: 'application/json' },
          redirect: 'error',
          signal: AbortSignal.timeout(timeoutMs),
        },
      );
      detailStatus = res.status;
      detailJson = JSON.parse(await res.text()) as unknown;
    } catch (error) {
      return {
        ok: false,
        code: 'PORTFOLIO_DETAIL_FETCH_FAILED',
        message:
          error instanceof Error
            ? `Failed to read GET /api/user-portfolios/${portfolioId}: ${error.message}`
            : `Failed to read GET /api/user-portfolios/${portfolioId}.`,
      };
    }
    const portfolioObj =
      detailStatus === 200 && isPlainObject(detailJson) && isPlainObject(detailJson.portfolio)
        ? detailJson.portfolio
        : null;
    if (portfolioObj === null) {
      return {
        ok: false,
        code: 'PORTFOLIO_DETAIL_UNAVAILABLE',
        message: `GET /api/user-portfolios/${portfolioId} returned HTTP ${detailStatus}; cannot establish revision binding.`,
      };
    }
    const candidate: CapturedRevisionRef = {
      portfolioId: typeof portfolioObj.portfolioId === 'string' ? portfolioObj.portfolioId : '',
      revision: typeof portfolioObj.revision === 'number' ? portfolioObj.revision : Number.NaN,
      provenanceDigest:
        typeof portfolioObj.provenanceDigest === 'string' ? portfolioObj.provenanceDigest : '',
      capturedAt: now().toISOString(),
    };
    const refCheck = validateCapturedRevisionRef(candidate);
    if (!refCheck.ok) return refCheck;
    if (candidate.portfolioId !== portfolioId) {
      return {
        ok: false,
        code: 'PORTFOLIO_MISMATCH',
        message: `portfolio detail returned "${candidate.portfolioId}", expected "${portfolioId}".`,
      };
    }
    if (
      typeof portfolioObj.totalHoldingsCount === 'number' &&
      portfolioObj.totalHoldingsCount !== projected.rows.length
    ) {
      return {
        ok: false,
        code: 'HOLDINGS_COUNT_MISMATCH',
        message: `portfolio detail totalHoldingsCount (${portfolioObj.totalHoldingsCount}) disagrees with in-scope coverage rows (${projected.rows.length}).`,
      };
    }
    capture = candidate;
  }

  // Fail closed if any in-scope coverage item carries a projected `raw.portfolioRevision` that
  // disagrees with the bound revision.
  for (const rawItem of coverageJson.items) {
    if (!isPlainObject(rawItem)) continue;
    if (rawItem.source !== 'HOLDING' || rawItem.portfolioId !== portfolioId) continue;
    const raw = isPlainObject(rawItem.raw) ? rawItem.raw : null;
    if (raw !== null && hasOwn(raw, 'portfolioRevision') && raw.portfolioRevision !== null) {
      if (raw.portfolioRevision !== capture.revision) {
        return {
          ok: false,
          code: 'REVISION_DRIFT',
          message: `coverage item ${String(rawItem.observationId)} carries portfolioRevision=${String(raw.portfolioRevision)}, expected revision ${capture.revision}.`,
        };
      }
    }
  }

  // 4. Invoke single-pass W-06 measurement with read-only HTTP readers.
  const { readers, recordedQuoteCalls, recordedFreshnessCalls } = createHttpRevisionCoverageReaders({
    apiBaseUrl: baseUrl,
    fetchImpl: fetchFn,
    timeoutMs,
    now,
  });

  const measured = await measureDhanRevisionCoverage(capture, projected.rows, readers);
  if (!measured.ok) return measured;

  const summary = buildW06ObservationSummary({
    asOf: options.asOf,
    portfolioId,
    observedCoverageItems: projected.observedItems,
    excludedItems: projected.excludedItems,
    report: measured.report,
    recordedQuoteCalls,
    recordedFreshnessCalls,
  });

  // 5. Write only the designated evidence output files.
  const writtenFiles: string[] = [];
  try {
    if (options.coverageOutPath !== undefined) {
      writeJsonUtf8NoBom(options.coverageOutPath, coverageJson);
      writtenFiles.push(resolve(options.coverageOutPath));
    }
    if (options.reportOutPath !== undefined) {
      writeJsonUtf8NoBom(options.reportOutPath, measured.report);
      writtenFiles.push(resolve(options.reportOutPath));
    }
    if (options.summaryOutPath !== undefined) {
      writeJsonUtf8NoBom(options.summaryOutPath, summary);
      writtenFiles.push(resolve(options.summaryOutPath));
    }
  } catch (error) {
    return {
      ok: false,
      code: 'OUTPUT_WRITE_FAILURE',
      message: error instanceof Error ? error.message : 'failed to write W-06 output files.',
    };
  }

  return {
    ok: true,
    report: measured.report,
    summary,
    writtenFiles,
  };
}
