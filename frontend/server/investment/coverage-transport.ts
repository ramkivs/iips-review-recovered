/**
 * IID-1 — investment identity coverage transport.
 *
 * Thin by design. All identity logic lives in `iips-platform/src/investment/identity` (IRR); this module
 * only (a) binds the transport-free handler to `node:http`, (b) injects the read-only observation sources
 * and (c) reads the versioned identity files from the existing local data domain.
 *
 *   GET  /api/investment/coverage?asOf=YYYY-MM-DD   → JSON report
 *   GET  /investment/coverage?asOf=YYYY-MM-DD        → server-rendered coverage view
 *   POST /api/investment/coverage/preview            → evaluate broker-preview rows held by the client
 *
 * FAIL-CLOSED. If the identity files cannot be loaded, the answer is 503 with the file-level issues. If a
 * source surface cannot be read (IPD unavailable, watchlists unreadable), the answer is also 503 naming
 * that surface — a coverage total that silently omits a surface would be a wrong total.
 *
 * NO WRITES. Nothing here persists, saves, resets or mutates. No NP-04 artefact is touched, no new store
 * is created, and the preview evaluation writes nothing at all.
 */
import type http from 'node:http';

import {
  COVERAGE_ROUTES,
  bindCoverageToHttp,
  handlePreviewEvaluationRequest,
  type CoverageDependencies,
} from '../../../iips-platform/src/investment/identity/coverageEndpoint';
import {
  handleInvestmentCoverageRequest as handleInvestmentCoverageEndpoint,
  INVESTMENT_COVERAGE_ROUTES,
  type InvestmentCoverageDependencies,
} from '../../../iips-platform/src/investment/coverage/investmentCoverageEndpoint';
import {
  investmentCoverageFromLocalDataset,
  loadRuntimeIdentitySources,
} from '../../../iips-platform/src/investment/identity/runtime';
import type { FinancialCoverageDisclosure } from '../../../iips-platform/src/investment/identity/coverage';
import type { InvestmentCoverageReport } from '../../../iips-platform/src/investment/coverage/investmentCoverage';
import type { SourceLoadResult } from '../../../iips-platform/src/investment/identity/sources';
import type { IdentityObservation } from '../../../iips-platform/src/investment/identity/types';

export interface CoverageTransportProviders {
  /** Read-only G3 holdings through the existing IPD IPC path. */
  readonly holdings: (asOf: string) => Promise<readonly IdentityObservation[]>;
  /** Existing watchlist entries. */
  readonly watchlist: (asOf: string) => Promise<readonly IdentityObservation[]>;
  /** Versioned identity files; defaults to `<IIPS_DATA_DIR>/investment/identity`. */
  readonly loadSources?: () => SourceLoadResult;
  readonly financialCoverage?: () => FinancialCoverageDisclosure | Promise<FinancialCoverageDisclosure>;
  readonly today?: () => string;
  /** Overrides the data-domain root for the default loader (tests / local overrides). */
  readonly dataRoot?: string;
  /** Bounds the preview body read. */
  readonly maxPreviewBytes?: number;
  /**
   * The INVESTMENT coverage read. Defaults to the local dataset, which does not depend on the
   * identity sources. A provider may be injected to test the investment-coverage failure mode
   * separately from the identity-source failure mode.
   */
  readonly readInvestmentCoverage?: (
    asOf: string,
  ) => Promise<InvestmentCoverageReport> | InvestmentCoverageReport;
}

const DEFAULT_MAX_PREVIEW_BYTES = 2 * 1024 * 1024;

export function defaultToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Build the handler's dependencies from injected providers. No I/O happens until a request arrives. */
export function coverageDependencies(providers: CoverageTransportProviders): CoverageDependencies {
  return {
    loadSources: providers.loadSources ?? (() => loadRuntimeIdentitySources(providers.dataRoot)),
    observations: async (asOf: string) => {
      const collected: IdentityObservation[] = [];
      const failures: string[] = [];
      for (const [surface, read] of [
        ['holdings', providers.holdings],
        ['watchlist', providers.watchlist],
      ] as const) {
        try {
          collected.push(...(await read(asOf)));
        } catch (error) {
          failures.push(`${surface}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      if (failures.length > 0) {
        // Deliberately fatal: a partial surface set would produce a coverage total that looks complete
        // and is not. The endpoint turns this into a 503 naming the surfaces.
        throw new Error(`coverage source surface unavailable (${failures.join('; ')})`);
      }
      return collected;
    },
    financialCoverage: providers.financialCoverage,
    // Resolution never reads the wall clock itself; the transport supplies the date once per request.
    today: providers.today ?? defaultToday,
  };
}

async function readBody(request: http.IncomingMessage, limit: number): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    size += buffer.byteLength;
    if (size > limit) throw new Error(`request body exceeds ${limit} bytes`);
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * Mount point for the composition root. Returns `true` when the request was ours (answered or refused),
 * `false` when the path belongs to another transport.
 */
export async function handleInvestmentCoverageRequest(
  request: http.IncomingMessage,
  response: http.ServerResponse,
  providers: CoverageTransportProviders,
): Promise<boolean> {
  const url = request.url ?? '/';
  const dependencies = coverageDependencies(providers);

  /*
   * IID — INVESTMENT COVERAGE, SERVED INDEPENDENTLY OF IDENTITY.
   *
   * The route is matched BEFORE the identity coverage route, because the identity handler matches
   * `/api/investment/coverage` exactly and would otherwise swallow it. The investment read never
   * consults the identity sources for anything but disclosure, so an absent identity roster cannot
   * turn this into an identity error.
   */
  if (url === INVESTMENT_COVERAGE_ROUTES.json || url.startsWith(`${INVESTMENT_COVERAGE_ROUTES.json}?`)) {
    const investmentDependencies: InvestmentCoverageDependencies = {
      readInvestmentCoverage: (asOf) =>
        providers.readInvestmentCoverage?.(asOf) ?? investmentCoverageFromLocalDataset(asOf, providers.dataRoot),
      today: providers.today ?? defaultToday,
    };
    const result = await handleInvestmentCoverageEndpoint(
      { method: request.method ?? 'GET', url },
      investmentDependencies,
    );
    if (result === null) return false;
    response.writeHead(result.status, { ...result.headers });
    response.end(request.method?.toUpperCase() === 'HEAD' ? '' : result.body);
    return true;
  }

  if (url === COVERAGE_ROUTES.previewEvaluation || url.startsWith(`${COVERAGE_ROUTES.previewEvaluation}?`)) {
    let body = '';
    try {
      body = await readBody(request, providers.maxPreviewBytes ?? DEFAULT_MAX_PREVIEW_BYTES);
    } catch (error) {
      response.writeHead(413, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
      response.end(
        `${JSON.stringify({
          error: 'preview-too-large',
          detail: error instanceof Error ? error.message : String(error),
        })}\n`,
      );
      return true;
    }
    const result = await handlePreviewEvaluationRequest(
      { method: request.method ?? 'GET', url, body },
      dependencies,
    );
    if (result === null) return false;
    response.writeHead(result.status, { ...result.headers });
    response.end(result.body);
    return true;
  }

  return bindCoverageToHttp(request, response, dependencies);
}

export const COVERAGE_TRANSPORT_SEMANTICS = Object.freeze({
  routes: [COVERAGE_ROUTES.json, COVERAGE_ROUTES.html, COVERAGE_ROUTES.previewEvaluation],
  writes: 'none',
  identityAuthority: 'IRR eligible roster + listing map + corporate-action table (versioned local files)',
  preview: 'evaluated in memory from rows the client already holds; nothing is stored',
  failureMode: '503 with file-level or surface-level issues; never a partial classification',
});
