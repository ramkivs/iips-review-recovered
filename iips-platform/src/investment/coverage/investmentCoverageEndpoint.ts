/**
 * IID — the investment-coverage endpoint: the dataset's own coverage, independent of identity.
 *
 *   GET /api/investment/coverage/investment?asOf=YYYY-MM-DD   → application/json
 *
 * WHY A SEPARATE ENDPOINT
 *   `GET /api/investment/coverage` is the IDENTITY coverage read. It fails closed with 503 when
 *   the eligible roster, listing map or corporate-action table cannot be loaded — correctly, because
 *   a row cannot be classified without them.
 *
 *   The INVESTMENT coverage read answers a different question: what investment data does the served
 *   dataset actually cover? That is answered by the local snapshot store and the sector
 *   measurement, neither of which reads an identity file. When the identity sources were absent,
 *   this endpoint still answers, because the dataset position is unaffected by them.
 *
 *   The identity dependency is DISCLOSED here, not enforced: `identitySourcesAvailable` is false
 *   and each issuer row carries its own `identityDependency` flag. Nothing is estimated and no
 *   issuer is invented.
 *
 * READ-ONLY. No write, no store, no cache, no persistence.
 */
import {
  buildInvestmentCoverageReport,
  type InvestmentCoverageReport,
} from '../coverage/investmentCoverage';
import type { CoverageHttpRequest, CoverageHttpResponse } from '../identity/coverageEndpoint';

/** The route this endpoint owns. */
export const INVESTMENT_COVERAGE_ROUTES = Object.freeze({
  json: '/api/investment/coverage/investment',
});

/** Everything the endpoint needs, injected. No file, network or clock access happens inside. */
export interface InvestmentCoverageDependencies {
  /**
   * Read the dataset and produce the report. Returning a report is the only success path.
   * A provider that throws is an investment-coverage failure — reported as 503 naming the cause.
   */
  readonly readInvestmentCoverage: (asOf: string) => Promise<InvestmentCoverageReport> | InvestmentCoverageReport;
  /** Injected clock — the endpoint never reads the wall clock itself. */
  readonly today: () => string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function json(status: number, payload: unknown): CoverageHttpResponse {
  return {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
    body: `${JSON.stringify(payload, null, 2)}\n`,
  };
}

/**
 * Handle one request. Returns `null` when the path is not ours, so a composition root can fall
 * through to the next transport without this handler swallowing the route.
 */
export async function handleInvestmentCoverageRequest(
  request: CoverageHttpRequest,
  dependencies: InvestmentCoverageDependencies,
): Promise<CoverageHttpResponse | null> {
  const rawUrl = request.url;
  const [pathname = '', query = ''] = rawUrl.split('?');
  if (pathname !== INVESTMENT_COVERAGE_ROUTES.json) return null;

  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    return json(405, { error: 'method-not-allowed', allowed: ['GET', 'HEAD'] });
  }

  const params = new URLSearchParams(query);
  const rawAsOf = params.get('asOf');
  const asOf = rawAsOf === null ? dependencies.today() : rawAsOf.trim();
  if (!ISO_DATE.test(asOf)) {
    return json(400, {
      error: 'invalid-asOf',
      detail: `asOf must be YYYY-MM-DD, received "${asOf}"`,
    });
  }

  let report: InvestmentCoverageReport;
  try {
    report = await dependencies.readInvestmentCoverage(asOf);
  } catch (error) {
    // An investment-coverage failure. It names itself; it never borrows identity's wording.
    return json(503, {
      error: 'investment-coverage-unavailable',
      detail:
        'The investment dataset could not be read, so no investment coverage could be computed. This is not an identity-source problem.',
      asOf,
      issues: [
        {
          code: 'INVESTMENT_DATASET_UNREADABLE',
          subject: 'investment dataset',
          detail: error instanceof Error ? error.message : String(error),
        },
      ],
    });
  }

  return json(200, report);
}
