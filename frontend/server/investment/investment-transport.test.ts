/**
 * IID-3 — read transport tests.
 *
 * These are HTTP-shape tests: a fake request/response pair, the real service, a real store in a temporary
 * directory. What they pin down is the contract a browser and an auditor both depend on:
 *
 *   AC-3.7  no mutating method is routed at all (405 before any owner or store resolution)
 *   AC-3.8  no path, owner pair, SQL, stack trace or raw store message in any response body
 *   AC-3.2  a corrupted chain answers 503 with no data, never a partial history
 *   AC-3.6  an unresolvable persistence boundary answers a static 503, with no substitute store
 *
 * @vitest-environment node
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type http from 'node:http';

import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';
import { adaptNp04Store } from '../reports/np04-adapter';
import { NP04_DATABASE_PATH_ENV } from '../reports/persistence-port';
import { REPORTS_OWNER_PATH_ENV } from '../reports-owner-resolver';
import {
  INVESTMENT_ROUTES,
  INVESTMENT_TRANSPORT_ERRORS,
  INVESTMENT_TRANSPORT_SEMANTICS,
  buildAssessmentResponse,
  handleInvestmentRequest,
  parseInvestmentRoute,
} from './investment-transport';
import { createInvestmentArtifactService } from './investmentArtifacts';
import { M1_ISSUER_ID } from './demo/m1Data';
import { M1_NOW, M1_NOW_V2, assembleAssessment, prepareM1Environment } from './demo/m1Pipeline';

const OWNER = { tenantId: 'iid3-transport-tenant', userId: 'iid3-transport-owner' } as const;
const SCOPE = `co:${M1_ISSUER_ID}`;
const OWNER_CONTEXT = { tenantId: OWNER.tenantId, ownerUserId: OWNER.userId };
const resolveOwner = (): typeof OWNER_CONTEXT => OWNER_CONTEXT;

const env = prepareM1Environment();
const v1 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
const v2 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV2Dir, generatedAt: M1_NOW_V2 });

const savedEnv = {
  db: process.env[NP04_DATABASE_PATH_ENV],
  carrier: process.env[REPORTS_OWNER_PATH_ENV],
};
let database: ReturnType<typeof openDatabase>;
let firstReportId = '';
let secondReportId = '';

beforeAll(() => {
  process.env[NP04_DATABASE_PATH_ENV] = env.dbPath;
  database = openDatabase({ path: env.dbPath, createDirectory: true, migrate: true });
  const service = createInvestmentArtifactService({
    port: adaptNp04Store(new GovernedArtifactStore(database)),
    owner: OWNER,
  });
  firstReportId = service.recordAssessment(v1.composed).head.reportId;
  secondReportId = service.recordAssessment(v2.composed).head.reportId;
});

afterAll(() => {
  (database as { close?: () => void }).close?.();
  env.cleanup();
});

beforeEach(() => {
  // `loadAuthoritativeNp04Persistence` reads the path at call time, so every test gets it.
  process.env[NP04_DATABASE_PATH_ENV] = env.dbPath;
});

afterEach(() => {
  if (savedEnv.db === undefined) delete process.env[NP04_DATABASE_PATH_ENV];
  else process.env[NP04_DATABASE_PATH_ENV] = savedEnv.db;
  if (savedEnv.carrier === undefined) delete process.env[REPORTS_OWNER_PATH_ENV];
  else process.env[REPORTS_OWNER_PATH_ENV] = savedEnv.carrier;
});

interface FakeResponse {
  status: number;
  headers: Record<string, string | string[] | number>;
  body: string;
}

async function call(
  method: string,
  url: string,
  deps: Parameters<typeof handleInvestmentRequest>[2] = {},
): Promise<FakeResponse> {
  const result: FakeResponse = { status: 0, headers: {}, body: '' };
  let finished = false;
  const res = {
    setHeader(name: string, value: string | string[] | number): void {
      result.headers[name.toLowerCase()] = value;
    },
    writeHead(status: number, headers?: Record<string, string | string[] | number>): void {
      result.status = status;
      for (const [name, value] of Object.entries(headers ?? {})) result.headers[name.toLowerCase()] = value;
    },
    end(chunk?: string): void {
      finished = true;
      if (typeof chunk === 'string') result.body = chunk;
    },
    get headersSent(): boolean {
      return result.status !== 0 && finished;
    },
    destroyed: false,
  } as unknown as http.ServerResponse;
  const req = { method, url } as http.IncomingMessage;
  const handled = await handleInvestmentRequest(req, res, { resolveOwner, ...deps });
  expect(handled).toBe(true);
  return result;
}

function jsonOf(response: FakeResponse): Record<string, unknown> {
  return JSON.parse(response.body) as Record<string, unknown>;
}

/** Anything a response must never contain (AC-3.8). */
function assertSanitized(response: FakeResponse): void {
  expect(response.body).not.toContain(env.root);
  expect(response.body).not.toContain('investment.db');
  expect(response.body).not.toContain(OWNER.tenantId);
  expect(response.body).not.toContain(OWNER.userId);
  expect(response.body.toLowerCase()).not.toContain('select ');
  expect(response.body.toLowerCase()).not.toContain('governed_artifacts');
  expect(response.body.toLowerCase()).not.toContain(' node_modules');
  expect(response.body).not.toMatch(/\bat .*\(.*:\d+:\d+\)/);
  expect(response.body).not.toContain('    at ');
  expect(response.body).not.toContain('stack');
}

describe('AC-3.7 — the route table is read-only', () => {
  it('routes only GET and HEAD, and declares no mutating operation', () => {
    for (const route of INVESTMENT_ROUTES) {
      expect(route.methods).toEqual(['GET', 'HEAD']);
      expect(route.mutating).toBe(false);
    }
    expect(INVESTMENT_TRANSPORT_SEMANTICS.mutatingOperations).toHaveLength(0);
    expect(INVESTMENT_TRANSPORT_SEMANTICS.methods).toEqual(['GET', 'HEAD']);
    expect(INVESTMENT_ROUTES.map((route) => route.pattern)).toEqual([
      '/api/investment/company/:issuerId',
      '/api/investment/company/:issuerId/versions/:reportId',
      '/api/investment/coverage',
    ]);
  });

  it('answers 405 and never reaches the owner or the store for a mutating method', async () => {
    let portLoaded = 0;
    let ownerResolved = 0;
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const response = await call(method, `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}`, {
        loadPort: async () => {
          portLoaded += 1;
          return null;
        },
        resolveOwner: () => {
          ownerResolved += 1;
          return OWNER_CONTEXT;
        },
      });
      expect(response.status).toBe(405);
      expect(response.headers.allow).toBe('GET, HEAD');
      expect(jsonOf(response)).toEqual({ error: 'method-not-allowed' });
    }
    expect(portLoaded).toBe(0);
    expect(ownerResolved).toBe(0);
  });
});

describe('AC-3.1 — an inadmissible scope is rejected before the store is touched', () => {
  it('answers 400 without resolving an owner or loading a port', async () => {
    let portLoaded = 0;
    let ownerResolved = 0;
    for (const issuerId of ['   ', 'co', 'zz:thing', 'IN EQISIN X']) {
      const response = await call('GET', `/api/investment/company/${encodeURIComponent(issuerId)}`, {
        loadPort: async () => {
          portLoaded += 1;
          return null;
        },
        resolveOwner: () => {
          ownerResolved += 1;
          return OWNER_CONTEXT;
        },
      });
      expect(response.status).toBe(400);
      expect(jsonOf(response)).toEqual(INVESTMENT_TRANSPORT_ERRORS.scopeInvalid);
    }
    expect(portLoaded).toBe(0);
    expect(ownerResolved).toBe(0);
  });

  it('rejects malformed route shapes rather than guessing', () => {
    expect(parseInvestmentRoute('/api/investment/company')).toEqual({ kind: 'invalid' });
    expect(parseInvestmentRoute('/api/investment/company/X/versions')).toEqual({ kind: 'invalid' });
    expect(parseInvestmentRoute('/api/investment/company/X/versions/Y/extra')).toEqual({ kind: 'invalid' });
    expect(parseInvestmentRoute('/api/investment/coverage')).toBeNull();
    expect(parseInvestmentRoute('/api/other')).toBeNull();
  });
});

describe('successful reads', () => {
  it('serves the chain head with every disclosure-bearing section', async () => {
    const response = await call('GET', `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}`);
    expect(response.status).toBe(200);
    const body = jsonOf(response);
    expect(body.status).toBe('OK');
    expect(body.reportType).toBe('investment.company-assessment');
    const scope = body.scope as Record<string, unknown>;
    expect(scope.scopeToken).toBe(SCOPE);
    expect(scope.versionCount).toBe(2);
    const version = body.version as Record<string, unknown>;
    expect(version.artifactVersion).toBe(2);
    expect(version.reportId).toBe(secondReportId);
    expect(version.datasetClass).toBe('SYNTHETIC_REFERENCE');
    expect(Array.isArray(body.versions)).toBe(true);
    expect((body.versions as unknown[]).length).toBe(2);
    const assessment = body.assessment as Record<string, unknown>;
    expect((assessment.subject as Record<string, unknown>).issuerId).toBe(M1_ISSUER_ID);
    expect((assessment.disclosure as Record<string, unknown>).noTradeExecution).toBe(true);
    expect(Array.isArray(assessment.evidence)).toBe(true);
    expect((body.disclosures as Record<string, unknown>).decisionSupportOnly).toBe(true);
    expect(body.limitations).toContain('L-009');
    assertSanitized(response);
  });

  it('serves each stored version by id, from a validated chain', async () => {
    const first = await call('GET', `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}/versions/${firstReportId}`);
    expect(first.status).toBe(200);
    const firstBody = jsonOf(first);
    expect((firstBody.version as Record<string, unknown>).artifactVersion).toBe(1);
    expect((firstBody.version as Record<string, unknown>).payloadDigest).toBe(v1.composed.payloadDigest);
    expect((firstBody.scope as Record<string, unknown>).versionCount).toBe(2);
    assertSanitized(first);

    const second = await call('GET', `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}/versions/${secondReportId}`);
    expect(second.status).toBe(200);
    expect((jsonOf(second).version as Record<string, unknown>).payloadDigest).toBe(v2.composed.payloadDigest);
  });

  it('answers HEAD with headers and no body', async () => {
    const head = await call('HEAD', `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}`);
    expect(head.status).toBe(200);
    expect(head.body).toBe('');
    expect(head.headers['x-investment-artifact-version']).toBe('2');
    expect(head.headers['cache-control']).toBe('no-store');
  });

  it('is idempotent across repeated reads (no version is created by reading)', async () => {
    await call('GET', `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}`);
    const again = await call('GET', `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}`);
    expect((jsonOf(again).scope as Record<string, unknown>).versionCount).toBe(2);
  });
});

describe('fail-closed reads', () => {
  it('answers 404 for an unknown issuer scope and for an unknown version', async () => {
    const unknownScope = await call('GET', '/api/investment/company/IN%3AEQISIN%3AIN0000000888');
    expect(unknownScope.status).toBe(404);
    expect(jsonOf(unknownScope)).toEqual(INVESTMENT_TRANSPORT_ERRORS.notFound);

    const unknownVersion = await call(
      'GET',
      `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}/versions/not-a-real-report-id`,
    );
    expect(unknownVersion.status).toBe(404);
    expect(jsonOf(unknownVersion)).toEqual(INVESTMENT_TRANSPORT_ERRORS.notFound);
    assertSanitized(unknownVersion);
  });

  it('answers 503 owner-context-unavailable when no owner is established', async () => {
    const response = await call('GET', `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}`, {
      resolveOwner: () => null,
    });
    expect(response.status).toBe(503);
    const body = jsonOf(response);
    expect(body.error).toBe('owner-context-unavailable');
    assertSanitized(response);
  });

  it('answers the static persistence-unavailable 503 when the boundary cannot be resolved', async () => {
    const response = await call('GET', `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}`, {
      loadPort: async () => null,
    });
    expect(response.status).toBe(503);
    expect(jsonOf(response)).toEqual(INVESTMENT_TRANSPORT_ERRORS.persistenceUnavailable);
    assertSanitized(response);
  });

  it('answers the same 503 when the injected object is not a port at all (no substitute store)', async () => {
    const response = await call('GET', `/api/investment/company/${encodeURIComponent(M1_ISSUER_ID)}`, {
      loadPort: async () => ({ not: 'a port' }),
    });
    expect(response.status).toBe(503);
    expect(jsonOf(response)).toEqual(INVESTMENT_TRANSPORT_ERRORS.persistenceUnavailable);
    assertSanitized(response);
  });

  it('answers a sanitized integrity 503 for a corrupted chain, with no data', async () => {
    const response = await call('GET', '/api/investment/company/IN%3AEQISIN%3AIN0000000011', {
      loadPort: async () => ({
        createInstance: () => {
          throw new Error('unused');
        },
        appendVersion: () => {
          throw new Error('unused');
        },
        resolveById: () => {
          throw new Error('unused');
        },
        queryByOwner: () => ({ items: [{}], nextCursor: null }),
        listSupersededBy: () => ({ current: {}, versions: [] }),
      }),
    });
    expect(response.status).toBe(503);
    expect(jsonOf(response)).toEqual(INVESTMENT_TRANSPORT_ERRORS.integrityFailure);
    expect(response.body).not.toContain('reportId');
    assertSanitized(response);
  });
});

describe('the response envelope is a projection, not an editor', () => {
  it('carries the canonical payload verbatim and adds nothing to it', () => {
    const payload = v1.composed.content.canonicalPayload;
    const envelope = buildAssessmentResponse(
      {
        scopeToken: SCOPE,
        reportType: 'investment.company-assessment',
        reportKey: v1.composed.content.reportKey,
        chainRootReportId: firstReportId,
        versionCount: 1,
        versions: [],
        head: {
          reportId: firstReportId,
          artifactVersion: 1,
          supersedesReportId: null,
          generatedAt: M1_NOW,
          reportKey: v1.composed.content.reportKey,
          payloadDigest: v1.composed.payloadDigest,
          inputDigest: v1.composed.inputDigest,
          dataAsOf: '2026-06-30',
          knownAsOf: '2026-07-23T17:44:46Z',
          datasetVersion: 'x',
          contentDigest: 'y',
          modelVersion: 'm',
          policyVersion: 'p',
          adequacy: 'SUFFICIENT',
          qualityVerdict: 'CLEAN',
          confidence: 0.5,
          evidenceCount: 1,
          limitationCount: 1,
          datasetClass: 'SYNTHETIC_REFERENCE',
        },
      },
      {
        reportId: firstReportId,
        artifactVersion: 1,
        supersedesReportId: null,
        generatedAt: M1_NOW,
        reportKey: v1.composed.content.reportKey,
        payloadDigest: v1.composed.payloadDigest,
        inputDigest: v1.composed.inputDigest,
        dataAsOf: '2026-06-30',
        knownAsOf: '2026-07-23T17:44:46Z',
        datasetVersion: 'x',
        contentDigest: 'y',
        modelVersion: 'm',
        policyVersion: 'p',
        adequacy: 'SUFFICIENT',
        qualityVerdict: 'CLEAN',
        confidence: 0.5,
        evidenceCount: 1,
        limitationCount: 1,
        datasetClass: 'SYNTHETIC_REFERENCE',
      },
      payload,
    );
    expect(JSON.stringify(envelope.assessment)).toBe(JSON.stringify(JSON.parse(payload)));
  });
});
