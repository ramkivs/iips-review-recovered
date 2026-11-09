/**
 * IID WI-2 — typed read-only clients for company discovery (P2) and holding identity (P3).
 *
 * Types are MIRRORED from the IRR transports, not imported from the server tree — the convention every other
 * client in this directory follows.
 *
 * NO IDENTITY LOGIC HERE. `issuerId` and `securityId` are the server's governed output, carried verbatim. This
 * module never constructs an identifier, never classifies a security, and never infers an issuer from a name.
 * A null stays null so the UI can render an honest unavailable state.
 */
import { noAuthFetch } from '../core/network/noAuthFetch';

/** Whether a stored assessment was observed. `UNKNOWN` means the store did not answer, NOT "none exists". */
export type AssessmentAvailability = 'AVAILABLE' | 'NONE' | 'DAMAGED' | 'UNKNOWN';

export interface CompanyMatch {
  readonly issuerId: string;
  readonly legalName: string;
  readonly cin: string | null;
  readonly equityIsin: string | null;
  readonly sector: string;
  readonly issuerKeyBasis: 'CIN' | 'EQUITY_ISIN';
  readonly matchedBy: 'ISSUER_ID' | 'IDENTIFIER' | 'LEGAL_NAME';
  readonly assessment: AssessmentAvailability;
  readonly versionCount: number | null;
}

export interface CompanyDirectoryResult {
  readonly status: 'OK';
  readonly query: string;
  readonly matches: readonly CompanyMatch[];
  readonly totalMatched: number;
  readonly truncated: boolean;
  readonly directory: {
    readonly rosterVersion: string;
    readonly rosterDigest: string;
    readonly rosterDataClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED';
    readonly assessmentAvailabilityUnavailableReason: string | null;
  };
}

export type DiscoveryFailureReason = 'query-too-short' | 'query-too-long' | 'sources-unavailable' | 'unrecognised';

export class CompanyDiscoveryError extends Error {
  readonly reason: DiscoveryFailureReason;
  constructor(reason: DiscoveryFailureReason, message: string) {
    super(message);
    this.name = 'CompanyDiscoveryError';
    this.reason = reason;
  }
}

export const DISCOVERY_UNAVAILABLE_COPY: Readonly<Record<DiscoveryFailureReason, string>> = Object.freeze({
  'query-too-short': 'Enter at least two characters of a company name, ISIN, CIN or EXCHANGE:SYMBOL.',
  'query-too-long': 'That query is too long. Enter a company name or a single identifier.',
  'sources-unavailable':
    'The governed identity files are unavailable, so no company could be matched. Nothing was substituted.',
  unrecognised: 'Company discovery could not be read. Nothing was substituted.',
});

function discoveryReasonFor(status: number, code: unknown): DiscoveryFailureReason {
  if (status === 400) {
    if (code === 'discovery-query-too-short') return 'query-too-short';
    if (code === 'discovery-query-too-long') return 'query-too-long';
  }
  if (status === 503) return 'sources-unavailable';
  return 'unrecognised';
}

/** Search the governed roster. The query is sent as typed; the server does all matching and resolution. */
export async function searchCompanies(query: string): Promise<CompanyDirectoryResult> {
  const response = await noAuthFetch(`/api/investment/companies?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const code = body !== null && typeof body === 'object' ? (body as { error?: unknown }).error : undefined;
    const reason = discoveryReasonFor(response.status, code);
    throw new CompanyDiscoveryError(reason, DISCOVERY_UNAVAILABLE_COPY[reason]);
  }
  return (await response.json()) as CompanyDirectoryResult;
}

/* ------------------------------------------------------------------ P3 — holding identity */

export interface HoldingIdentity {
  readonly holdingIndex: number;
  readonly symbol: string;
  readonly isin: string | null;
  readonly state: string;
  readonly issuerId: string | null;
  readonly securityId: string | null;
  readonly resolutionBasis: 'ISIN' | 'EXCHANGE_SYMBOL' | null;
  readonly reason: string | null;
  readonly reasonText: string | null;
  readonly assessable: boolean;
}

export interface PortfolioHoldingIdentities {
  readonly status: 'OK';
  readonly portfolioId: string;
  readonly count: number;
  readonly identities: readonly HoldingIdentity[];
}

/**
 * Read each holding's governed identity for one portfolio.
 *
 * Deliberately a SEPARATE request from the disposition list: the whole point of P3 is that this read cannot be
 * suppressed by a disposition that is absent or failing.
 */
export async function fetchPortfolioHoldingIdentities(portfolioId: string): Promise<PortfolioHoldingIdentities> {
  const response = await noAuthFetch(
    `/api/investment/portfolio/${encodeURIComponent(portfolioId)}/identities`,
  );
  if (!response.ok) {
    throw new Error(`Holding identity unavailable (${String(response.status)})`);
  }
  const body = (await response.json()) as Partial<PortfolioHoldingIdentities> | null;
  // Fail closed on a malformed payload rather than handing the UI an undefined list. A response that does not
  // carry an identities array is not a read of zero identities — it is an unusable read, and the surface must
  // say so instead of silently rendering "no identity".
  if (body === null || typeof body !== 'object' || !Array.isArray(body.identities)) {
    throw new Error('Holding identity response was malformed; no identity was assumed.');
  }
  return body as PortfolioHoldingIdentities;
}
