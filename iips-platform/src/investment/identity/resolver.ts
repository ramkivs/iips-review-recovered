/**
 * IID-1 — the identity resolution ladder.
 *
 * A pure function of `(identity input, identity sources, asOf)`. It reads no clock, no environment, no
 * file and — by construction — no company name: `IdentityInput` has no name field, so AC-1.10 holds
 * structurally rather than by convention.
 *
 * Ladder, in order:
 *   1. sector reference anywhere in the identity fields      → UNMATCHED
 *   2. ISIN present but not well formed                      → REJECTED_MALFORMED_ISIN
 *   3. ISIN present but absent from the roster               → UNMATCHED (never a symbol fallback)
 *   4. ISIN resolves but a CIN/company hint disagrees        → ISSUER_KEY_CONFLICT
 *   5. ISIN resolves, listing established (or stale)         → RESOLVED / STALE_REFERENCE / AMBIGUOUS_LISTING
 *   6. no ISIN: exchange+symbol resolves                     → RESOLVED / AMBIGUOUS / AMBIGUOUS_LISTING
 *   7. no ISIN and no usable symbol                          → UNMATCHED
 *   8. identity established but not assessable in v1         → INELIGIBLE / OUT_OF_SCOPE_SECURITY
 */
import {
  IdError,
  isValidIsin,
  parseIssuerId,
  isSectorReferenceId,
} from '../contracts/ids';
import { digestOf } from '../fundamentals/canonical';
import {
  REASON_TEXT,
  type CompanyIdentityBinding,
  type IdentityInput,
  type IdentityObservation,
  type IdentityResolution,
  type IdentitySources,
  type ListingMapEntry,
  type ResolutionFailure,
  type RosterIssuer,
  type RosterSecurity,
  type UnresolvedReason,
} from './types';

export interface ResolveContext {
  readonly sources: IdentitySources;
  /** The date identity is resolved against. Effective windows are evaluated at this date, never "today". */
  readonly asOf: string;
}

const ISIN_SHAPE = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;
const RESOLVED: 'RESOLVED' = 'RESOLVED';

/** Normalise an observed ISIN for comparison. Format is preserved so corruption stays detectable. */
export function normalizeIsin(value: string | null): string | null {
  if (value === null) return null;
  const cleaned = value.replace(/[\s-]/g, '').toUpperCase();
  return cleaned === '' ? null : cleaned;
}

function failure(
  state: ResolutionFailure['state'],
  reason: UnresolvedReason,
  detail: string,
  candidates: readonly string[] = [],
): IdentityResolution {
  return {
    observationId: '',
    state,
    issuerId: null,
    securityId: null,
    listingId: null,
    resolutionBasis: null,
    failure: { state, reason, detail, candidates },
  };
}

function withObservationId(resolution: IdentityResolution, observationId: string): IdentityResolution {
  return { ...resolution, observationId };
}

function activeAt(entry: ListingMapEntry, asOf: string): boolean {
  if (entry.effectiveFrom > asOf) return false;
  if (entry.effectiveTo !== null && entry.effectiveTo < asOf) return false;
  return true;
}

/**
 * Choose one listing from a set that is already consistent with the observation.
 *
 * The `EQ` preference is a tie-break among listings that are otherwise equally consistent — it
 * expresses which of several listings of one security is the ordinary equity listing. It is NOT a
 * substitute for an explicitly supplied series: when the observation declares a series, the
 * candidate set has already been narrowed to that series, so this preference cannot cross series
 * boundaries.
 */
function preferListing(entries: readonly ListingMapEntry[]): ListingMapEntry | null {
  if (entries.length === 0) return null;
  return [...entries].sort(
    (a, b) =>
      Number(b.series === 'EQ') - Number(a.series === 'EQ') ||
      a.effectiveFrom.localeCompare(b.effectiveFrom) ||
      a.listingId.localeCompare(b.listingId),
  )[0]!;
}

function malformedIsin(raw: string): IdentityResolution {
  if (!ISIN_SHAPE.test(raw)) {
    return failure('REJECTED_MALFORMED_ISIN', 'ISIN_FORMAT_INVALID', `"${raw}" is not a 12-character ISIN`);
  }
  return failure(
    'REJECTED_MALFORMED_ISIN',
    'ISIN_CHECK_DIGIT_FAILED',
    `"${raw}" passes the shape check but fails its Luhn check digit, so a character is corrupt`,
  );
}

/** True when any identity-bearing field is a sector reference (AC-1.1). */
export function findSectorReference(input: IdentityInput): string | null {
  for (const value of [input.isin, input.symbol, input.companyIdHint, input.cin]) {
    if (value !== null && isSectorReferenceId(value)) return value;
  }
  return null;
}

interface AssessabilityDecision {
  readonly state: 'RESOLVED' | 'INELIGIBLE' | 'OUT_OF_SCOPE_SECURITY';
  readonly reason: UnresolvedReason | null;
  readonly detail: string;
}

/** Apply the instrument/issuer scope rules. Identity stays established either way. */
function assess(issuer: RosterIssuer, security: RosterSecurity): AssessabilityDecision {
  if (issuer.status === 'EXCLUDED') {
    return {
      state: 'INELIGIBLE',
      reason: 'ISSUER_NOT_ELIGIBLE',
      detail: issuer.statusReason ?? `issuer ${issuer.issuerId} is excluded from the eligible roster`,
    };
  }
  if (issuer.foreignIssuer) {
    return { state: 'INELIGIBLE', reason: 'NON_INDIAN_ISSUER', detail: 'v1 covers Indian listed issuers only' };
  }
  if (security.status === 'INELIGIBLE') {
    return {
      state: 'INELIGIBLE',
      reason: 'SECURITY_NOT_LISTED',
      detail: security.statusReason ?? `${security.instrumentType} instruments are not assessable in v1`,
    };
  }
  if (security.status === 'OUT_OF_SCOPE') {
    return {
      state: 'OUT_OF_SCOPE_SECURITY',
      reason: 'INSTRUMENT_NOT_ASSESSABLE',
      detail:
        security.statusReason ??
        `a ${security.instrumentType} security is out of scope in v1; only listed equity is assessable`,
    };
  }
  return { state: RESOLVED, reason: null, detail: 'identity established' };
}

function resolvedWith(
  issuer: RosterIssuer,
  security: RosterSecurity,
  listing: ListingMapEntry | null,
  basis: 'ISIN' | 'EXCHANGE_SYMBOL',
): IdentityResolution {
  const decision = assess(issuer, security);
  return {
    observationId: '',
    state: decision.state,
    issuerId: issuer.issuerId,
    securityId: security.securityId,
    listingId: listing === null ? null : listing.listingId,
    resolutionBasis: basis,
    failure:
      decision.reason === null
        ? null
        : {
            state: decision.state as ResolutionFailure['state'],
            reason: decision.reason,
            detail: decision.detail,
            candidates: [],
          },
  };
}

/**
 * Resolve one observation. Deterministic: identical inputs and identical `asOf` always produce the same
 * resolution, and the order in which observations are resolved cannot affect any of them.
 */
export function resolveIdentity(rawInput: IdentityInput, context: ResolveContext): IdentityResolution {
  const { sources, asOf } = context;
  const input: IdentityInput = {
    ...rawInput,
    isin: normalizeIsin(rawInput.isin),
    symbol: rawInput.symbol === null ? null : rawInput.symbol.trim().toUpperCase(),
    exchange: rawInput.exchange === null ? null : rawInput.exchange.trim().toUpperCase(),
    series: rawInput.series === null ? null : rawInput.series.trim().toUpperCase(),
    cin: rawInput.cin === null ? null : rawInput.cin.trim().toUpperCase(),
  };

  // Sector references are detected on the RAW values: normalisation would strip the hyphen that makes
  // a reference a reference, and "Banking-H1" must never be mistaken for a malformed ISIN.
  const sectorReference = findSectorReference(rawInput);
  if (sectorReference !== null) {
    return withObservationId(
      failure(
        'UNMATCHED',
        'SECTOR_REFERENCE_NOT_AN_IDENTITY',
        `"${sectorReference}" is a sector reference, not a company or security identifier`,
      ),
      input.observationId,
    );
  }

  // Nested D114 `securityIdentity` envelope failure: a malformed or conflicting D114 envelope is
  // rejected fail-closed and never falls back to `symbol + exchange` (AC-1.2).
  if (input.securityIdentityRejection !== undefined && input.securityIdentityRejection !== null) {
    const { kind, detail } = input.securityIdentityRejection;
    if (kind === 'CONFLICT') {
      return withObservationId(
        failure('ISSUER_KEY_CONFLICT', 'ISSUER_KEY_CONFLICT', detail),
        input.observationId,
      );
    }
    return withObservationId(
      failure('REJECTED_MALFORMED_ISIN', 'SECURITY_IDENTITY_MALFORMED', detail),
      input.observationId,
    );
  }

  const issuerById = new Map(sources.roster.issuers.map((issuer) => [issuer.issuerId, issuer]));
  const securityById = new Map(sources.roster.securities.map((security) => [security.securityId, security]));
  const securityByIsin = new Map(sources.roster.securities.map((security) => [security.isin, security]));
  const listingsBySecurity = new Map<string, ListingMapEntry[]>();
  for (const entry of sources.listingMap.entries) {
    const bucket = listingsBySecurity.get(entry.securityId) ?? [];
    bucket.push(entry);
    listingsBySecurity.set(entry.securityId, bucket);
  }

  /* ------------------------------------------------------------ ISIN path */
  if (input.isin !== null) {
    if (!isValidIsin(input.isin)) {
      return withObservationId(malformedIsin(input.isin), input.observationId);
    }
    const security = securityByIsin.get(input.isin);
    if (security === undefined) {
      // No fallback: a valid ISIN that is not in the roster is simply not in the roster (AC-1.2).
      return withObservationId(
        failure('UNMATCHED', 'ISIN_NOT_IN_ROSTER', `ISIN ${input.isin} is valid but not in the eligible roster`),
        input.observationId,
      );
    }
    const issuer = issuerById.get(security.issuerId);
    if (issuer === undefined) {
      return withObservationId(
        failure('UNMATCHED', 'ISIN_NOT_IN_ROSTER', `security ${security.securityId} has no issuer in the roster`),
        input.observationId,
      );
    }

    // CIN / company-hint conflict — never resolved by preferring one side (AC-1.5).
    if (input.cin !== null && issuer.cin !== null && input.cin !== issuer.cin) {
      return withObservationId(
        failure(
          'ISSUER_KEY_CONFLICT',
          'ISSUER_KEY_CONFLICT',
          `the row declares CIN ${input.cin} but ISIN ${input.isin} belongs to issuer ${issuer.issuerId} (CIN ${issuer.cin})`,
          [issuer.issuerId],
        ),
        input.observationId,
      );
    }
    if (input.companyIdHint !== null) {
      let hinted: string | null = null;
      try {
        hinted = parseIssuerId(input.companyIdHint);
      } catch (error) {
        hinted = error instanceof IdError ? null : null;
      }
      if (hinted !== null && hinted !== issuer.issuerId) {
        return withObservationId(
          failure(
            'ISSUER_KEY_CONFLICT',
            'ISSUER_KEY_CONFLICT',
            `the row carries company reference ${hinted} but ISIN ${input.isin} belongs to ${issuer.issuerId}`,
            [issuer.issuerId],
          ),
          input.observationId,
        );
      }
    }

    // A security the roster marks INELIGIBLE is not assessable whatever the listing map says, and the
    // reason is the roster's (e.g. not listed), not a derived listing gap.
    if (security.status === 'INELIGIBLE') {
      return withObservationId(
        resolvedWith(issuer, security, null, 'ISIN'),
        input.observationId,
      );
    }

    const listings = listingsBySecurity.get(security.securityId) ?? [];
    if (listings.length === 0) {
      return withObservationId(
        failure('INELIGIBLE', 'NO_LISTING_FOR_SECURITY', `security ${security.securityId} has no listing in the listing map`),
        input.observationId,
      );
    }

    /**
     * THE ACTIVE LISTINGS FOR THIS SECURITY, NARROWED BY THE OBSERVATION'S OWN EVIDENCE.
     *
     * A series is a real discriminator: one ISIN can carry several listings (an equity listing and
     * a warrants listing, say), and a holding that says `series=BE` is not the `EQ` listing even
     * though both belong to the same security. The observed symbol and exchange are discriminators
     * too, and they were already consulted for a CONFLICT below — but they were not consulted when
     * the final listing was CHOSEN, so a security with two `BE` listings could be resolved to
     * whichever one happened to sort first.
     *
     * So the candidate set is narrowed by series, then by symbol and exchange, and each narrowing
     * that would leave nothing is REPORTED rather than silently ignored. An explicitly supplied
     * series is never overridden by a preference rule.
     */
    const activeAll = listings.filter((entry) => activeAt(entry, asOf));
    const seriesCandidates =
      input.series === null ? activeAll : activeAll.filter((entry) => entry.series === input.series);
    if (input.series !== null && seriesCandidates.length === 0 && activeAll.length > 0) {
      // The security is listed and active, but not in the series the observation names.
      const available = [...new Set(activeAll.map((entry) => entry.series))].sort();
      return withObservationId(
        failure(
          'AMBIGUOUS_LISTING',
          'MULTIPLE_SECURITIES_SHARE_LISTING',
          `security ${security.securityId} is listed in series ${available.join(', ')} at ${asOf}, not in the series ${input.series} the observation declares`,
          [security.securityId],
        ),
        input.observationId,
      );
    }
    const symbolCandidates =
      input.symbol === null || input.exchange === null
        ? seriesCandidates
        : seriesCandidates.filter((entry) => entry.symbol === input.symbol && entry.exchange === input.exchange);
    if (input.symbol !== null && input.exchange !== null) {
      const exact = listings.filter((entry) => entry.symbol === input.symbol && entry.exchange === input.exchange);
      if (exact.length > 0 && exact.every((entry) => !activeAt(entry, asOf))) {
        const expired = exact.every((entry) => entry.effectiveTo !== null && entry.effectiveTo < asOf);
        return withObservationId(
          failure(
            'STALE_REFERENCE',
            expired ? 'LISTING_WINDOW_EXPIRED' : 'LISTING_NOT_YET_EFFECTIVE',
            expired
              ? `symbol ${input.exchange}:${input.symbol} ended on ${exact.map((entry) => entry.effectiveTo).sort().slice(-1)[0]}, before ${asOf}`
              : `symbol ${input.exchange}:${input.symbol} starts after ${asOf}`,
            [security.securityId],
          ),
          input.observationId,
        );
      }
      if (exact.length === 0) {
        // The observed symbol is not this security's symbol at all. Is it somebody else's active symbol?
        const foreign = sources.listingMap.entries.filter(
          (entry) => entry.symbol === input.symbol && entry.exchange === input.exchange && activeAt(entry, asOf),
        );
        if (foreign.length > 0) {
          return withObservationId(
            failure(
              'AMBIGUOUS',
              'SYMBOL_REUSED_BY_OTHER_SECURITY',
              `symbol ${input.exchange}:${input.symbol} now belongs to ${foreign.map((entry) => entry.securityId).join(', ')}`,
              foreign.map((entry) => entry.securityId),
            ),
            input.observationId,
          );
        }
      }
    }

    if (symbolCandidates.length === 0 && seriesCandidates.length > 0) {
      // The observation names a symbol/exchange this security is not listed under, and that symbol
      // does not belong to any other active security either. The listing the security DOES have is
      // not a substitute for the one that was observed.
      //
      // This is checked AFTER the reused-symbol diagnosis above, because "this symbol now belongs
      // to a different security" is the more specific finding and names a different remedy.
      const observed = seriesCandidates.map((entry) => `${entry.exchange}:${entry.symbol}:${entry.series}`);
      return withObservationId(
        failure(
          'AMBIGUOUS_LISTING',
          'MULTIPLE_SECURITIES_SHARE_LISTING',
          `security ${security.securityId} is listed under ${observed.join(', ')} at ${asOf}, not under the observed ${input.exchange}:${input.symbol}`,
          [security.securityId],
        ),
        input.observationId,
      );
    }
    const active = symbolCandidates;

    if (active.length === 0) {
      const earliest = listings.reduce((min, entry) => (entry.effectiveFrom < min ? entry.effectiveFrom : min), listings[0]!.effectiveFrom);
      return withObservationId(
        failure(
          'STALE_REFERENCE',
          earliest > asOf ? 'LISTING_NOT_YET_EFFECTIVE' : 'LISTING_WINDOW_EXPIRED',
          earliest > asOf
            ? `the earliest listing of ${security.securityId} starts on ${earliest}, after ${asOf}`
            : `every listing of ${security.securityId} has ended before ${asOf}`,
          [security.securityId],
        ),
        input.observationId,
      );
    }

    return withObservationId(resolvedWith(issuer, security, preferListing(active), 'ISIN'), input.observationId);
  }

  /* ---------------------------------------------------------- symbol path */
  if (input.symbol === null || input.exchange === null) {
    return withObservationId(
      failure('UNMATCHED', 'NO_IDENTIFIER_PROVIDED', 'the row carries neither a usable ISIN nor an exchange symbol'),
      input.observationId,
    );
  }
  if (input.exchange !== 'NSE' && input.exchange !== 'BSE') {
    return withObservationId(
      failure('INELIGIBLE', 'EXCHANGE_NOT_SUPPORTED', `exchange "${input.exchange}" is not NSE or BSE`),
      input.observationId,
    );
  }

  const sameSymbol = sources.listingMap.entries.filter(
    (entry) => entry.symbol === input.symbol && entry.exchange === input.exchange,
  );
  if (sameSymbol.length === 0) {
    return withObservationId(
      failure('UNMATCHED', 'SYMBOL_NOT_IN_LISTING_MAP', `symbol ${input.exchange}:${input.symbol} is not in the listing map`),
      input.observationId,
    );
  }

  const seriesFiltered =
    input.series === null ? sameSymbol : sameSymbol.filter((entry) => entry.series === input.series);
  const windowCandidates = seriesFiltered.length > 0 ? seriesFiltered : sameSymbol;
  const active = windowCandidates.filter((entry) => activeAt(entry, asOf));

  if (active.length === 0) {
    const expired = windowCandidates.every((entry) => entry.effectiveTo !== null && entry.effectiveTo < asOf);
    const lastEnd = windowCandidates
      .map((entry) => entry.effectiveTo)
      .filter((value): value is string => value !== null)
      .sort()
      .slice(-1)[0];
    const firstStart = windowCandidates.map((entry) => entry.effectiveFrom).sort()[0];
    return withObservationId(
      failure(
        'STALE_REFERENCE',
        expired ? 'LISTING_WINDOW_EXPIRED' : 'LISTING_NOT_YET_EFFECTIVE',
        expired
          ? `symbol ${input.exchange}:${input.symbol} ended on ${String(lastEnd)} and is not effective at ${asOf}`
          : `symbol ${input.exchange}:${input.symbol} is not effective until ${String(firstStart)}, after ${asOf}`,
        windowCandidates.map((entry) => entry.securityId),
      ),
      input.observationId,
    );
  }

  const distinctSecurities = [...new Set(active.map((entry) => entry.securityId))].sort();
  if (distinctSecurities.length > 1) {
    const issuers = [...new Set(active.map((entry) => entry.issuerId))].sort();
    if (issuers.length > 1) {
      return withObservationId(
        failure(
          'AMBIGUOUS',
          'DUPLICATE_ACTIVE_SYMBOL',
          `${issuers.length} active issuers use ${input.exchange}:${input.symbol} (${issuers.join(', ')})`,
          distinctSecurities,
        ),
        input.observationId,
      );
    }
    const instruments = [...new Set(active.map((entry) => entry.instrumentType))].sort();
    return withObservationId(
      failure(
        'AMBIGUOUS_LISTING',
        'MULTIPLE_SECURITIES_SHARE_LISTING',
        `one issuer lists ${instruments.join(' and ')} under ${input.exchange}:${input.symbol}; distinct instruments never share a listing`,
        distinctSecurities,
      ),
      input.observationId,
    );
  }

  const security = securityById.get(distinctSecurities[0]!);
  if (security === undefined) {
    return withObservationId(
      failure('UNMATCHED', 'SYMBOL_NOT_IN_LISTING_MAP', 'the listing map points at a security that is not in the roster'),
      input.observationId,
    );
  }
  const issuer = issuerById.get(security.issuerId);
  if (issuer === undefined) {
    return withObservationId(
      failure('UNMATCHED', 'ISIN_NOT_IN_ROSTER', `security ${security.securityId} has no issuer in the roster`),
      input.observationId,
    );
  }
  const listing = preferListing(active.filter((entry) => entry.securityId === security.securityId));
  return withObservationId(resolvedWith(issuer, security, listing, 'EXCHANGE_SYMBOL'), input.observationId);
}

/** Extract exactly the identity-bearing fields. Presentation fields stop here. */
export function identityInputOf(observation: IdentityObservation): IdentityInput {
  return {
    observationId: observation.observationId,
    source: observation.source,
    isin: observation.isin,
    symbol: observation.symbol,
    exchange: observation.exchange,
    series: observation.series,
    cin: observation.cin,
    companyIdHint: observation.companyIdHint,
    ...(observation.securityIdentityRejection !== undefined
      ? { securityIdentityRejection: observation.securityIdentityRejection }
      : {}),
  };
}

/** Emit the binding record for an observation, resolved or not (roadmap IID-1 item 6). */
export function buildBinding(
  observation: IdentityObservation,
  resolution: IdentityResolution,
  context: ResolveContext,
): CompanyIdentityBinding {
  const { sources, asOf } = context;
  const issuer = resolution.issuerId === null ? null : sources.roster.issuers.find((entry) => entry.issuerId === resolution.issuerId) ?? null;
  const listing =
    resolution.listingId === null
      ? null
      : sources.listingMap.entries.find((entry) => entry.listingId === resolution.listingId) ?? null;
  const reason = resolution.failure === null ? null : resolution.failure.reason;
  const base = {
    observationId: observation.observationId,
    source: observation.source,
    portfolioId: observation.portfolioId,
    status: resolution.state,
    reason,
    issuerId: resolution.issuerId,
    issuerKeyBasis: issuer === null ? null : issuer.issuerKeyBasis,
    securityId: resolution.securityId,
    listingId: resolution.listingId,
    resolutionBasis: resolution.resolutionBasis,
    assessable: resolution.state === 'RESOLVED',
    effectiveFrom: listing === null ? null : listing.effectiveFrom,
    effectiveTo: listing === null ? null : listing.effectiveTo,
    rosterVersion: sources.versions.rosterVersion,
    listingMapVersion: sources.versions.listingMapVersion,
    corporateActionTableVersion: sources.versions.corporateActionTableVersion,
    observedAt: asOf,
    provenance: {
      rosterDigest: sources.versions.rosterDigest,
      listingMapDigest: sources.versions.listingMapDigest,
      corporateActionTableDigest: sources.versions.corporateActionTableDigest,
      resolutionBasis: 'IDENTITY_FIELDS_ONLY' as const,
    },
  };
  return { bindingId: digestOf(base), ...base };
}

export function reasonText(reason: UnresolvedReason | null): string | null {
  return reason === null ? null : REASON_TEXT[reason];
}
