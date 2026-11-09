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
