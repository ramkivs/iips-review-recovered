/**
 * IID-1 — the read-only coverage endpoint.
 *
 * Framework-agnostic on purpose: it takes a request-shaped object and returns a response-shaped object,
 * so the same handler serves the local terminal, a test and the frontend transport without a second
 * implementation. It performs no I/O of its own — the sources are injected — which is what makes the
 * fail-closed behaviour testable.
 *
 *   GET /api/investment/coverage?asOf=YYYY-MM-DD   → application/json
 *   GET /investment/coverage?asOf=YYYY-MM-DD       → text/html (the minimal view)
 *
 * Fail-closed: if the identity sources cannot be loaded, the answer is 503 with the file-level issues.
 * There is no fallback roster, no cached previous report and no partially classified output.
 */
import { buildFinancialCoverageDisclosure, computeIdentityCoverage, type FinancialCoverageDisclosure, type IdentityCoverageReport } from './coverage';
import { renderCoverageHtml, renderUnavailableHtml } from './coverageView';
import { projectD114SecurityIdentity } from './d114Projection';
import type { SourceIssue, SourceLoadResult } from './sources';
import type { IdentityObservation } from './types';

export const COVERAGE_ROUTES = Object.freeze({
  json: '/api/investment/coverage',
  html: '/investment/coverage',
  /**
   * Broker-import preview rows are not persisted anywhere — they live in the browser session. Rather
   * than inventing a preview store (forbidden: no new persistence), the preview is evaluated on the
   * rows the client already holds. Read-only, no writes, no echo of any canonical identity the
   * pipeline resolved.
   */
  previewEvaluation: '/api/investment/coverage/preview',
});

/** One preview row as the broker-import surface publishes it. */
export interface PreviewRowInput {
  readonly symbol?: unknown;
  readonly isin?: unknown;
  readonly exchange?: unknown;
  readonly series?: unknown;
  readonly securityIdentity?: unknown;
  readonly quantity?: unknown;
  readonly identityStatus?: unknown;
}

export const PREVIEW_LIMITS = Object.freeze({ maxRows: 5000 });

export interface CoverageHttpRequest {
  readonly method: string;
  readonly url: string;
}

export interface CoverageHttpResponse {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
}

/** Everything the handler needs, injected. No file, network or clock access happens inside. */
export interface CoverageDependencies {
  readonly loadSources: () => Promise<SourceLoadResult> | SourceLoadResult;
  readonly observations: (asOf: string) => Promise<readonly IdentityObservation[]> | readonly IdentityObservation[];
  readonly financialCoverage:
    | (() => Promise<FinancialCoverageDisclosure> | FinancialCoverageDisclosure)
    | undefined;
  /** Injected clock — resolution never reads the wall clock itself. */
  readonly today: () => string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function json(status: number, payload: unknown, extraHeaders: Readonly<Record<string, string>> = {}): CoverageHttpResponse {
  return {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
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

function emptyFinancialCoverage(): FinancialCoverageDisclosure {
  return buildFinancialCoverageDisclosure({});
}

type Target = 'JSON' | 'HTML';

function matchTarget(pathname: string): Target | null {
  if (pathname === COVERAGE_ROUTES.json) return 'JSON';
  if (pathname === COVERAGE_ROUTES.html) return 'HTML';
  return null;
}

/**
 * Handle one request. Returns `null` when the path is not ours, so a composition root can fall through
 * to the next transport without this handler swallowing the route.
 */
export async function handleCoverageRequest(
  request: CoverageHttpRequest,
  dependencies: CoverageDependencies,
): Promise<CoverageHttpResponse | null> {
  const rawUrl = request.url;
  const [pathname = '', query = ''] = rawUrl.split('?');
  const target = matchTarget(pathname);
  if (target === null) return null;

  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    return json(405, { error: 'method-not-allowed', allowed: ['GET', 'HEAD'] }, { allow: 'GET, HEAD' });
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

  const loaded = await dependencies.loadSources();
  if (!loaded.available) {
    const payload = {
      error: 'identity-sources-unavailable',
      detail:
        'The eligible roster, listing map or corporate-action table could not be loaded. No identity is established and no row is classified.',
      asOf,
      issues: loaded.issues,
    };
    return target === 'JSON' ? json(503, payload) : html(503, renderUnavailableHtml(loaded.issues, asOf));
  }

  let observations: readonly IdentityObservation[];
  try {
    observations = await dependencies.observations(asOf);
  } catch (error) {
    const issues: SourceIssue[] = [
      {
        file: 'eligible-roster.json',
        code: 'OBSERVATION_SOURCE_UNAVAILABLE',
        subject: 'holdings/broker-preview/watchlist',
        detail: error instanceof Error ? error.message : String(error),
      },
    ];
    const payload = { error: 'observation-sources-unavailable', asOf, issues };
    return target === 'JSON' ? json(503, payload) : html(503, renderUnavailableHtml(issues, asOf));
  }

  const financialCoverage =
    dependencies.financialCoverage === undefined
      ? emptyFinancialCoverage()
      : await dependencies.financialCoverage();

  const report: IdentityCoverageReport = computeIdentityCoverage({
    observations,
    sources: loaded.sources,
    asOf,
    generatedAt: `${asOf}T00:00:00.000Z`,
    financialCoverage,
  });

  return target === 'JSON' ? json(200, report) : html(200, renderCoverageHtml(report));
}

/** Minimal node:http binder used by the local server; keeps the handler itself transport-free. */
export async function bindCoverageToHttp(
  request: { method?: string; url?: string },
  response: {
    writeHead(status: number, headers?: Record<string, string>): unknown;
    end(body?: string): unknown;
  },
  dependencies: CoverageDependencies,
): Promise<boolean> {
  const result = await handleCoverageRequest(
    { method: request.method ?? 'GET', url: request.url ?? '/' },
    dependencies,
  );
  if (result === null) return false;
  response.writeHead(result.status, { ...result.headers });
  response.end(request.method?.toUpperCase() === 'HEAD' ? '' : result.body);
  return true;
}

/* ------------------------------------------------ broker-preview evaluation */

function previewString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

/**
 * Evaluate the broker-import preview against the same resolver, with no persistence and no side effects.
 *
 * The rows are treated as observations exactly like holdings: a preview row that cannot be resolved is
 * reported with its state, and the preview's own `identityStatus` is carried through for reconciliation
 * but never believed.
 */
export async function handlePreviewEvaluationRequest(
  request: { readonly method: string; readonly url: string; readonly body: string },
  dependencies: CoverageDependencies,
): Promise<CoverageHttpResponse | null> {
  const [pathname = '', query = ''] = request.url.split('?');
  if (pathname !== COVERAGE_ROUTES.previewEvaluation) return null;
  const method = request.method.toUpperCase();
  if (method !== 'POST') {
    return json(405, { error: 'method-not-allowed', allowed: ['POST'] }, { allow: 'POST' });
  }

  const params = new URLSearchParams(query);
  const rawAsOf = params.get('asOf');
  const asOf = rawAsOf === null ? dependencies.today() : rawAsOf.trim();
  if (!ISO_DATE.test(asOf)) {
    return json(400, { error: 'invalid-asOf', detail: `asOf must be YYYY-MM-DD, received "${asOf}"` });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(request.body === '' ? 'null' : request.body);
  } catch (error) {
    return json(400, {
      error: 'invalid-body',
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  const root = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  const rows = Array.isArray(root.holdings) ? (root.holdings as readonly unknown[]) : null;
  if (rows === null) {
    return json(400, { error: 'invalid-body', detail: 'body must be { broker?: string, holdings: [...] }' });
  }
  if (rows.length > PREVIEW_LIMITS.maxRows) {
    return json(413, {
      error: 'preview-too-large',
      detail: `${rows.length} rows exceeds the ${PREVIEW_LIMITS.maxRows}-row evaluation limit`,
    });
  }

  const loaded = await dependencies.loadSources();
  if (!loaded.available) {
    return json(503, {
      error: 'identity-sources-unavailable',
      detail: 'The eligible roster, listing map or corporate-action table could not be loaded. The preview was not evaluated.',
      asOf,
      issues: loaded.issues,
    });
  }

  const broker = previewString(root.broker) ?? 'unknown-broker';
  const observations: IdentityObservation[] = rows.map((raw, index) => {
    const row =
      typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
    const symbol = previewString(row.symbol);
    const flatIsin = previewString(row.isin);
    const flatSeries = previewString(row.series);
    const exchange = previewString(row.exchange);
    const identityStatus = previewString(row.identityStatus);
    const projected = projectD114SecurityIdentity({
      securityIdentity: row.securityIdentity,
      flatIsin,
      flatSeries,
    });
    const rawFields: Record<string, string | number | boolean | null> = {
      symbol,
      isin: projected.isin ?? flatIsin,
      exchange,
      identityStatus,
    };
    if (projected.series !== null) rawFields.series = projected.series;
    if (projected.kind === 'populated' && projected.securityIdentity) {
      rawFields['securityIdentity.securityId'] = projected.securityIdentity.securityId;
      rawFields['securityIdentity.isin'] = projected.securityIdentity.isin;
      rawFields['securityIdentity.series'] = projected.securityIdentity.series;
      rawFields['securityIdentity.isinAuthority'] = projected.securityIdentity.isinAuthority;
    } else if (projected.kind === 'unresolved_null') {
      rawFields.securityIdentity = null;
    } else if (projected.kind === 'rejected') {
      rawFields.securityIdentityMalformed = true;
    }
    if (typeof row.quantity === 'number' && Number.isFinite(row.quantity)) rawFields.quantity = row.quantity;
    return {
      observationId: `preview:${broker}:${String(index + 1).padStart(4, '0')}`,
      source: 'BROKER_PREVIEW',
      portfolioId: null,
      isin: projected.isin,
      symbol,
      exchange,
      series: projected.series,
      cin: null,
      companyIdHint: null,
      ...(projected.rejection !== null ? { securityIdentityRejection: projected.rejection } : {}),
      ...(projected.securityIdentity !== undefined ? { securityIdentity: projected.securityIdentity } : {}),
      displayName: null,
      quantity: typeof row.quantity === 'number' && Number.isFinite(row.quantity) ? row.quantity : null,
      upstreamStatus: identityStatus,
      raw: rawFields,
    };
  });

  const report: IdentityCoverageReport = computeIdentityCoverage({
    observations,
    sources: loaded.sources,
    asOf,
    generatedAt: `${asOf}T00:00:00.000Z`,
    financialCoverage:
      dependencies.financialCoverage === undefined ? emptyFinancialCoverage() : await dependencies.financialCoverage(),
  });
  return json(200, { broker, mode: 'PREVIEW_EVALUATION_ONLY', persisted: false, report });
}
