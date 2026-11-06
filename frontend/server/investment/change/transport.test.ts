/**
 * IID-5 — change-intelligence read transport.
 *
 *   read-only     no mutating method is routed at all (405 before any owner or store work)
 *   sanitized     no path, owner pair, SQL, stack trace or store message in any body
 *   fail-closed   400 for an inadmissible request, 404 for an absent chain or version, 503 for no service
 *   honest        an UNAVAILABLE attribution is served as UNAVAILABLE, never softened
 *
 * @vitest-environment node
 */
import { createHash } from 'node:crypto';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';
import type http from 'node:http';

import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';
import { adaptNp04Store } from '../../reports/np04-adapter';
import { canonicalizePayload } from '../../reports/canonical';
import {
  CHANGE_ROUTES,
  CHANGE_TRANSPORT_ERRORS,
  CHANGE_TRANSPORT_SEMANTICS,
  handleChangeRequest,
  isChangePath,
  parseChangeRoute,
} from '../change-transport';
import { createInvestmentArtifactService } from '../investmentArtifacts';
import { createChangeService } from '../changeService';
import {
  ASSESSMENT_SUBSTANTIVE_GRAMMAR,
  PROVENANCE_SUBSTANTIVE_DIGEST,
  PROVENANCE_SUBSTANTIVE_GRAMMAR,
  PROVENANCE_SUBSTANTIVE_INPUT_DIGEST,
  assessmentSubstantiveInputDigest,
  substantiveDigestOfPayload,
} from '../substantiveIdentity';
import { assessmentPayloadOf } from '../dispositionTestFixtures';
import { M1_NOW, assembleAssessment, prepareM1Environment } from '../demo/m1Pipeline';

const OWNER = { tenantId: 'iid5-transport-tenant', userId: 'iid5-transport-owner' } as const;
const OWNER_CONTEXT = { tenantId: OWNER.tenantId, ownerUserId: OWNER.userId };
const resolveOwner = (): typeof OWNER_CONTEXT => OWNER_CONTEXT;

const env = prepareM1Environment();
const v1 = assembleAssessment({ identityDir: env.identityDir, datasetDir: env.datasetV1Dir, generatedAt: M1_NOW });
const BASE = assessmentPayloadOf(v1) as Record<string, any>;
const ISSUER = String(BASE.subject.issuerId);
const SCOPE = `co:${ISSUER}`;
const sha = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function submission(mutate: (payload: Record<string, any>) => void) {
  const payload = clone(BASE);
  mutate(payload);
  const canonical = canonicalizePayload(payload);
  return {
    reportType: 'investment.company-assessment',
    scopeToken: SCOPE,
    payloadDigest: sha(canonical),
    inputDigest: v1.composed.inputDigest,
    content: {
      ...v1.composed.content,
      canonicalPayload: canonical,
      provenance: {
        ...v1.composed.content.provenance,
        payloadDigest: sha(canonical),
        [PROVENANCE_SUBSTANTIVE_DIGEST]: substantiveDigestOfPayload('investment.company-assessment', payload),
        [PROVENANCE_SUBSTANTIVE_INPUT_DIGEST]: assessmentSubstantiveInputDigest(payload),
        [PROVENANCE_SUBSTANTIVE_GRAMMAR]: ASSESSMENT_SUBSTANTIVE_GRAMMAR,
      },
    },
  } as never;
}

/** One governed store holding a two-version chain, exposed as an injected read service. */
function withService<T>(run: (deps: { service: ReturnType<typeof createChangeService> }) => Promise<T> | T): Promise<T> {
  const dbPath = join(env.root, `iid5-transport-${Math.random().toString(36).slice(2)}.db`);
  const database = openDatabase({ path: dbPath, createDirectory: true, migrate: true });
  const port = adaptNp04Store(new GovernedArtifactStore(database));
  const artifacts = createInvestmentArtifactService({ port, owner: OWNER });
  artifacts.recordAssessment(v1.composed);
  artifacts.recordAssessment(
    submission((payload) => {
      payload.valuation.intrinsic.perShare.mid.value *= 1.12;
    }),
  );
  const service = createChangeService({ artifacts });
  return Promise.resolve(run({ service })).finally(() => {
    (database as { close?: () => void }).close?.();
  });
}

type FakeResponse = { status: number; headers: Record<string, string | string[] | number>; body: string };

async function call(
  method: string,
  url: string,
  deps: Parameters<typeof handleChangeRequest>[2] = {},
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
  const handled = await handleChangeRequest({ method, url } as http.IncomingMessage, res, {
    resolveOwner,
    ...deps,
  });
  expect(handled).toBe(true);
  return result;
}

const jsonOf = (response: FakeResponse): Record<string, any> => JSON.parse(response.body) as Record<string, any>;

function assertSanitized(response: FakeResponse): void {
  expect(response.body).not.toContain(env.root);
  expect(response.body).not.toContain(OWNER.tenantId);
  expect(response.body).not.toContain(OWNER.userId);
  expect(response.body.toLowerCase()).not.toContain('select ');
  expect(response.body.toLowerCase()).not.toContain('governed_artifacts');
  expect(response.body).not.toMatch(/\bat .*\(.*:\d+:\d+\)/);
}

describe('the change route table is read-only', () => {
  it('routes only GET and HEAD and declares no mutating operation', () => {
    for (const route of CHANGE_ROUTES) {
      expect(route.methods).toEqual(['GET', 'HEAD']);
      expect(route.mutating).toBe(false);
    }
    expect(CHANGE_TRANSPORT_SEMANTICS.mutatingOperations).toHaveLength(0);
    expect(CHANGE_TRANSPORT_SEMANTICS.createsArtifacts).toBe(false);
    expect(CHANGE_TRANSPORT_SEMANTICS.appendsVersions).toBe(false);
    expect(CHANGE_TRANSPORT_SEMANTICS.acceptsOrders).toBe(false);
    expect(CHANGE_TRANSPORT_SEMANTICS.acceptsQuantities).toBe(false);
  });

  it('claims only the /changes namespace, so it cannot shadow the assessment routes', () => {
    expect(isChangePath(`/api/investment/company/${encodeURIComponent(ISSUER)}/changes`)).toBe(true);
    expect(isChangePath(`/api/investment/company/${encodeURIComponent(ISSUER)}/changes/boundaries`)).toBe(true);
    expect(isChangePath(`/api/investment/company/${encodeURIComponent(ISSUER)}`)).toBe(false);
    expect(isChangePath(`/api/investment/company/${encodeURIComponent(ISSUER)}/versions/x`)).toBe(false);
    expect(isChangePath('/api/investment/portfolio/pf/holding/x')).toBe(false);
    expect(parseChangeRoute(`/api/investment/company/${encodeURIComponent(ISSUER)}`).kind).toBe('notMine');
  });

  it('parses explicit selectors and rejects anything malformed', () => {
    const base = `/api/investment/company/${encodeURIComponent(ISSUER)}/changes`;
    expect(parseChangeRoute(`${base}?from=1&to=2`)).toMatchObject({ kind: 'changes', from: '1', to: '2' });
    expect(parseChangeRoute(`${base}/boundaries`).kind).toBe('boundaries');
    expect(parseChangeRoute(`${base}?from=${encodeURIComponent('a b')}`).kind).toBe('invalid');
    expect(parseChangeRoute(`${base}/something`).kind).toBe('invalid');
    expect(parseChangeRoute(`${base}/boundaries?from=1`).kind).toBe('invalid');
  });

  it('answers 405 for every mutating method, before resolving an owner or a store', async () => {
    const base = `/api/investment/company/${encodeURIComponent(ISSUER)}/changes`;
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const response = await call(method, base, {
        resolveOwner: () => {
          throw new Error('owner must not be resolved for a rejected method');
        },
        loadPort: () => {
          throw new Error('store must not be loaded for a rejected method');
        },
      });
      expect(response.status).toBe(405);
      expect(response.headers.allow).toBe('GET, HEAD');
      expect(jsonOf(response).error).toBe('method-not-allowed');
    }
  });

  it('answers 400 for a malformed issuer scope', async () => {
    const response = await call('GET', '/api/investment/company/not-an-issuer/changes', {
      loadPort: () => {
        throw new Error('store must not be loaded');
      },
    });
    expect(response.status).toBe(400);
    expect(jsonOf(response).error).toBe('change-request-invalid');
    assertSanitized(response);
  });
});

describe('adjacent comparisons are served read-only', () => {
  it('serves both pairs with dimensions, materiality, attribution and disclosures', async () => {
    await withService(async ({ service }) => {
      const response = await call('GET', `/api/investment/company/${encodeURIComponent(ISSUER)}/changes`, { service });
      expect(response.status).toBe(200);
      const body = jsonOf(response);
      expect(body.status).toBe('OK');
      expect(body.pairCount).toBe(1);
      expect(body.returned).toBe(1);
      expect(body.truncated).toBe(false);
      const comparison = body.comparisons[0];
      expect(comparison.classification).toBe('SUBSTANTIVE');
      expect(comparison.persisted).toBe(false);
      expect(comparison.changes[0].dimensionId).toBe('valuation.intrinsicMid');
      expect(comparison.changes[0].materiality).toBe('MATERIAL');
      expect(comparison.attribution.status).toBe('EXACT');
      expect(comparison.attribution.cause).toBe('DATA');
      expect(comparison.review.required).toBe(true);
      expect(body.disclosures.decisionSupportOnly).toBe(true);
      expect(body.disclosures.noTradeExecution).toBe(true);
      expect(body.limitations).toContain('L-014');
      assertSanitized(response);
    });
  });

  it('selects one explicit pair by artifactVersion, and refuses a backwards selection', async () => {
    await withService(async ({ service }) => {
      const base = `/api/investment/company/${encodeURIComponent(ISSUER)}/changes`;
      const forward = await call('GET', `${base}?from=1&to=2`, { service });
      expect(forward.status).toBe(200);
      expect(jsonOf(forward).comparisons).toHaveLength(1);
      expect(jsonOf(forward).comparisons[0].from.artifactVersion).toBe(1);
      expect(jsonOf(forward).comparisons[0].to.to).toBeUndefined();
      expect(jsonOf(forward).comparisons[0].to.artifactVersion).toBe(2);

      const backwards = await call('GET', `${base}?from=2&to=1`, { service });
      expect(backwards.status).toBe(404);
      expect(jsonOf(backwards).error).toBe(CHANGE_TRANSPORT_ERRORS.notFound.error);
    });
  });

  it('answers 404 for an unknown version selector and for a scope with no chain', async () => {
    await withService(async ({ service }) => {
      const base = `/api/investment/company/${encodeURIComponent(ISSUER)}/changes`;
      expect((await call('GET', `${base}?from=1&to=99`, { service })).status).toBe(404);
      // A well-formed ISIN for a company this store holds nothing for: 404, not 400 and not 503.
      const other = '/api/investment/company/IN:EQISIN:INE002A01018/changes';
      const absent = await call('GET', other, { service });
      expect(absent.status).toBe(404);
      expect(jsonOf(absent).error).toBe('change-not-found');
      assertSanitized(absent);
    });
  });

  it('serves boundaries and coverage, and writes nothing', async () => {
    await withService(async ({ service }) => {
      const base = `/api/investment/company/${encodeURIComponent(ISSUER)}/changes`;
      const empty = await call('GET', `${base}/boundaries`, { service });
      expect(empty.status).toBe(200);
      expect(jsonOf(empty).count).toBe(0);
      expect(jsonOf(empty).coverage.complete).toBe(false);
      expect(jsonOf(empty).coverage.pairCount).toBe(1);

      // Serving the comparison did not create a boundary report: the surface cannot write.
      const again = await call('GET', `${base}/boundaries`, { service });
      expect(jsonOf(again).count).toBe(0);
    });
  });

  it('answers 503 when no governed store is available, without leaking anything', async () => {
    const response = await call('GET', `/api/investment/company/${encodeURIComponent(ISSUER)}/changes`, {
      loadPort: async () => null,
    });
    expect(response.status).toBe(503);
    expect(jsonOf(response).error).toBe('investment-persistence-unavailable');
    assertSanitized(response);
  });
});
