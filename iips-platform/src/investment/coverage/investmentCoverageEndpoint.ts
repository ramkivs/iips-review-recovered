/**
 * IID — the investment-coverage endpoint: the dataset's own coverage, independent of identity.
 *
 *   GET /api/investment/coverage/investment?asOf=YYYY-MM-DD   → application/json
 *   GET /investment/coverage?asOf=YYYY-MM-DD                   → text/html (the JS-free view)
 *
 * THE HTML ROUTE IS THIS CAPABILITY'S OWN (`G-10`). `/investment/coverage` is the path the SPA and the
 * navigation model use for INVESTMENT coverage. Until 2026-11-17 the only HTML served there was the
 * IDENTITY capability's view, which answered `503 Investment identity coverage unavailable` whenever the
 * identity files were absent — while this read answered `200` without them. The route now renders this
 * endpoint's own report (`investmentCoverageView`), and the identity view has moved to the identity
 * capability's own path, `/identity-coverage`, where the SPA already puts it.
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
import {
  renderInvestmentCoverageHtml,
  renderInvestmentCoverageUnavailableHtml,
} from './investmentCoverageView';

/** The routes this endpoint owns. */
export const INVESTMENT_COVERAGE_ROUTES = Object.freeze({
  json: '/api/investment/coverage/investment',
  html: '/investment/coverage',
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

function html(status: number, body: string): CoverageHttpResponse {
  return {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'",
      'x-content-type-options': 'nosniff',
    },
    body,
  };
}

type Target = 'JSON' | 'HTML';

function matchTarget(pathname: string): Target | null {
  if (pathname === INVESTMENT_COVERAGE_ROUTES.json) return 'JSON';
  if (pathname === INVESTMENT_COVERAGE_ROUTES.html) return 'HTML';
  return null;
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
  const target = matchTarget(pathname);
  if (target === null) return null;

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
    const detail = error instanceof Error ? error.message : String(error);
    if (target === 'HTML') {
      // The JS-free view states the same cause in the same words: the dataset, not the identity files.
      return html(503, renderInvestmentCoverageUnavailableHtml(detail, asOf));
    }
    return json(503, {
      error: 'investment-coverage-unavailable',
      detail:
        'The investment dataset could not be read, so no investment coverage could be computed. This is not an identity-source problem.',
      asOf,
      issues: [
        {
          code: 'INVESTMENT_DATASET_UNREADABLE',
          subject: 'investment dataset',
          detail,
        },
      ],
    });
  }

  return target === 'HTML' ? html(200, renderInvestmentCoverageHtml(report)) : json(200, report);
}
