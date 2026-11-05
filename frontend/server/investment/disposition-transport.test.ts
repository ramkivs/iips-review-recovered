/**
 * IID-4 — disposition read transport tests.
 *
 *   read-only        no mutating method is routed at all (405 before owner or store resolution)
 *   no orders        the surface accepts no quantity, no price, no order and no intent
 *   sanitized        no path, owner pair, SQL, stack trace or store message in any body
 *   fail-closed      404 for an absent chain, 400 for an inadmissible identity, 503 for no store / no owner
 *
 * @vitest-environment node
 */
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type http from 'node:http';

import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';
import { adaptNp04Store } from '../reports/np04-adapter';
import { NP04_DATABASE_PATH_ENV } from '../reports/persistence-port';
import { REPORTS_OWNER_PATH_ENV } from '../reports-owner-resolver';
import {
  DISPOSITION_ROUTES,
  DISPOSITION_TRANSPORT_ERRORS,
  DISPOSITION_TRANSPORT_SEMANTICS,
  handleDispositionRequest,
  parseDispositionRoute,
} from './disposition-transport';
import { createDispositionRecordsService } from './dispositionService';
import {
  PORTFOLIO_ID,
  assessmentPayloadOf,
  buildPayload,
  candidateSubjectOf,
} from './dispositionTestFixtures';
import { M1_NOW, assembleAssessment, prepareM1Environment } from './demo/m1Pipeline';

const OWNER = { tenantId: 'iid4-transport-tenant', userId: 'iid4-transport-owner' } as const;
const OWNER_CONTEXT = { tenantId: OWNER.tenantId, ownerUserId: OWNER.userId };
const resolveOwner = (): typeof OWNER_CONTEXT => OWNER_CONTEXT;

const env = prepareM1Environment();
const v1 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
const ASSESSMENT = assessmentPayloadOf(v1);
const SECURITY_ID = v1.identity.securityId as string;
const REPORT_ID = v1.composed.engineOutputId;

const heldPayload = buildPayload({ payload: ASSESSMENT, assembly: v1, reportId: REPORT_ID, securityId: SECURITY_ID });
const candidatePayload = buildPayload({
  payload: ASSESSMENT,
  assembly: v1,
  reportId: REPORT_ID,
  securityId: SECURITY_ID,
  subject: candidateSubjectOf(ASSESSMENT, SECURITY_ID, PORTFOLIO_ID),
  portfolioFacts: { present: true, weightPct: 0, companyExposurePct: 0, sectorExposurePct: 40, topHoldingWeightPct: 40 },
});

const CONTEXT = {
  assessmentPayloadDigest: v1.composed.payloadDigest,
  assessmentInputDigest: v1.composed.inputDigest,
  generatedAt: M1_NOW,
  datasetClass: 'SYNTHETIC_REFERENCE' as const,
};

let database: ReturnType<typeof openDatabase>;

const savedEnv = {
  db: process.env[NP04_DATABASE_PATH_ENV],
  carrier: process.env[REPORTS_OWNER_PATH_ENV],
};

beforeAll(() => {
  process.env[NP04_DATABASE_PATH_ENV] = env.dbPath;
  database = openDatabase({ path: env.dbPath, createDirectory: true, migrate: true });
  const service = createDispositionRecordsService({
    port: adaptNp04Store(new GovernedArtifactStore(database)),
    owner: OWNER,
  });
  service.record(heldPayload, CONTEXT);
  service.record(candidatePayload, CONTEXT);
});

afterAll(() => {
  (database as { close?: () => void }).close?.();
  env.cleanup();
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
  deps: Parameters<typeof handleDispositionRequest>[2] = {},
): Promise<FakeResponse> {
  process.env[NP04_DATABASE_PATH_ENV] = env.dbPath;
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
  const handled = await handleDispositionRequest(req, res, { resolveOwner, ...deps });
  expect(handled).toBe(true);
  return result;
}

function jsonOf(response: FakeResponse): Record<string, unknown> {
  return JSON.parse(response.body) as Record<string, unknown>;
}

function assertSanitized(response: FakeResponse): void {
  expect(response.body).not.toContain(env.root);
  expect(response.body).not.toContain('investment.db');
  expect(response.body).not.toContain(OWNER.tenantId);
  expect(response.body).not.toContain(OWNER.userId);
  expect(response.body.toLowerCase()).not.toContain('select ');
  expect(response.body.toLowerCase()).not.toContain('governed_artifacts');
  expect(response.body).not.toMatch(/\bat .*\(.*:\d+:\d+\)/);
}

describe('the route table is read-only', () => {
  it('routes only GET and HEAD, and declares no mutating operation', () => {
    for (const route of DISPOSITION_ROUTES) {
      expect(route.methods).toEqual(['GET', 'HEAD']);
      expect(route.mutating).toBe(false);
    }
    expect(DISPOSITION_TRANSPORT_SEMANTICS.mutatingOperations).toHaveLength(0);
    expect(DISPOSITION_TRANSPORT_SEMANTICS.createsArtifacts).toBe(false);
    expect(DISPOSITION_TRANSPORT_SEMANTICS.appendsVersions).toBe(false);
    expect(DISPOSITION_TRANSPORT_SEMANTICS.acceptsOrders).toBe(false);
    expect(DISPOSITION_TRANSPORT_SEMANTICS.acceptsQuantities).toBe(false);
  });

  it('advertises exactly three patterns and none of them can carry an order', () => {
    expect(DISPOSITION_ROUTES.map((route) => route.pattern)).toEqual([
      '/api/investment/portfolio/:portfolioId/dispositions',
      '/api/investment/portfolio/:portfolioId/holding/:securityId',
      '/api/investment/candidate/:securityId',
    ]);
    for (const route of DISPOSITION_ROUTES) {
      expect(route.pattern).not.toMatch(/quantit|order|trade|buy|sell/i);
    }
  });

  it('answers 405 to every mutating method before any owner or store is touched', async () => {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const response = await call(method, `/api/investment/portfolio/${PORTFOLIO_ID}/dispositions`, {
        resolveOwner: () => null,
        loadPort: async () => {
          throw new Error('must not be called');
        },
      });
      expect(response.status).toBe(405);
      expect(jsonOf(response)).toEqual(DISPOSITION_TRANSPORT_ERRORS.methodNotAllowed);
    }
  });
});

describe('route parsing', () => {
  it('parses the documented shapes', () => {
    expect(parseDispositionRoute(`/api/investment/portfolio/${PORTFOLIO_ID}/dispositions`)).toEqual({
      kind: 'list',
      portfolioId: PORTFOLIO_ID,
    });
    expect(parseDispositionRoute(`/api/investment/portfolio/${PORTFOLIO_ID}/holding/${SECURITY_ID}`)).toEqual({
      kind: 'holding',
      portfolioId: PORTFOLIO_ID,
      securityId: SECURITY_ID,
    });
    expect(parseDispositionRoute(`/api/investment/candidate/${SECURITY_ID}?portfolio=${PORTFOLIO_ID}`)).toEqual({
      kind: 'candidate',
      securityId: SECURITY_ID,
      contextPortfolioId: PORTFOLIO_ID,
    });
    expect(parseDispositionRoute(`/api/investment/candidate/${SECURITY_ID}`)).toEqual({
      kind: 'candidate',
      securityId: SECURITY_ID,
      contextPortfolioId: null,
    });
  });

  it('rejects an inadmissible portfolio id rather than passing it to a store', () => {
    for (const bad of ['', 'has space', '../escape', 'x'.repeat(200)]) {
      const parsed = parseDispositionRoute(`/api/investment/portfolio/${encodeURIComponent(bad)}/dispositions`);
      expect(parsed).toEqual({ kind: 'invalid' });
    }
  });

  it('does not claim other investment paths', () => {
    expect(parseDispositionRoute('/api/investment/company/IN%3ACIN%3AL65110KA1981PLC013116')).toBeNull();
    expect(parseDispositionRoute('/api/executive/overview')).toBeNull();
  });

  it('rejects a security id that is not a security identity', async () => {
    const response = await call('GET', `/api/investment/portfolio/${PORTFOLIO_ID}/holding/AARAVSYN`);
    expect(response.status).toBe(400);
    expect(jsonOf(response)).toEqual(DISPOSITION_TRANSPORT_ERRORS.requestInvalid);
  });
});

describe('successful reads', () => {
  it('serves a held disposition with its chain, disclosures and limitations', async () => {
    const response = await call('GET', `/api/investment/portfolio/${PORTFOLIO_ID}/holding/${SECURITY_ID}`);
    expect(response.status).toBe(200);
    const body = jsonOf(response);
    expect(body.status).toBe('OK');
    expect(body.reportType).toBe('investment.holding-disposition');
    const scope = body.scope as Record<string, unknown>;
    expect(scope.scopeToken).toBe(`hd:${PORTFOLIO_ID}/${SECURITY_ID}`);
    const disposition = body.disposition as Record<string, unknown>;
    expect((disposition.disposition as Record<string, unknown>).verb).toBe(heldPayload.disposition.verb);
    expect((disposition.interpretation as Record<string, unknown>).noExecutionPath).toBe(true);
    const disclosures = body.disclosures as Record<string, unknown>;
    expect(disclosures.noTradeExecution).toBe(true);
    expect(disclosures.notAnInstruction).toMatch(/not an order/i);
    expect(body.limitations).toContain('L-014');
    assertSanitized(response);
  });

  it('serves a candidate on its hc: chain', async () => {
    const response = await call('GET', `/api/investment/candidate/${SECURITY_ID}?portfolio=${PORTFOLIO_ID}`);
    expect(response.status).toBe(200);
    const body = jsonOf(response);
    expect((body.scope as Record<string, unknown>).scopeToken).toBe(`hc:${PORTFOLIO_ID}/${SECURITY_ID}`);
    const disposition = body.disposition as Record<string, unknown>;
    expect((disposition.subject as Record<string, unknown>).quantities).toBe('NOT_APPLICABLE');
  });

  it('lists the portfolio dispositions with their verbs', async () => {
    const response = await call('GET', `/api/investment/portfolio/${PORTFOLIO_ID}/dispositions`);
    expect(response.status).toBe(200);
    const body = jsonOf(response);
    expect(body.count).toBe(1);
    const entries = body.dispositions as Array<Record<string, unknown>>;
    expect(entries[0]!.scopeToken).toBe(`hd:${PORTFOLIO_ID}/${SECURITY_ID}`);
    expect(entries[0]!.verb).toBe(heldPayload.disposition.verb);
  });

  it('returns no body for HEAD but reports the version', async () => {
    const response = await call('HEAD', `/api/investment/portfolio/${PORTFOLIO_ID}/holding/${SECURITY_ID}`);
    expect(response.status).toBe(200);
    expect(response.body).toBe('');
    expect(response.headers['x-investment-artifact-version']).toBe('1');
  });
});

describe('fail-closed paths', () => {
  it('answers 404 for a chain that does not exist', async () => {
    const response = await call('GET', `/api/investment/portfolio/pf-with-nothing/holding/${SECURITY_ID}`);
    expect(response.status).toBe(404);
    expect(jsonOf(response)).toEqual(DISPOSITION_TRANSPORT_ERRORS.notFound);
    assertSanitized(response);
  });

  it('answers 503 when no owner context exists, without touching the store', async () => {
    const response = await call('GET', `/api/investment/portfolio/${PORTFOLIO_ID}/dispositions`, {
      resolveOwner: () => null,
    });
    expect(response.status).toBe(503);
    assertSanitized(response);
  });

  it('answers a static 503 when no persistence boundary is available', async () => {
    const response = await call('GET', `/api/investment/portfolio/${PORTFOLIO_ID}/dispositions`, {
      loadPort: async () => null,
    });
    expect(response.status).toBe(503);
    expect(jsonOf(response)).toEqual(DISPOSITION_TRANSPORT_ERRORS.persistenceUnavailable);
  });

  it('answers 400 for a malformed route', async () => {
    const response = await call('GET', '/api/investment/portfolio/pf/unknown-segment');
    expect(response.status).toBe(400);
    expect(jsonOf(response)).toEqual(DISPOSITION_TRANSPORT_ERRORS.requestInvalid);
  });
});
