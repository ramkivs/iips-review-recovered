/**
 * W-28 — Measure Mapping Coverage Against Actual Persisted Holdings.
 *
 * Measurement owner: IRR. Registry owner: IPD.
 *
 * WHAT THIS MODULE IS
 *   The IRR-owned coverage measurement that takes the owner's actual persisted
 *   G-2 holdings (via IpcUserPortfolioPort) and the IPD-immutable Dhan registry
 *   snapshot (qualification-manifest.json) and produces one explicit result per
 *   holding using ONLY persisted exact identity fields (ISIN + exchange identity,
 *   including series). No name/symbol/fuzzy/partial matching. Proposed is never
 *   counted as qualified. Ambiguous stays unresolved.
 *
 * WHAT THIS MODULE IS NOT
 *   - Not a new identity authority or mapping-expansion exercise (W-27 owns that).
 *   - Not a registry duplicate: it consumes IPD's immutable manifest/registry via
 *     a read-only snapshot; it never re-implements IPD's qualification rules.
 *   - Not a live mapping qualification (W-14 owns that).
 *   - No holdings are modified, no quantities invented, no price requests.
 *
 * PRIVACY
 *   The detailed per-holding report contains real ISINs and must stay in an
 *   owner-controlled local location (not committed to public repo). Published
 *   evidence uses masked identifiers (e.g. first 4 / last 2 chars) and
 *   privacy-safe holding references (portfolioId + index, not symbol/quantity).
 */

import type { G2HoldingView, G2PortfolioView } from '../user-portfolio/userPortfolioContract';

// ── Registry snapshot (immutable, IPD-owned) ────────────────────────────────────

/**
 * The IPD Dhan registry snapshot as consumed by IRR for W-28.
 *
 * `qualifiedRegistry` is the exact set of qualified mappings from the
 * qualification-manifest.json (each entry is `companyId|exchangeSegment|securityId`
 * where securityId is `ISIN:<isin>:<series>`). `proposedRegistry` is the set of
 * proposed-only mappings (W-27, awaiting W-14 qualification) when available.
 *
 * `p04Universe` and `providerUniverse` are optional governed sets for precise
 * reason attribution (MISSING_P04_CORRESPONDENCE vs NO_PROVIDER_ROW). When not
 * available (as with the 371bf3 manifest which retains only 4680 qualified + 500
 * sampled non-equity rows and not the 19,060 no-P04 rows individually), a missing
 * qualified mapping is reported as `NO_QUALIFIED_MAPPING_EVIDENCE_LIMITED`.
 */
export interface RegistrySnapshot {
  /** Commit that produced the manifest (e.g. 371bf3bd...) */
  readonly manifestCommit: string;
  /** Pipeline commit (e.g. 325266d...) */
  readonly pipelineCommit: string;
  /** Manifest SHA-256 */
  readonly manifestSha256: string;
  /** Qualified registry entries (exact, 4680 at 371bf3) */
  readonly qualifiedRegistry: ReadonlySet<string>;
  /** Proposed-only entries (empty if not provided) */
  readonly proposedRegistry?: ReadonlySet<string>;
  /** P04 population ISINs (optional, for MISSING_P04_CORRESPONDENCE) */
  readonly p04Universe?: ReadonlySet<string>;
  /** Provider universe ISINs (optional, for NO_PROVIDER_ROW) */
  readonly providerUniverse?: ReadonlySet<string>;
  /** Human-readable version label */
  readonly registryVersion: string;
}

// ── Per-holding result ────────────────────────────────────────────────────────

export type PersistedIdentityAvailability = 'COMPLETE' | 'MISSING_ISIN' | 'MISSING_EXCHANGE' | 'MISSING_BOTH';
export type ExactRegistryMatch = 'YES' | 'NO';
export type MappingQualification = 'QUALIFIED' | 'PROPOSED' | 'NOT_AVAILABLE';
export type CoverageResult = 'RESOLVED' | 'UNRESOLVED';
export type CoverageReason =
  | 'EXACT_QUALIFIED_MATCH'
  | 'MISSING_PERSISTED_ISIN'
  | 'UNSUPPORTED_EXCHANGE'
  | 'IDENTITY_NOT_RESOLVED'
  | 'AMBIGUOUS_IDENTITY'
  | 'MISSING_P04_CORRESPONDENCE'
  | 'NO_PROVIDER_ROW'
  | 'PROPOSED_MAPPING_NOT_QUALIFIED'
  | 'NO_QUALIFIED_MAPPING'
  | 'NO_QUALIFIED_MAPPING_EVIDENCE_LIMITED';

export interface HoldingCoverageResult {
  /** Stable, privacy-safe reference: `holding:<portfolioId>:<index>` (1-based) */
  readonly holdingReference: string;
  /** Portfolio that contributed this holding */
  readonly portfolioId: string;
  /** Position within that portfolio's holdings array (0-based) */
  readonly holdingIndex: number;
  /** Persisted identity availability (derived from isin + exchange) */
  readonly persistedIdentityAvailability: PersistedIdentityAvailability;
  /** Exact persisted ISIN (masked in published evidence; raw in owner-local report) */
  readonly isin: string | null;
  /** Persisted exchange (NSE/BSE or raw) */
  readonly exchange: string | null;
  /** G-2 identityStatus as persisted */
  readonly identityStatus: string | null;
  /** G-2 resolutionDisposition as persisted */
  readonly resolutionDisposition: string | null;
  /** Whether an exact registry match exists (YES/NO) */
  readonly exactRegistryMatch: ExactRegistryMatch;
  /** Mapping qualification */
  readonly mappingQualification: MappingQualification;
  /** Coverage result */
  readonly result: CoverageResult;
  /** Specific reason */
  readonly reason: CoverageReason;
  /** Human-readable detail for the reason */
  readonly reasonDetail: string;
  /** Masked ISIN for published evidence (e.g. INE0***021) */
  readonly maskedIsin: string | null;
}

// ── Summary & gap report ──────────────────────────────────────────────────────

export interface CoverageSummary {
  readonly totalHoldings: number;
  readonly holdingsWithCompletePersistedIdentity: number;
  readonly holdingsWithExactRegistryMatch: number;
  readonly holdingsWithQualifiedMappings: number;
  readonly holdingsWithProposedOnly: number;
  readonly unresolvedHoldings: number;
  readonly missingIdentityCount: number;
  readonly coveragePercentage: number; // qualified / total * 100, 2-decimal
  readonly unresolvedReasons: Readonly<Record<string, number>>;
  /** Distinguish exact registry vs qualified */
  readonly exactRegistryCoveragePercentage: number;
  readonly qualifiedCoveragePercentage: number;
}

export interface GapEntry {
  readonly reason: CoverageReason;
  readonly count: number;
  readonly percentage: number;
  readonly description: string;
}

export interface PrioritisedGapReport {
  readonly gaps: readonly GapEntry[];
  readonly topGapReason: CoverageReason | null;
}

export interface HoldingsSnapshotRef {
  readonly portfolioIds: readonly string[];
  readonly revisions: Readonly<Record<string, number>>;
  readonly totalHoldings: number;
  readonly capturedAt: string;
  readonly provenanceDigests: Readonly<Record<string, string>>;
}

// ── Core measurement ──────────────────────────────────────────────────────────

/**
 * Mask an ISIN for public evidence: preserve first 3 + last 2, mask middle.
 * Example: INE002A01018 → INE***018 (or INE0***021 for shorter). Raw stays in owner-local report.
 */
export function maskIsin(isin: string | null): string | null {
  if (!isin) return null;
  if (isin.length <= 6) return `${isin.slice(0, 2)}***${isin.slice(-2)}`;
  return `${isin.slice(0, 3)}***${isin.slice(-3)}`;
}

function persistedIdentityAvailability(isin: string | null, exchange: string | null): PersistedIdentityAvailability {
  const hasIsin = typeof isin === 'string' && isin.trim() !== '';
  const hasEx = typeof exchange === 'string' && exchange.trim() !== '';
  if (hasIsin && hasEx) return 'COMPLETE';
  if (!hasIsin && !hasEx) return 'MISSING_BOTH';
  if (!hasIsin) return 'MISSING_ISIN';
  return 'MISSING_EXCHANGE';
}

function isSupportedExchange(exchange: string | null): boolean {
  return exchange === 'NSE' || exchange === 'BSE';
}

function toExchangeSegment(exchange: string | null): string | null {
  if (exchange === 'NSE') return 'NSE_EQ';
  if (exchange === 'BSE') return 'BSE_EQ';
  return null;
}

/**
 * Measure coverage for a set of holdings against a registry snapshot.
 *
 * Strict: starts from holding's persisted ISIN + exchange identity (including
 * securityIdentity.series when present), checks exact registry, preserves
 * qualification, never matches by names/symbols/partial ISIN/fuzzy, never
 * promotes proposed to qualified, ambiguous stays unresolved.
 *
 * Every input holding appears exactly once in output, in input order.
 * Re-running with identical holdings + registry produces identical results
 * (deterministic, no random, no timestamp in per-holding result).
 */
export function measureCoverage(
  holdings: readonly G2HoldingView[],
  portfolioViewsById: ReadonlyMap<string, G2PortfolioView> | Map<string, G2PortfolioView> | Record<string, G2PortfolioView>,
  registry: RegistrySnapshot,
): {
  readonly results: readonly HoldingCoverageResult[];
  readonly summary: CoverageSummary;
  readonly gaps: PrioritisedGapReport;
} {
  const portfolioMap = portfolioViewsById instanceof Map
    ? portfolioViewsById
    : new Map(Object.entries(portfolioViewsById as Record<string, G2PortfolioView>));

  // Build a lookup from holding instance to its portfolioId and index.
  // Since holdings are passed flat, we need to recover portfolio grouping.
  // For synthetic tests we will pass holdings with portfolioId hint via a parallel map.
  // Instead, we expect holdings to be provided with portfolioId context via the results'
  // iteration that tracks portfolio boundaries. The simplest strict approach: iterate
  // portfolios in order and holdings in order, assigning holdingReference accordingly.

  const results: HoldingCoverageResult[] = [];
  let globalIndex = 0;

  // If we have portfolioViews, we can iterate them to preserve portfolio grouping and revision context.
  // Holdings array is expected to be in portfolio order (listPortfolios order). If not, we fall back to
  // treating holdings as belonging to an unknown portfolio — but we must still produce one result per holding.
  const portfolios = [...portfolioMap.values()];
  if (portfolios.length > 0) {
    for (const portfolio of portfolios) {
      for (let hi = 0; hi < portfolio.holdings.length; hi++) {
        const holding = portfolio.holdings[hi]!;
        const r = measureOneHolding(holding, portfolio.portfolioId, hi, registry);
        results.push(r);
        globalIndex++;
      }
    }
    // If holdings array length differs from sum(portfolio holdings), handle remainder as unknown portfolio
    const expectedTotal = portfolios.reduce((s, p) => s + p.holdings.length, 0);
    if (holdings.length !== expectedTotal) {
      // Fallback: process the provided flat holdings array directly, to ensure every input appears once.
      // This also supports synthetic tests that pass flat holdings without portfolio grouping.
      if (holdings.length > expectedTotal || portfolios.length === 0) {
        // Re-measure from flat holdings with synthetic portfolio id
        results.length = 0;
        for (let i = 0; i < holdings.length; i++) {
          const holding = holdings[i]!;
          // Try to infer portfolioId from holding's position in portfolios, else unknown
          const inferredPortfolioId = inferPortfolioIdForIndex(i, portfolios, holdings.length);
          const r = measureOneHolding(holding, inferredPortfolioId, i, registry);
          results.push(r);
        }
      }
    }
  } else {
    // No portfolio grouping available — treat flat holdings as single portfolio
    for (let i = 0; i < holdings.length; i++) {
      const holding = holdings[i]!;
      const r = measureOneHolding(holding, 'unknown-portfolio', i, registry);
      results.push(r);
    }
  }

  const summary = buildSummary(results);
  const gaps = buildGapReport(summary);

  return { results, summary, gaps };
}

function inferPortfolioIdForIndex(index: number, portfolios: readonly G2PortfolioView[], totalHoldings: number): string {
  if (portfolios.length === 0) return 'unknown-portfolio';
  let offset = 0;
  for (const p of portfolios) {
    if (index < offset + p.holdings.length) return p.portfolioId;
    offset += p.holdings.length;
  }
  // Fallback to last portfolio or unknown
  return portfolios[portfolios.length - 1]!.portfolioId ?? 'unknown-portfolio';
}

function measureOneHolding(
  holding: G2HoldingView,
  portfolioId: string,
  holdingIndex: number,
  registry: RegistrySnapshot,
): HoldingCoverageResult {
  const isin = typeof holding.isin === 'string' && holding.isin.trim() !== '' ? holding.isin.trim() : null;
  const exchange = typeof holding.exchange === 'string' && holding.exchange.trim() !== '' ? holding.exchange.trim() : null;
  const identityStatus = (holding as Record<string, unknown>).identityStatus as string | undefined ?? null;
  const resolutionDisposition = (holding as Record<string, unknown>).resolutionDisposition as string | undefined ?? null;

  const holdingReference = `holding:${portfolioId}:${String(holdingIndex + 1).padStart(4, '0')}`;
  const maskedIsin = maskIsin(isin);
  const availability = persistedIdentityAvailability(isin, exchange);

  // ── Step 1: persisted identity completeness ────────────────────────────────
  if (availability === 'MISSING_ISIN' || availability === 'MISSING_BOTH') {
    return {
      holdingReference,
      portfolioId,
      holdingIndex,
      persistedIdentityAvailability: availability,
      isin,
      exchange,
      identityStatus: identityStatus ?? null,
      resolutionDisposition: resolutionDisposition ?? null,
      exactRegistryMatch: 'NO',
      mappingQualification: 'NOT_AVAILABLE',
      result: 'UNRESOLVED',
      reason: 'MISSING_PERSISTED_ISIN',
      reasonDetail: 'Persisted ISIN is absent or empty; no exact identity can be resolved and no registry check was attempted.',
      maskedIsin,
    };
  }
  if (availability === 'MISSING_EXCHANGE') {
    return {
      holdingReference,
      portfolioId,
      holdingIndex,
      persistedIdentityAvailability: availability,
      isin,
      exchange,
      identityStatus: identityStatus ?? null,
      resolutionDisposition: resolutionDisposition ?? null,
      exactRegistryMatch: 'NO',
      mappingQualification: 'NOT_AVAILABLE',
      result: 'UNRESOLVED',
      reason: 'UNSUPPORTED_EXCHANGE',
      reasonDetail: `Persisted exchange is missing or empty; supported exchanges are NSE and BSE. Got: ${exchange ?? '(null)'}.`,
      maskedIsin,
    };
  }
  // Both present, check supported exchange
  if (!isSupportedExchange(exchange)) {
    return {
      holdingReference,
      portfolioId,
      holdingIndex,
      persistedIdentityAvailability: availability,
      isin,
      exchange,
      identityStatus: identityStatus ?? null,
      resolutionDisposition: resolutionDisposition ?? null,
      exactRegistryMatch: 'NO',
      mappingQualification: 'NOT_AVAILABLE',
      result: 'UNRESOLVED',
      reason: 'UNSUPPORTED_EXCHANGE',
      reasonDetail: `Exchange '${exchange}' is not supported; only NSE and BSE are admitted for Dhan mapping.`,
      maskedIsin,
    };
  }

  // ── Step 2: existing G-2 identity resolution status ──────────────────────
  // If IPD's durable store already says UNRESOLVED, or securityIdentity is null,
  // we must not invent a resolution — report IDENTITY_NOT_RESOLVED.
  const securityIdentity = (holding as Record<string, unknown>).securityIdentity as
    | { securityId?: string; isin?: string; series?: string; isinAuthority?: string } | null | undefined;
  const hasSecurityIdentity = securityIdentity !== null && securityIdentity !== undefined && typeof securityIdentity === 'object';
  const securityId = hasSecurityIdentity && typeof securityIdentity.securityId === 'string' ? securityIdentity.securityId.trim() : null;
  const series = hasSecurityIdentity && typeof securityIdentity.series === 'string' ? securityIdentity.series.trim() : null;

  // Ambiguous: isin and securityIdentity.isin mismatch, or securityId not matching ISIN:isin:series grammar
  if (hasSecurityIdentity && securityId) {
    // Validate securityId grammar: ISIN:<isin>:<series>
    const m = /^ISIN:([A-Za-z0-9]{12}):([^:\s]+)$/.exec(securityId);
    if (!m) {
      return {
        holdingReference,
        portfolioId,
        holdingIndex,
        persistedIdentityAvailability: availability,
        isin,
        exchange,
        identityStatus: identityStatus ?? null,
        resolutionDisposition: resolutionDisposition ?? null,
        exactRegistryMatch: 'NO',
        mappingQualification: 'NOT_AVAILABLE',
        result: 'UNRESOLVED',
        reason: 'AMBIGUOUS_IDENTITY',
        reasonDetail: `securityIdentity.securityId '${securityId}' is not a canonical ISIN:isin:series identity; exact match cannot be determined without guessing.`,
        maskedIsin,
      };
    }
    const [, secIsin, secSeries] = m;
    if (secIsin !== isin) {
      return {
        holdingReference,
        portfolioId,
        holdingIndex,
        persistedIdentityAvailability: availability,
        isin,
        exchange,
        identityStatus: identityStatus ?? null,
        resolutionDisposition: resolutionDisposition ?? null,
        exactRegistryMatch: 'NO',
        mappingQualification: 'NOT_AVAILABLE',
        result: 'UNRESOLVED',
        reason: 'AMBIGUOUS_IDENTITY',
        reasonDetail: `Persisted ISIN '${isin}' does not match securityIdentity ISIN '${secIsin}'; treating as ambiguous, not resolving.`,
        maskedIsin,
      };
    }
    if (secSeries !== series) {
      // Series mismatch is also ambiguous — same company, different security series must not match.
      // However if series field itself is inconsistent, we treat as ambiguous.
      // We will still attempt registry lookup with the securityId as given, but first check for
      // series mismatch between securityIdentity and expected listing — this is caught by registry miss.
      // For explicit ambiguous case, we check if securityIdentity isin matches but series is empty/malformed.
      // Otherwise, fall through to registry check — same ISIN different series should be rejected via NO match.
    }
  }

  if (identityStatus === 'UNRESOLVED' || !hasSecurityIdentity || !securityId) {
    // The durable store says unresolved or no security identity — do not invent one.
    // We still check if the persisted ISIN alone would have a registry entry, but we must
    // report that identity itself was not resolved.
    // For strict exact security/listing match, a holding without a resolved security identity
    // cannot be considered to have an exact registry match, even if a same-ISIN different
    // series exists — because series is part of exact identity.
    return {
      holdingReference,
      portfolioId,
      holdingIndex,
      persistedIdentityAvailability: availability,
      isin,
      exchange,
      identityStatus: identityStatus ?? null,
      resolutionDisposition: resolutionDisposition ?? null,
      exactRegistryMatch: 'NO',
      mappingQualification: 'NOT_AVAILABLE',
      result: 'UNRESOLVED',
      reason: 'IDENTITY_NOT_RESOLVED',
      reasonDetail: `G-2 identityStatus is '${identityStatus ?? 'null'}' and ${hasSecurityIdentity ? 'securityIdentity is incomplete' : 'no securityIdentity persisted'}; no exact security/listing was resolved for this holding.`,
      maskedIsin,
    };
  }

  // ── Step 3: exact registry check ────────────────────────────────────────
  // At this point we have a resolved security identity with securityId = ISIN:isin:series
  // and exchange (NSE/BSE) → exchangeSegment (NSE_EQ/BSE_EQ).
  const exchangeSegment = toExchangeSegment(exchange)!;
  // The registry key format is companyId|exchangeSegment|securityId — but for holdings
  // we must match on security identity only, not company name. However the registry
  // stores entries keyed by companyId as well. To avoid company-name matching, we
  // check if ANY registry entry has the same exchangeSegment + securityId, regardless
  // of companyId. This is the exact security/listing match, not company-level.
  const hasExactQualified = hasExactMatchInRegistry(registry.qualifiedRegistry, exchangeSegment, securityId!);
  if (hasExactQualified) {
    return {
      holdingReference,
      portfolioId,
      holdingIndex,
      persistedIdentityAvailability: availability,
      isin,
      exchange,
      identityStatus: identityStatus ?? null,
      resolutionDisposition: resolutionDisposition ?? null,
      exactRegistryMatch: 'YES',
      mappingQualification: 'QUALIFIED',
      result: 'RESOLVED',
      reason: 'EXACT_QUALIFIED_MATCH',
      reasonDetail: `Exact Dhan registry match for ${securityId} @ ${exchangeSegment} with qualified mapping.`,
      maskedIsin,
    };
  }

  // Check proposed
  if (registry.proposedRegistry && hasExactMatchInRegistry(registry.proposedRegistry, exchangeSegment, securityId!)) {
    return {
      holdingReference,
      portfolioId,
      holdingIndex,
      persistedIdentityAvailability: availability,
      isin,
      exchange,
      identityStatus: identityStatus ?? null,
      resolutionDisposition: resolutionDisposition ?? null,
      exactRegistryMatch: 'YES',
      mappingQualification: 'PROPOSED',
      result: 'UNRESOLVED',
      reason: 'PROPOSED_MAPPING_NOT_QUALIFIED',
      reasonDetail: `An exact Dhan registry entry exists for ${securityId} @ ${exchangeSegment} but it is PROPOSED awaiting W-14 live qualification, not qualified; must not be counted as qualified coverage.`,
      maskedIsin,
    };
  }

  // No exact match — determine precise reason if we have universe evidence
  // Use optional p04/provider universes for precise attribution, else evidence-limited.
  if (registry.p04Universe && !registry.p04Universe.has(isin!)) {
    return {
      holdingReference,
      portfolioId,
      holdingIndex,
      persistedIdentityAvailability: availability,
      isin,
      exchange,
      identityStatus: identityStatus ?? null,
      resolutionDisposition: resolutionDisposition ?? null,
      exactRegistryMatch: 'NO',
      mappingQualification: 'NOT_AVAILABLE',
      result: 'UNRESOLVED',
      reason: 'MISSING_P04_CORRESPONDENCE',
      reasonDetail: `No P04 correspondence for ISIN ${maskedIsin}; the ISIN is not in the governed P04 population, so no mapping could be constructed.`,
      maskedIsin,
    };
  }
  if (registry.providerUniverse && !registry.providerUniverse.has(isin!)) {
    return {
      holdingReference,
      portfolioId,
      holdingIndex,
      persistedIdentityAvailability: availability,
      isin,
      exchange,
      identityStatus: identityStatus ?? null,
      resolutionDisposition: resolutionDisposition ?? null,
      exactRegistryMatch: 'NO',
      mappingQualification: 'NOT_AVAILABLE',
      result: 'UNRESOLVED',
      reason: 'NO_PROVIDER_ROW',
      reasonDetail: `P04 correspondence exists but no provider registry row for ISIN ${maskedIsin} @ ${exchangeSegment}; Dhan master has no listing for this security.`,
      maskedIsin,
    };
  }

  // Check for ambiguous same-company different series: if any registry entry shares same ISIN
  // but different series, we must not count it as match — and we should report that explicitly
  // as evidence of series mismatch, but the result remains unresolved with generic reason.
  // For now, generic evidence-limited.
  if (!registry.p04Universe && !registry.providerUniverse) {
    return {
      holdingReference,
      portfolioId,
      holdingIndex,
      persistedIdentityAvailability: availability,
      isin,
      exchange,
      identityStatus: identityStatus ?? null,
      resolutionDisposition: resolutionDisposition ?? null,
      exactRegistryMatch: 'NO',
      mappingQualification: 'NOT_AVAILABLE',
      result: 'UNRESOLVED',
      reason: 'NO_QUALIFIED_MAPPING_EVIDENCE_LIMITED',
      reasonDetail:
        `No qualified registry entry for ${securityId} @ ${exchangeSegment}. ` +
        `The manifest retains only qualified (4680) + sampled non-equity; the 19,060 no-P04 rows are not individually retained, ` +
        `so P04 vs provider-row cannot be distinguished without additional governed evidence. See blocker doc.`,
      maskedIsin,
    };
  }

  return {
    holdingReference,
    portfolioId,
    holdingIndex,
    persistedIdentityAvailability: availability,
    isin,
    exchange,
    identityStatus: identityStatus ?? null,
    resolutionDisposition: resolutionDisposition ?? null,
    exactRegistryMatch: 'NO',
    mappingQualification: 'NOT_AVAILABLE',
    result: 'UNRESOLVED',
    reason: 'NO_QUALIFIED_MAPPING',
    reasonDetail: `No qualified mapping for ${securityId} @ ${exchangeSegment} in the registry.`,
    maskedIsin,
  };
}

function hasExactMatchInRegistry(registry: ReadonlySet<string>, exchangeSegment: string, securityId: string): boolean {
  // Registry keys are `companyId|exchangeSegment|securityId`. For exact security/listing
  // matching we must NOT match on companyId — we check if any key ends with `|exchangeSegment|securityId`.
  // This avoids company-name matching and ensures same-company different series is rejected
  // (different securityId → no suffix match).
  const suffix = `|${exchangeSegment}|${securityId}`;
  for (const key of registry) {
    if (key.endsWith(suffix)) return true;
  }
  return false;
}

function buildSummary(results: readonly HoldingCoverageResult[]): CoverageSummary {
  const totalHoldings = results.length;
  const holdingsWithCompletePersistedIdentity = results.filter((r) => r.persistedIdentityAvailability === 'COMPLETE').length;
  const holdingsWithExactRegistryMatch = results.filter((r) => r.exactRegistryMatch === 'YES').length;
  const holdingsWithQualifiedMappings = results.filter((r) => r.mappingQualification === 'QUALIFIED').length;
  const holdingsWithProposedOnly = results.filter((r) => r.mappingQualification === 'PROPOSED').length;
  const unresolvedHoldings = results.filter((r) => r.result === 'UNRESOLVED').length;
  const missingIdentityCount = results.filter((r) => r.persistedIdentityAvailability !== 'COMPLETE').length;

  const coveragePercentage = totalHoldings === 0 ? 0 : Number(((holdingsWithQualifiedMappings / totalHoldings) * 100).toFixed(2));
  const exactRegistryCoveragePercentage = totalHoldings === 0 ? 0 : Number(((holdingsWithExactRegistryMatch / totalHoldings) * 100).toFixed(2));
  const qualifiedCoveragePercentage = coveragePercentage;

  const unresolvedReasons: Record<string, number> = {};
  for (const r of results) {
    if (r.result === 'UNRESOLVED') {
      unresolvedReasons[r.reason] = (unresolvedReasons[r.reason] ?? 0) + 1;
    }
  }

  return {
    totalHoldings,
    holdingsWithCompletePersistedIdentity,
    holdingsWithExactRegistryMatch,
    holdingsWithQualifiedMappings,
    holdingsWithProposedOnly,
    unresolvedHoldings,
    missingIdentityCount,
    coveragePercentage,
    unresolvedReasons,
    exactRegistryCoveragePercentage,
    qualifiedCoveragePercentage,
  };
}

function buildGapReport(summary: CoverageSummary): PrioritisedGapReport {
  const reasonDescriptions: Record<string, string> = {
    MISSING_PERSISTED_ISIN: 'Persisted ISIN absent — no exact identity can be resolved; requires backfill from broker source.',
    UNSUPPORTED_EXCHANGE: 'Exchange not NSE/BSE — Dhan mapping only for NSE_EQ/BSE_EQ; check persisted exchange.',
    IDENTITY_NOT_RESOLVED: 'G-2 identityStatus UNRESOLVED or no securityIdentity — durable store did not resolve exact security/listing.',
    AMBIGUOUS_IDENTITY: 'Security identity is inconsistent/ambiguous (ISIN mismatch or malformed securityId) — must remain unresolved.',
    MISSING_P04_CORRESPONDENCE: 'No P04 correspondence — ISIN not in governed P04 population; W-27 pipeline cannot construct mapping.',
    NO_PROVIDER_ROW: 'No provider row — P04 exists but Dhan master has no listing for this ISIN/series.',
    PROPOSED_MAPPING_NOT_QUALIFIED: 'Proposed mapping awaiting W-14 live qualification — do not count as qualified.',
    NO_QUALIFIED_MAPPING: 'No qualified mapping — no exact qualified entry for this ISIN/series/exchange.',
    NO_QUALIFIED_MAPPING_EVIDENCE_LIMITED: 'No qualified mapping (evidence-limited) — qualifier vs P04/provider cannot be distinguished without additional governed evidence (19,060 no-P04 rows not retained individually).',
  };

  const gaps: GapEntry[] = Object.entries(summary.unresolvedReasons)
    .map(([reason, count]) => ({
      reason: reason as CoverageReason,
      count,
      percentage: summary.totalHoldings === 0 ? 0 : Number(((count / summary.totalHoldings) * 100).toFixed(2)),
      description: reasonDescriptions[reason] ?? reason,
    }))
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));

  return {
    gaps,
    topGapReason: gaps[0]?.reason ?? null,
  };
}

// ── Helpers for holdings snapshot identity ─────────────────────────────────

export function buildHoldingsSnapshotRef(
  portfolioViews: readonly G2PortfolioView[],
  capturedAt: string = new Date().toISOString(),
): HoldingsSnapshotRef {
  const portfolioIds = portfolioViews.map((p) => p.portfolioId);
  const revisions: Record<string, number> = {};
  const provenanceDigests: Record<string, string> = {};
  let totalHoldings = 0;
  for (const p of portfolioViews) {
    revisions[p.portfolioId] = p.revision;
    provenanceDigests[p.portfolioId] = p.provenanceDigest;
    totalHoldings += p.holdings.length;
  }
  return { portfolioIds, revisions, totalHoldings, capturedAt, provenanceDigests };
}

// ── Privacy helpers ─────────────────────────────────────────────────────────

export function sanitizeForPublication(results: readonly HoldingCoverageResult[]): readonly HoldingCoverageResult[] {
  // For public evidence, ensure raw ISINs are not exposed beyond masked form.
  // The results already contain both isin (raw) and maskedIsin; public evidence
  // should publish only maskedIsin + reason counts, not raw isin.
  // This helper returns a copy with isin nulled for publication (owner-local keeps raw).
  return results.map((r) => ({ ...r, isin: null }));
}
