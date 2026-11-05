/**
 * IID-1 — identity resolution contract.
 *
 * Three identity levels, never conflated: issuer (CIN-primary, equity-ISIN fallback), security (ISIN),
 * listing (exchange + symbol + series + instrument + effective window). An observation resolves to all
 * three or it resolves to nothing, with a named state and a displayable reason.
 *
 * AC-1.10 IS STRUCTURAL. `IdentityInput` carries only identity-bearing fields. There is no `legalName`,
 * `displayName` or free-text field on it, so a resolver physically cannot match on a company name. The
 * presentation-only fields live on `IdentityObservation` and are carried through untouched for display.
 */
import type { CorporateActionRecord } from '../fundamentals/types';

/** Closed resolution ladder (roadmap IID-1 item 3 + Revision 3 §E listing ambiguity). */
export const RESOLUTION_STATES = [
  'RESOLVED',
  'AMBIGUOUS',
  'UNMATCHED',
  'INELIGIBLE',
  'OUT_OF_SCOPE_SECURITY',
  'STALE_REFERENCE',
  'REJECTED_MALFORMED_ISIN',
  'ISSUER_KEY_CONFLICT',
  'AMBIGUOUS_LISTING',
] as const;
export type ResolutionState = (typeof RESOLUTION_STATES)[number];

/** Which observed surface an item came from. */
export type ObservationSource = 'HOLDING' | 'BROKER_PREVIEW' | 'WATCHLIST';

/**
 * Closed reason vocabulary. Every non-`RESOLVED` state must carry one of these, and each has display
 * text — an unresolved item is never merely "unresolved".
 */
export const UNRESOLVED_REASONS = [
  'SECTOR_REFERENCE_NOT_AN_IDENTITY',
  'NO_IDENTIFIER_PROVIDED',
  'ISIN_FORMAT_INVALID',
  'ISIN_CHECK_DIGIT_FAILED',
  'ISIN_NOT_IN_ROSTER',
  'SYMBOL_NOT_IN_LISTING_MAP',
  'DUPLICATE_ACTIVE_SYMBOL',
  'SYMBOL_REUSED_BY_OTHER_SECURITY',
  'LISTING_WINDOW_EXPIRED',
  'LISTING_NOT_YET_EFFECTIVE',
  'MULTIPLE_SECURITIES_SHARE_LISTING',
  'NO_LISTING_FOR_SECURITY',
  'SECURITY_NOT_LISTED',
  'INSTRUMENT_NOT_ASSESSABLE',
  'NON_INDIAN_ISSUER',
  'EXCHANGE_NOT_SUPPORTED',
  'ISSUER_KEY_CONFLICT',
  'ISSUER_NOT_ELIGIBLE',
] as const;
export type UnresolvedReason = (typeof UNRESOLVED_REASONS)[number];

export const REASON_TEXT: Readonly<Record<UnresolvedReason, string>> = Object.freeze({
  SECTOR_REFERENCE_NOT_AN_IDENTITY:
    'This identifier is a sector reference (for example "Banking-H1"), not a company or security. It can never be used as identity input.',
  NO_IDENTIFIER_PROVIDED: 'The row carries neither an ISIN nor an exchange symbol, so nothing can be resolved.',
  ISIN_FORMAT_INVALID: 'The ISIN is not 12 characters in the required format.',
  ISIN_CHECK_DIGIT_FAILED: 'The ISIN fails its Luhn check digit, which means at least one character is corrupt.',
  ISIN_NOT_IN_ROSTER: 'The ISIN is valid but is not in the eligible roster. No symbol fallback is attempted.',
  SYMBOL_NOT_IN_LISTING_MAP: 'The exchange symbol is not in the listing map.',
  DUPLICATE_ACTIVE_SYMBOL: 'More than one active issuer currently uses this exchange symbol.',
  SYMBOL_REUSED_BY_OTHER_SECURITY: 'The symbol now belongs to a different security than the one observed.',
  LISTING_WINDOW_EXPIRED: 'The symbol matched only outside its listing effective window (delisted or renamed).',
  LISTING_NOT_YET_EFFECTIVE: 'The symbol matches a listing whose effective window has not started at the observation date.',
  MULTIPLE_SECURITIES_SHARE_LISTING:
    'Two distinct securities claim the same exchange, symbol, series and instrument class. Distinct instruments must never collapse into one listing.',
  NO_LISTING_FOR_SECURITY: 'The security exists in the roster but has no listing in the listing map.',
  SECURITY_NOT_LISTED: 'The security is not listed, so it cannot be assessed in v1.',
  INSTRUMENT_NOT_ASSESSABLE:
    'The instrument class is not assessable in v1 (only listed equity is). It is disclosed, not assessed by proxy.',
  NON_INDIAN_ISSUER: 'The issuer is not an Indian listed issuer, which is outside v1 scope.',
  EXCHANGE_NOT_SUPPORTED: 'The exchange is not NSE or BSE.',
  ISSUER_KEY_CONFLICT:
    'A CIN and an equity ISIN disagree about the same issuer or security. This is never resolved by picking one.',
  ISSUER_NOT_ELIGIBLE: 'The issuer exists but is excluded from the eligible roster.',
});

/** Identity-bearing fields only. Nothing here can express a company name (AC-1.10). */
export interface IdentityInput {
  readonly observationId: string;
  readonly source: ObservationSource;
  /** Normalised to upper case, spaces removed, or null when absent. */
  readonly isin: string | null;
  readonly symbol: string | null;
  readonly exchange: string | null;
  /** Optional series (EQ/BE/…) when the source publishes one; never inferred otherwise. */
  readonly series: string | null;
  /** Optional CIN supplied by the caller (broker/portfolio row). Validated, never trusted blindly. */
  readonly cin: string | null;
  /** IPD `companyId`, used as a conflict indicator only — it is never proof of identity. */
  readonly companyIdHint: string | null;
}

/** An observation as received, including presentation-only fields the resolver never sees. */
export interface IdentityObservation extends IdentityInput {
  readonly displayName: string | null;
  readonly portfolioId: string | null;
  readonly quantity: number | null;
  /** Upstream status the source surface published, carried for reconciliation, not for authority. */
  readonly upstreamStatus: string | null;
  /** The raw row exactly as observed, shown verbatim beside an unresolved state. */
  readonly raw: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ResolutionFailure {
  readonly state: Exclude<ResolutionState, 'RESOLVED'>;
  readonly reason: UnresolvedReason;
  readonly detail: string;
  /** Candidates the resolver refused to choose between. Empty when the item simply did not match. */
  readonly candidates: readonly string[];
}

export interface IdentityResolution {
  readonly observationId: string;
  readonly state: ResolutionState;
  readonly issuerId: string | null;
  readonly securityId: string | null;
  readonly listingId: string | null;
  /** How identity was established — recorded so a symbol-only match is never mistaken for an ISIN match. */
  readonly resolutionBasis: 'ISIN' | 'EXCHANGE_SYMBOL' | null;
  readonly failure: ResolutionFailure | null;
}

/** Record emitted for every observation, resolved or not (roadmap IID-1 item 6). */
export interface CompanyIdentityBinding {
  readonly bindingId: string;
  readonly observationId: string;
  readonly source: ObservationSource;
  readonly portfolioId: string | null;
  readonly status: ResolutionState;
  readonly reason: UnresolvedReason | null;
  readonly issuerId: string | null;
  readonly issuerKeyBasis: 'CIN' | 'EQUITY_ISIN' | null;
  readonly securityId: string | null;
  readonly listingId: string | null;
  readonly resolutionBasis: 'ISIN' | 'EXCHANGE_SYMBOL' | null;
  readonly assessable: boolean;
  readonly effectiveFrom: string | null;
  readonly effectiveTo: string | null;
  readonly rosterVersion: string;
  readonly listingMapVersion: string;
  readonly corporateActionTableVersion: string;
  readonly observedAt: string;
  readonly provenance: {
    readonly rosterDigest: string;
    readonly listingMapDigest: string;
    readonly corporateActionTableDigest: string;
    readonly resolutionBasis: 'IDENTITY_FIELDS_ONLY';
  };
}

/* --------------------------------------------------------------- source files */

export const IDENTITY_SCHEMA = 'IIPS_INVESTMENT_IDENTITY_V1' as const;

export interface RosterIssuer {
  readonly issuerId: string;
  readonly legalName: string;
  readonly cin: string | null;
  readonly equityIsin: string | null;
  readonly issuerKeyBasis: 'CIN' | 'EQUITY_ISIN';
  readonly sector: string;
  readonly subSegment: string | null;
  readonly status: 'ELIGIBLE' | 'EXCLUDED';
  readonly statusReason: string | null;
  readonly foreignIssuer: boolean;
}

export interface RosterSecurity {
  readonly securityId: string;
  readonly issuerId: string;
  readonly isin: string;
  readonly instrumentType: string;
  readonly status: 'ASSESSABLE' | 'OUT_OF_SCOPE' | 'INELIGIBLE';
  readonly statusReason: string | null;
}

export interface EligibleRoster {
  readonly schemaVersion: typeof IDENTITY_SCHEMA;
  readonly rosterLabel: string;
  readonly issuers: readonly RosterIssuer[];
  readonly securities: readonly RosterSecurity[];
}

export interface ListingMapEntry {
  readonly listingId: string;
  readonly securityId: string;
  readonly issuerId: string;
  readonly exchange: string;
  readonly symbol: string;
  readonly series: string;
  readonly instrumentType: string;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
  readonly sourceRef: string;
}

export interface ListingMap {
  readonly schemaVersion: typeof IDENTITY_SCHEMA;
  readonly entries: readonly ListingMapEntry[];
}

export interface CorporateActionTable {
  readonly schemaVersion: typeof IDENTITY_SCHEMA;
  readonly actions: readonly CorporateActionRecord[];
}

export interface IdentitySourceVersions {
  readonly rosterVersion: string;
  readonly listingMapVersion: string;
  readonly corporateActionTableVersion: string;
  readonly rosterDigest: string;
  readonly listingMapDigest: string;
  readonly corporateActionTableDigest: string;
}

export interface IdentitySources {
  readonly roster: EligibleRoster;
  readonly listingMap: ListingMap;
  readonly corporateActionTable: CorporateActionTable;
  readonly versions: IdentitySourceVersions;
  /** Which dataset the roster describes, so synthetic fixtures are never mistaken for live coverage. */
  readonly rosterDataClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED';
}
