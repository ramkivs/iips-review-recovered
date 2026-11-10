/**
 * IID WI-1 (P4) — the navigation context the investment surfaces carry between them.
 *
 * WHY THIS FILE EXISTS. The company assessment, the disposition panel and the change timeline are three read
 * models rendered on one route. The only thing that travels between them is the URL, so every link that stays
 * inside the workflow has to rebuild the same query string. Before this module each surface built its own href
 * and silently dropped the parts it did not know about, which is how a reader lost the holding they came from.
 *
 * WHAT THIS MODULE NEVER DOES. It does not resolve, derive, classify or validate an identity. `issuerId`,
 * `securityId` and `portfolioId` are opaque strings supplied by the server's read models or by the operator;
 * they are copied verbatim and percent-encoded. In particular it never builds an issuer id out of a security id
 * (or the reverse): that is IRR server-side resolution, and inventing it here would fabricate an identity.
 */

/** The optional context a holding-related workflow carries in its query string. */
export interface InvestmentContext {
  readonly portfolioId?: string;
  readonly securityId?: string;
  readonly reportId?: string;
}

/**
 * Read the context from a query string. A blank parameter is treated as absent rather than as an empty identity,
 * so `?portfolioId=` cannot address a portfolio whose id is the empty string.
 */
export function readInvestmentContext(params: URLSearchParams): InvestmentContext {
  return {
    ...valueOrAbsent('portfolioId', params),
    ...valueOrAbsent('securityId', params),
    ...valueOrAbsent('reportId', params),
  };
}

function valueOrAbsent(key: string, params: URLSearchParams): Record<string, string> {
  const raw = params.get(key);
  if (raw === null) return {};
  const trimmed = raw.trim();
  return trimmed.length === 0 ? {} : { [key]: trimmed };
}

/**
 * Rebuild a query string from a context, omitting anything absent. Keys are written in a fixed order so the same
 * context always produces the same href (stable links, stable tests, no spurious history entries).
 */
export function investmentContextSearch(context: InvestmentContext): string {
  const params = new URLSearchParams();
  for (const key of ['portfolioId', 'securityId', 'reportId'] as const) {
    const value = context[key];
    if (value !== undefined && value.length > 0) params.set(key, value);
  }
  const query = params.toString();
  return query.length === 0 ? '' : `?${query}`;
}

/**
 * The stored company assessment route, carrying whatever context applies.
 *
 * `reportId` selects one stored version; without it the server serves the chain head. `portfolioId` + `securityId`
 * together address a held position — the company page renders a held disposition only when BOTH are present.
 */
export function companyAssessmentHref(issuerId: string, context: InvestmentContext = {}): string {
  return `/investment/company/${encodeURIComponent(issuerId)}${investmentContextSearch(context)}`;
}

/** The same assessment, scrolled to the change history section (IID-03). */
export function changeHistoryHref(issuerId: string, context: InvestmentContext = {}): string {
  return `${companyAssessmentHref(issuerId, context)}#change-timeline`;
}

/**
 * The candidate route (AC-6.7). A candidate is addressed by security alone; `portfolio` is optional context and is
 * deliberately NOT the held-position pair, because a candidate has no position key.
 */
export function candidateAssessmentHref(securityId: string, portfolioId?: string): string {
  const base = `/investment/candidate/${encodeURIComponent(securityId)}`;
  return portfolioId === undefined || portfolioId.length === 0
    ? base
    : `${base}?portfolio=${encodeURIComponent(portfolioId)}`;
}

/** The originating portfolio route, for the return link. */
export function userPortfolioHref(portfolioId: string): string {
  return `/user-portfolios/${encodeURIComponent(portfolioId)}`;
}

/**
 * The three independent IID capability workspaces.
 *
 * Each is a real application route with its own state and workflow. The landing page `/investment`
 * remains the overview that names them; these are the working destinations.
 *
 * The context travels in the query string, so a capability opened from another capability keeps the
 * issuer, portfolio, security and assessment version the reader was working with. Absent members stay
 * absent — nothing is defaulted or inferred.
 */
export const CAPABILITY_ROUTES = Object.freeze({
  /** IID-01 — Stock Intelligence: the company assessment workflow. */
  stockIntelligence: '/investment/stock-intelligence',
  /** IID-02 — Investment & Holding Decisions: candidate and held dispositions. */
  holdingDecisions: '/investment/holding-decisions',
  /** IID-03 — Historical Change Intelligence: version history and comparisons. */
  changeIntelligence: '/investment/change-intelligence',
});

/**
 * IID-01 — Stock Intelligence, carrying whatever context applies.
 *
 * `issuerId` is carried when there is one, because IID-01 is addressed by ISSUER: a reader who
 * arrives from IID-03 with a company selected lands on that company, not on an empty workspace.
 */
export function stockIntelligenceHref(
  context: InvestmentContext = {},
  issuerId?: string | null,
): string {
  const issuer = issuerId === null || issuerId === undefined ? null : issuerId.trim();
  const params = new URLSearchParams();
  if (issuer !== null && issuer.length > 0) params.set('issuerId', issuer);
  for (const key of ['portfolioId', 'securityId', 'reportId'] as const) {
    const value = context[key];
    if (value !== undefined && value.length > 0) params.set(key, value);
  }
  const query = params.toString();
  return `${CAPABILITY_ROUTES.stockIntelligence}${query.length === 0 ? '' : `?${query}`}`;
}

/**
 * IID-02 — Investment & Holding Decisions, carrying whatever context applies.
 *
 * `issuerId` is carried when there is one for the same reason: the subject the reader was working
 * with must not be lost by moving between capabilities. IID-02 itself is addressed by portfolio and
 * security, so the issuer is context there rather than the address.
 */
export function holdingDecisionsHref(
  context: InvestmentContext = {},
  issuerId?: string | null,
): string {
  const issuer = issuerId === null || issuerId === undefined ? null : issuerId.trim();
  const params = new URLSearchParams();
  if (issuer !== null && issuer.length > 0) params.set('issuerId', issuer);
  for (const key of ['portfolioId', 'securityId', 'reportId'] as const) {
    const value = context[key];
    if (value !== undefined && value.length > 0) params.set(key, value);
  }
  const query = params.toString();
  return `${CAPABILITY_ROUTES.holdingDecisions}${query.length === 0 ? '' : `?${query}`}`;
}

/**
 * IID-03 — Historical Change Intelligence, carrying whatever context applies.
 *
 * `issuerId` is carried as `issuerId` because this capability is addressed by ISSUER (a change
 * history belongs to a company), while the other two are addressed by holding or candidate.
 */
export function changeIntelligenceHref(
  issuerId: string | null | undefined,
  context: InvestmentContext = {},
): string {
  const issuer = issuerId === null || issuerId === undefined ? null : issuerId.trim();
  const params = new URLSearchParams();
  if (issuer !== null && issuer.length > 0) params.set('issuerId', issuer);
  for (const key of ['portfolioId', 'securityId', 'reportId'] as const) {
    const value = context[key];
    if (value !== undefined && value.length > 0) params.set(key, value);
  }
  const query = params.toString();
  return `${CAPABILITY_ROUTES.changeIntelligence}${query.length === 0 ? '' : `?${query}`}`;
}
