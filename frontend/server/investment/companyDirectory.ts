/**
 * IID WI-2 (P2) — governed company discovery over the eligible roster.
 *
 * WHY A NEW READ MODULE. Until now the only way into IID-01 was to type an opaque `IN:CIN:…` identifier that the
 * operator already had. There was no way to FIND a company. This module answers "which governed companies match
 * what the reader typed", using data IRR already owns.
 *
 * THE SOURCE IS THE GOVERNED ROSTER, NOT COVERAGE. `loadRuntimeIdentitySources` reads the versioned eligible
 * roster / listing map / corporate-action table. Coverage additionally requires the IPD holdings IPC surface and
 * the watchlists service, and fails closed when either is unreadable. Discovery deliberately does NOT use those
 * providers, so a 503 from `/api/investment/coverage` cannot make discovery unavailable.
 *
 * NAME MATCHING IS NOT IDENTITY RESOLUTION. AC-1.10 forbids the resolver from matching on a company name, and
 * `IdentityInput` has no name field. That rule is preserved literally here:
 *   - an IDENTIFIER query goes through `resolveIdentity`, the existing governed resolver; and
 *   - a NAME query is a lookup over `roster.issuers[].legalName` that returns the roster record's OWN `issuerId`.
 * The name is an index into an already-governed record, never evidence from which an identity is derived. No
 * issuer id is ever constructed, normalised into existence, or guessed from a display string.
 *
 * THREE OUTCOMES, NEVER TWO. A company can be (a) known with a stored assessment, (b) known with no assessment,
 * or (c) known but assessment availability UNKNOWN because the governed store or owner context is unavailable.
 * Collapsing (c) into (b) would tell the reader "no assessment exists" when the truth is "we could not look".
 *
 * READ-ONLY. No store is opened here, no artifact is written, and no IPD API is called.
 */
import { parseIssuerId } from '../../../iips-platform/src/investment/contracts/ids';
import { identityInputOf, resolveIdentity } from '../../../iips-platform/src/investment/identity/resolver';
import type {
  IdentitySources,
  IdentityObservation,
  RosterIssuer,
} from '../../../iips-platform/src/investment/identity/types';

/** Minimum characters before a query is worth answering. Below this the answer would be the whole roster. */
export const MIN_QUERY_LENGTH = 2;
/** Upper bound on returned matches. A discovery list is a way in, not an export. */
export const MAX_RESULTS = 25;
/** Upper bound on accepted query length, so a pathological input cannot drive a wide scan. */
export const MAX_QUERY_LENGTH = 120;

/**
 * Whether a stored company assessment exists for this issuer.
 *
 * `UNAVAILABLE` is a first-class outcome: the roster answered, but the governed artifact store or the owner
 * context did not, so availability was not observed. It is never reported as `NONE`.
 */
export type AssessmentAvailability = 'AVAILABLE' | 'NONE' | 'DAMAGED' | 'UNKNOWN';

export interface CompanyMatch {
  /** The roster record's own issuer id, verbatim. Never constructed here. */
  readonly issuerId: string;
  readonly legalName: string;
  readonly cin: string | null;
  readonly equityIsin: string | null;
  readonly sector: string;
  readonly issuerKeyBasis: 'CIN' | 'EQUITY_ISIN';
  /** How the reader's query reached this record — disclosed so a name hit is never mistaken for an id match. */
  readonly matchedBy: 'ISSUER_ID' | 'IDENTIFIER' | 'LEGAL_NAME';
  readonly assessment: AssessmentAvailability;
  /** Head version count when an assessment is available; null otherwise. */
  readonly versionCount: number | null;
}

export type DirectoryQueryResult =
  | { readonly kind: 'invalid'; readonly reason: 'QUERY_TOO_SHORT' | 'QUERY_TOO_LONG' }
  | {
      readonly kind: 'matches';
      readonly matches: readonly CompanyMatch[];
      /** True when more records matched than were returned. Never silently truncates. */
      readonly truncated: boolean;
      readonly totalMatched: number;
    };

export interface DirectoryDisclosure {
  readonly rosterVersion: string;
  readonly rosterDigest: string;
  readonly rosterDataClass: IdentitySources['rosterDataClass'];
  readonly issuerCount: number;
  readonly securityCount: number;
  readonly listingCount: number;
  readonly corporateActionCount: number;
  readonly corporateActionsEmpty: boolean;
  /** Why availability is UNKNOWN, when it is. Null when the store answered. */
  readonly assessmentAvailabilityUnavailableReason: string | null;
}

/** What the artifact store observed. Injected so the unavailable path is provable without a store. */
export interface AssessmentInventory {
  /** issuerId → chain facts, for chains the owner can actually see. */
  readonly byIssuerId: ReadonlyMap<string, { readonly valid: boolean; readonly versionCount: number }>;
}

/**
 * Build the availability index from the artifact service's existing `inventory()` output.
 *
 * The scope token is `co:<issuerId>`; the issuer id is recovered by removing that known prefix and validating
 * what remains with `parseIssuerId`. A token that does not yield a valid issuer id is skipped, not repaired.
 */
export function availabilityFromInventory(
  entries: ReadonlyArray<{ readonly scopeToken: string; readonly valid: boolean; readonly versionCount: number }>,
): AssessmentInventory {
  const byIssuerId = new Map<string, { readonly valid: boolean; readonly versionCount: number }>();
  for (const entry of entries) {
    if (!entry.scopeToken.startsWith('co:')) continue;
    let issuerId: string;
    try {
      issuerId = parseIssuerId(entry.scopeToken.slice('co:'.length));
    } catch {
      continue;
    }
    byIssuerId.set(issuerId, { valid: entry.valid, versionCount: entry.versionCount });
  }
  return { byIssuerId };
}

function availabilityOf(
  issuerId: string,
  inventory: AssessmentInventory | null,
): { readonly assessment: AssessmentAvailability; readonly versionCount: number | null } {
  if (inventory === null) return { assessment: 'UNKNOWN', versionCount: null };
  const entry = inventory.byIssuerId.get(issuerId);
  if (entry === undefined) return { assessment: 'NONE', versionCount: null };
  if (!entry.valid) return { assessment: 'DAMAGED', versionCount: null };
  return { assessment: 'AVAILABLE', versionCount: entry.versionCount };
}

function matchOf(
  issuer: RosterIssuer,
  matchedBy: CompanyMatch['matchedBy'],
  inventory: AssessmentInventory | null,
): CompanyMatch {
  const { assessment, versionCount } = availabilityOf(issuer.issuerId, inventory);
  return {
    issuerId: issuer.issuerId,
    legalName: issuer.legalName,
    cin: issuer.cin,
    equityIsin: issuer.equityIsin,
    sector: issuer.sector,
    issuerKeyBasis: issuer.issuerKeyBasis,
    matchedBy,
    assessment,
    versionCount,
  };
}

/** Case- and whitespace-insensitive comparison key. Used for LOOKUP only; never to build an identifier. */
function lookupKey(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * Build a query observation carrying ONLY the identity field being attempted.
 *
 * This matters: `resolveIdentity` takes the ISIN path first and rejects a malformed ISIN outright, so offering
 * the same string as ISIN, symbol and CIN at once would make every non-ISIN query fail. Each attempt populates
 * one field and leaves the rest null. `displayName` is null by construction, so a name can never enter resolution.
 */
function queryObservation(fields: {
  readonly isin?: string;
  readonly symbol?: string;
  readonly exchange?: string;
}): IdentityObservation {
  return {
    observationId: 'discovery:query',
    source: 'WATCHLIST',
    portfolioId: null,
    isin: fields.isin ?? null,
    symbol: fields.symbol ?? null,
    exchange: fields.exchange ?? null,
    series: null,
    cin: null,
    companyIdHint: null,
    displayName: null,
    quantity: null,
    upstreamStatus: null,
    raw: {},
  };
}

function resolvedIssuerOf(observation: IdentityObservation, sources: IdentitySources, asOf: string): string | null {
  try {
    const resolution = resolveIdentity(identityInputOf(observation), { sources, asOf });
    return resolution.state === 'RESOLVED' ? resolution.issuerId : null;
  } catch {
    return null;
  }
}

/**
 * Resolve an identifier query using the existing governed rules.
 *
 * Three governed attempts, in order, each returning a roster record's own issuer id:
 *   1. ISIN → `resolveIdentity`, which applies roster membership, listing windows and eligibility exactly as it
 *      does for a holding;
 *   2. `EXCHANGE:SYMBOL` → the same resolver's symbol path (the resolver requires an exchange, so a bare symbol
 *      is deliberately not guessed at);
 *   3. CIN → a direct lookup on the roster's own `cin` field. The resolver treats CIN only as a conflict
 *      indicator, so a lookup is used rather than constructing an issuer id from the CIN.
 * Nothing is classified here: each attempt either matches governed data or does not.
 */
function resolveIdentifierQuery(
  query: string,
  sources: IdentitySources,
  asOf: string,
): string | null {
  const fromIsin = resolvedIssuerOf(queryObservation({ isin: query }), sources, asOf);
  if (fromIsin !== null) return fromIsin;

  const separator = query.indexOf(':');
  if (separator > 0) {
    const exchange = query.slice(0, separator).trim().toUpperCase();
    const symbol = query.slice(separator + 1).trim().toUpperCase();
    if (symbol.length > 0 && (exchange === 'NSE' || exchange === 'BSE')) {
      const fromSymbol = resolvedIssuerOf(queryObservation({ symbol, exchange }), sources, asOf);
      if (fromSymbol !== null) return fromSymbol;
    }
  }

  const cin = lookupKey(query);
  const byCin = sources.roster.issuers.find(
    (issuer) => issuer.status === 'ELIGIBLE' && issuer.cin !== null && lookupKey(issuer.cin) === cin,
  );
  return byCin === undefined ? null : byCin.issuerId;
}

/**
 * Answer a discovery query.
 *
 * Order: an exact issuer id wins; then the governed identifier resolver; then a legal-name lookup. Every branch
 * returns roster records, so an answer always carries the roster's own authoritative issuer id.
 */
export function searchCompanies(
  rawQuery: string,
  sources: IdentitySources,
  options: { readonly asOf: string; readonly inventory: AssessmentInventory | null; readonly limit?: number },
): DirectoryQueryResult {
  const query = rawQuery.trim();
  if (query.length < MIN_QUERY_LENGTH) return { kind: 'invalid', reason: 'QUERY_TOO_SHORT' };
  if (query.length > MAX_QUERY_LENGTH) return { kind: 'invalid', reason: 'QUERY_TOO_LONG' };
  const limit = Math.min(Math.max(options.limit ?? MAX_RESULTS, 1), MAX_RESULTS);

  // Only ELIGIBLE issuers are discoverable. An excluded issuer is not offered as a way into an assessment.
  const eligible = sources.roster.issuers.filter((issuer) => issuer.status === 'ELIGIBLE');
  const found = new Map<string, CompanyMatch>();

  // 1. An exact issuer id, validated by the governed contract before it is used as a key.
  try {
    const issuerId = parseIssuerId(query);
    const issuer = eligible.find((candidate) => candidate.issuerId === issuerId);
    if (issuer !== undefined) {
      found.set(issuer.issuerId, matchOf(issuer, 'ISSUER_ID', options.inventory));
    }
  } catch {
    // Not an issuer id. Fall through — this is not an error, it is a different kind of query.
  }

  // 2. A governed identifier (ISIN / CIN / symbol), resolved by the existing resolver.
  if (found.size === 0) {
    const issuerId = resolveIdentifierQuery(query, sources, options.asOf);
    if (issuerId !== null) {
      const issuer = eligible.find((candidate) => candidate.issuerId === issuerId);
      if (issuer !== undefined) {
        found.set(issuer.issuerId, matchOf(issuer, 'IDENTIFIER', options.inventory));
      }
    }
  }

  // 3. A legal-name lookup. The name selects a RECORD; the record supplies the identity.
  if (found.size === 0) {
    const needle = lookupKey(query);
    for (const issuer of eligible) {
      if (lookupKey(issuer.legalName).includes(needle)) {
        found.set(issuer.issuerId, matchOf(issuer, 'LEGAL_NAME', options.inventory));
      }
    }
  }

  const all = [...found.values()].sort((a, b) => a.legalName.localeCompare(b.legalName));
  return {
    kind: 'matches',
    matches: all.slice(0, limit),
    truncated: all.length > limit,
    totalMatched: all.length,
  };
}

/** The provenance every discovery response carries, so a synthetic roster is never mistaken for live data. */
export function directoryDisclosure(
  sources: IdentitySources,
  inventory: AssessmentInventory | null,
): DirectoryDisclosure {
  return {
    rosterVersion: sources.versions.rosterVersion,
    rosterDigest: sources.versions.rosterDigest,
    rosterDataClass: sources.rosterDataClass,
    issuerCount: sources.roster.issuers.length,
    securityCount: sources.roster.securities.length,
    listingCount: sources.listingMap.entries.length,
    corporateActionCount: sources.corporateActionTable.actions.length,
    corporateActionsEmpty: sources.corporateActionTable.actions.length === 0,
    assessmentAvailabilityUnavailableReason:
      inventory === null
        ? 'The governed assessment store or owner context was unavailable, so assessment availability was not observed.'
        : null,
  };
}
