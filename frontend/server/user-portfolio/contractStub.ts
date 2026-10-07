/**
 * G-2 Durable User Portfolio — SCRIPTED WIRE STUB (test support ONLY).
 *
 * A node:http server that replays scripted responses shaped EXACTLY like the
 * pinned G24 wire contract. It exists so the adapter, boundary, and transport
 * can be verified WITHOUT a live G24 process (which needs SQLite + an IdP).
 *
 * WHAT THIS IS NOT (binding):
 *   - NOT the authoritative implementation (that is G24 @ 6828155e, IPD-owned).
 *   - NOT a portfolio domain: ZERO domain logic lives here — no consolidation,
 *     no revision arithmetic, no duplicate detection, no identity resolution, no
 *     tenancy decisions. It replays bytes; every replayed shape is cited below.
 *   - NOT reachable from any non-test module: production code never imports it
 *     (it is imported only from `*.test.ts` files in this directory).
 *
 * CITED SHAPES (all mirrors of G24 `src/server/http-server.ts` @ blob
 * `17f9cb8a21cbabfc956daee660fa7efb5445da94`):
 *   - health envelope ............ `{status:'UP', mode:'NON_PRODUCTION',
 *                                   persistence:'CONNECTED'}` (unauthenticated)
 *   - portfolio view ............. eleven `presentPortfolio` fields
 *   - collection projection ...... nine list-item fields (no holdings)
 *   - save envelope .............. success/isDuplicate/disposition/revision/…
 *   - delete envelope ............ `{portfolioId, deletedAt}`
 *   - revisions envelope ......... `{revisions: [{revision, operation, …}]}`
 *   - error envelope ............. `{error, message?}` + G24 status codes
 *     (400 SAVE_GUARD_VIOLATION / INVALID_REQUEST, 401, 403, 404, 405, 409,
 *     503 — see G24 `src/server/errors.ts` @ blob `5bf8593f…`)
 *
 * The stub records every request it receives (method, path, headers, body) so
 * tests can assert EXACT request formation (route, verb, bearer, tenant hint,
 * payload) in addition to response mapping.
 */
import http from 'node:http';
import type { AddressInfo } from 'node:net';

/** One recorded upstream request. */
export interface StubRequest {
  readonly method: string;
  readonly path: string;
  readonly authorization: string | undefined;
  readonly tenantHint: string | undefined;
  readonly contentType: string | undefined;
  readonly body: unknown;
}

/** One scripted upstream response. */
export interface StubResponse {
  readonly status: number;
  readonly body: unknown;
  /** When true, the body is sent VERBATIM (for malformed-JSON cases). */
  readonly raw?: boolean;
}

/** Behavior: decide the response for an incoming request (pure replay). */
export type StubBehavior = (request: StubRequest) => StubResponse;

export interface ContractStub {
  readonly baseUrl: string;
  readonly requests: readonly StubRequest[];
  close(): Promise<void>;
}

/** Reads the full request body as text (bounded, like-for-like with G24). */
function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > 8 * 1024 * 1024) {
        reject(new Error('stub body too large'));
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/** Starts the stub on a loopback ephemeral port. */
export async function startContractStub(behavior: StubBehavior): Promise<ContractStub> {
  const recorded: StubRequest[] = [];
  const server = http.createServer((req, res) => {
    void (async () => {
      const raw = await readBody(req);
      let parsed: unknown = null;
      if (raw.trim() !== '') {
        try {
          parsed = JSON.parse(raw) as unknown;
        } catch {
          parsed = { __stubUnparsable: raw };
        }
      }
      const seen: StubRequest = {
        method: (req.method ?? 'GET').toUpperCase(),
        path: (req.url ?? '/').split('?')[0],
        authorization: req.headers.authorization,
        tenantHint: req.headers['x-ipd-tenant-id'] as string | undefined,
        contentType: req.headers['content-type'],
        body: parsed,
      };
      recorded.push(seen);
      const { status, body, raw: isRaw } = behavior(seen);
      const payload = isRaw ? String(body) : JSON.stringify(body);
      res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'content-length': Buffer.byteLength(payload),
        'cache-control': 'no-store',
      });
      res.end(payload);
    })();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    requests: recorded,
    close: () =>
      new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve()))),
  };
}

// ---------------------------------------------------------------------------
// Canned G24-shaped fixtures (mirrors of `presentPortfolio` et al — values are
// arbitrary test labels; SHAPES are the cited contract).
// ---------------------------------------------------------------------------

export const STUB_PORTFOLIO_ID = 'stub-portfolio-1';
export const STUB_TENANT = 'tenant-A';
export const STUB_BEARER = 'stub-user-bearer';

export function stubHolding(symbol = 'STUBCO'): Record<string, unknown> {
  return {
    symbol,
    companyId: 'C-STUB',
    isin: 'INE000STUB01',
    exchange: 'NSE',
    quantity: 10,
    averageBuyPrice: 100,
    currentPrice: 110,
    marketValue: 1100,
    weightPercentage: 100,
    active: true,
    sourceBroker: 'DHAN',
    lineageDigest: 'stub-lineage',
    identityStatus: 'RESOLVED',
    resolutionDisposition: 'CANONICAL_P04',
  };
}

export function stubContribution(): Record<string, unknown> {
  return {
    sourceBroker: 'DHAN',
    fileName: 'stub-holdings.csv',
    contentDigest: 'stub-content-digest',
    lineageDigest: 'stub-lineage',
    importedAt: '2026-10-07T00:00:00.000Z',
    holdingsCount: 1,
    totalMarketValue: 1100,
  };
}

export function stubPortfolioView(
  portfolioId: string = STUB_PORTFOLIO_ID,
  revision = 1,
): Record<string, unknown> {
  return {
    portfolioId,
    portfolioName: 'Stub Portfolio',
    revision,
    holdings: [stubHolding()],
    totalMarketValue: 1100,
    totalHoldingsCount: 1,
    weightSumPercentage: 100,
    lastUpdated: '2026-10-07T00:00:00.000Z',
    provenanceDigest: 'stub-provenance',
    isSaved: true,
    contributions: [stubContribution()],
  };
}

export function stubCreatedView(portfolioId: string): Record<string, unknown> {
  return {
    portfolioId,
    portfolioName: 'Stub Portfolio',
    revision: 0,
    holdings: [],
    totalMarketValue: 0,
    totalHoldingsCount: 0,
    weightSumPercentage: 0,
    lastUpdated: '2026-10-07T00:00:00.000Z',
    provenanceDigest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    isSaved: false,
    contributions: [],
  };
}

export function stubSummary(portfolioId: string = STUB_PORTFOLIO_ID): Record<string, unknown> {
  return {
    portfolioId,
    portfolioName: 'Stub Portfolio',
    revision: 1,
    totalMarketValue: 1100,
    totalHoldingsCount: 1,
    weightSumPercentage: 100,
    lastUpdated: '2026-10-07T00:00:00.000Z',
    provenanceDigest: 'stub-provenance',
    isSaved: true,
  };
}

export function stubRevisionEntry(revision: number, operation = 'MERGE'): Record<string, unknown> {
  return {
    revision,
    operation,
    totalMarketValue: 1100,
    provenanceDigest: 'stub-provenance',
    holdingsCount: 1,
    createdAt: '2026-10-07T00:00:00.000Z',
  };
}

export function stubSaveResult(portfolioId: string = STUB_PORTFOLIO_ID): Record<string, unknown> {
  return {
    success: true,
    isDuplicate: false,
    disposition: 'SAVED_NEW_BATCH',
    revision: 1,
    holdingsSavedCount: 1,
    totalMarketValue: 1100,
    weightSumPercentage: 100,
    savedAt: '2026-10-07T00:00:00.000Z',
    provenanceDigest: 'stub-provenance',
    portfolio: stubPortfolioView(portfolioId, 1),
  };
}
