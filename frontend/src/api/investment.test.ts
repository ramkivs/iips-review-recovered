/**
 * IID-3 — client tests.
 *
 * The client is the boundary between a sanitized server body and the DOM. These tests pin down that boundary:
 * every documented failure becomes a closed local reason with fixed copy (no server prose reaches the view),
 * an envelope missing a section is an error rather than a partially-rendered page, and the route helpers are
 * GET-shaped and encode the identifiers they carry.
 */
import { describe, expect, it, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  ASSESSMENT_UNAVAILABLE_COPY,
  AssessmentUnavailableError,
  INVESTMENT_ASSESSMENT_ROUTES,
  LIMITATION_DISCLOSURES,
  fetchCompanyAssessment,
} from './investment';

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(status: number, body: unknown): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn(async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const MINIMAL_ENVELOPE = {
  status: 'OK',
  reportType: 'investment.company-assessment',
  scope: { scopeToken: 'co:IN:EQISIN:IN0000000201', reportKey: 'a'.repeat(64), chainRootReportId: 'r-1', versionCount: 1 },
  version: { reportId: 'r-1', artifactVersion: 1 },
  versions: [{ reportId: 'r-1', artifactVersion: 1 }],
  assessment: {
    subject: { issuerId: 'IN:EQISIN:IN0000000201' },
    completeness: {},
    quality: {},
    valuation: {},
    risk: {},
    dividends: {},
    moat: {},
    evidence: [],
    disclosure: {},
  },
  disclosures: { decisionSupportOnly: true, noTradeExecution: true, nonProduction: true, datasetNotice: 'x' },
  limitations: ['L-009'],
};

describe('failure vocabulary is closed and sanitized', () => {
  it.each([
    [503, { error: 'investment-persistence-unavailable' }, 'persistence-unavailable'],
    [503, { error: 'investment-artifact-integrity-failure' }, 'integrity-failure'],
    [503, { error: 'owner-context-unavailable' }, 'owner-context-unavailable'],
    [400, { error: 'investment-scope-invalid' }, 'scope-invalid'],
    [404, { error: 'investment-artifact-not-found' }, 'not-found'],
    [500, { error: 'something-else', detail: '/srv/app/db.sqlite' }, 'unrecognised'],
  ])('maps %s %o onto a local reason', async (status, body, expected) => {
    stubFetch(status as number, body);
    await expect(fetchCompanyAssessment('IN:EQISIN:IN0000000201')).rejects.toMatchObject({ reason: expected });
  });

  it('never surfaces server prose, even when the server sends a path or a stack', async () => {
    stubFetch(503, { error: 'investment-persistence-unavailable', detail: '/srv/data/investment.db SELECT * FROM governed_artifacts' });
    const error = await fetchCompanyAssessment('IN:EQISIN:IN0000000201').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(AssessmentUnavailableError);
    expect((error as Error).message).toBe(ASSESSMENT_UNAVAILABLE_COPY['persistence-unavailable']);
    expect((error as Error).message).not.toContain('/srv');
    expect((error as Error).message).not.toContain('SELECT');
  });

  it('rejects an envelope that is missing a section instead of rendering a hole', async () => {
    const incomplete = { ...MINIMAL_ENVELOPE, assessment: { subject: {} } };
    stubFetch(200, incomplete);
    await expect(fetchCompanyAssessment('IN:EQISIN:IN0000000201')).rejects.toMatchObject({ reason: 'unrecognised' });
  });

  it('accepts a complete envelope', async () => {
    stubFetch(200, MINIMAL_ENVELOPE);
    const envelope = await fetchCompanyAssessment('IN:EQISIN:IN0000000201');
    expect(envelope.scope.versionCount).toBe(1);
  });
});

describe('routes are GET-shaped', () => {
  it('encodes the issuer id, which contains colons', () => {
    expect(INVESTMENT_ASSESSMENT_ROUTES.company('IN:CIN:L72200KA1981PLC013115')).toBe(
      '/api/investment/company/IN%3ACIN%3AL72200KA1981PLC013115',
    );
    expect(INVESTMENT_ASSESSMENT_ROUTES.version('IN:EQISIN:IN0000000201', 'r-1')).toBe(
      '/api/investment/company/IN%3AEQISIN%3AIN0000000201/versions/r-1',
    );
  });

  it('issues GET only, with same-origin credentials', async () => {
    const fetchMock = stubFetch(200, MINIMAL_ENVELOPE);
    await fetchCompanyAssessment('IN:EQISIN:IN0000000201');
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('GET');
    expect(init.credentials).toBe('same-origin');
  });
});

describe('limitation disclosures mirror the server list', () => {
  it('carries exactly the identifiers the transport sends', () => {
    const source = readFileSync(join(process.cwd(), 'server', 'investment', 'investment-transport.ts'), 'utf8');
    const block = source.slice(
      source.indexOf('INVESTMENT_RESPONSE_LIMITATIONS = Object.freeze(['),
      source.indexOf(']);', source.indexOf('INVESTMENT_RESPONSE_LIMITATIONS = Object.freeze([')),
    );
    const ids = [...block.matchAll(/'(L-\d{3})'/g)].map((match) => match[1]!);
    expect(ids.length).toBeGreaterThanOrEqual(9);
    expect(LIMITATION_DISCLOSURES.map((entry) => entry.id)).toEqual(ids);
  });

  it('keeps the L-001…L-009 statements faithful', () => {
    const byId = new Map(LIMITATION_DISCLOSURES.map((entry) => [entry.id, entry.text]));
    expect(byId.get('L-001')).toContain('3 of 13');
    expect(byId.get('L-003')).toContain('8');
    expect(byId.get('L-005')).toContain('NET_DEBT_TO_EBITDA_UNAVAILABLE');
    expect(byId.get('L-008')).toContain('SOTP');
    expect(byId.get('L-009')).toContain('No real issuer');
  });
});
