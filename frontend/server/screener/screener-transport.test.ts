/** Offline, deterministic tests for credential-free N4 Screener transport composition. */
import { describe, it, expect } from 'vitest';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { AddressInfo } from 'node:net';
import { handleScreenerRequest, buildGovernedProducerRequests } from './screener-transport';

async function request(
  body: unknown,
  method = 'POST',
  authorization?: string,
): Promise<{ status: number; text: string; body: unknown }> {
  const server = http.createServer((req, res) => { void handleScreenerRequest(req, res); });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authorization !== undefined) headers.Authorization = authorization;
    const res = await fetch(`http://127.0.0.1:${port}/api/screener`, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let parsed: unknown = {};
    try { parsed = JSON.parse(text) as unknown; } catch { /* non-JSON */ }
    return { status: res.status, text, body: parsed };
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
}

const MATCH_ALL = {
  definitionId: 'TEST-MATCH-ALL', version: '1',
  predicates: [{ field: 'conviction', operator: 'gte', operand: '0' }],
};
const MATCH_NONE = {
  definitionId: 'TEST-MATCH-NONE', version: '1',
  predicates: [{ field: 'quality', operator: 'gt', operand: '100' }],
};

interface ScreenBody {
  execution: { executionId: string; definitionId: string; memberCount: number; members: unknown[]; populationIdentity: string };
  result: {
    resultId: string; executionId: string; executionStatus: string; totalPopulationCount: number;
    matchedCount: number; memberResultCount: number;
    members: Array<{ sector: string; referenceId: string; memberResultStatus: string; memberErrorCode: string }>;
  };
  vintage: { asOf: string; dataVersion: string; mode: string; dataSource: string; memberCount: number };
}

describe('Screener transport (governed composition)', () => {
  it('builds the 13 governed producer requests over canonical sectors (no client membership)', () => {
    const requests = buildGovernedProducerRequests();
    expect(requests).toHaveLength(13);
    expect(new Set(requests.map(row => row.sector)).size).toBe(13);
    for (const row of requests) {
      expect(row.engineId).toBeTruthy();
      expect(row.companyId).toBeTruthy();
      expect(row.referenceId).toBe(row.companyId);
      expect(row.inputs).toBeTruthy();
    }
  });

  it('serves an anonymous request with the complete governed envelope', async () => {
    const { status, body } = await request({ definition: MATCH_ALL });
    expect(status).toBe(200);
    const result = body as ScreenBody;
    expect(result.result.executionStatus).toBe('COMPLETED');
    expect(result.result.totalPopulationCount).toBe(13);
    expect(result.result.memberResultCount).toBe(13);
    expect(result.result.members).toHaveLength(13);
    expect(result.execution.memberCount).toBe(13);
    expect(result.execution.members).toHaveLength(13);
    expect(result.vintage.mode).toBe('SNAPSHOT');
    expect(result.vintage.memberCount).toBe(13);
    expect(result.vintage.dataSource).toContain('governed:');
    expect(result.result.executionId).toBe(result.execution.executionId);
    const matched = result.result.members.filter(member => member.memberResultStatus === 'MATCH').length;
    const nonMatch = result.result.members.filter(member => member.memberResultStatus === 'NO_MATCH').length;
    const invalid = result.result.members.filter(member => member.memberResultStatus === 'INVALID_MEMBER').length;
    expect(matched).toBe(result.result.matchedCount);
    expect(matched + nonMatch + invalid).toBe(13);
    for (const member of result.execution.members as Array<Record<string, unknown>>) {
      expect(typeof member.engineId).toBe('string');
      expect(typeof member.snapshotId).toBe('string');
      expect(typeof member.evidenceId).toBe('string');
    }
  });

  it('does not require or inspect an Authorization header', async () => {
    const anonymous = await request({ definition: MATCH_ALL });
    const supplied = await request({ definition: MATCH_ALL }, 'POST', 'Bearer invalid');
    expect(anonymous.status).toBe(200);
    expect(supplied.status).toBe(200);
    expect(supplied.text).toBe(anonymous.text);
  });

  it('is byte-stable deterministic for identical definitions', async () => {
    const first = await request({ definition: MATCH_ALL });
    const second = await request({ definition: MATCH_ALL });
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.text).toBe(first.text);
    expect((second.body as ScreenBody).result.resultId).toBe((first.body as ScreenBody).result.resultId);
  });

  it('accepts only the verified population identity and rejects client-supplied members', async () => {
    const first = await request({ definition: MATCH_ALL });
    const identity = (first.body as ScreenBody).execution.populationIdentity;
    expect(identity).toMatch(/^[0-9a-fA-F]{64}$/);
    const echo = await request({ definition: { ...MATCH_ALL, populationIdentity: identity } });
    expect(echo.status).toBe(200);
    expect(echo.text).toBe(first.text);
    const changedFirst = identity[0] === 'f' ? 'e' : 'f';
    const mismatch = await request({ definition: { ...MATCH_ALL, populationIdentity: `${changedFirst}${identity.slice(1)}` } });
    expect(mismatch.status).toBe(422);
    const suppliedMembers = await request({ definition: MATCH_ALL, members: [] });
    expect(suppliedMembers.status).toBe(422);
  });

  it('preserves definition validation and zero-match semantics', async () => {
    const empty = await request({ definition: { definitionId: 'TEST-EMPTY', version: '1', predicates: [] } });
    expect(empty.status).toBe(200);
    const none = await request({ definition: MATCH_NONE });
    expect(none.status).toBe(200);
    expect((none.body as ScreenBody).result.matchedCount).toBe(0);
    const badOperand = await request({ definition: { definitionId: 'X', version: '1', predicates: [{ field: 'conviction', operator: 'gte', operand: 'not-a-number' }] } });
    expect(badOperand.status).toBe(422);
    expect((badOperand.body as { code?: string }).code).toBe('INVALID_OPERAND');
    const badField = await request({ definition: { definitionId: 'X', version: '1', predicates: [{ field: 'verdict', operator: 'gte', operand: '50' }] } });
    expect(badField.status).toBe(422);
    expect((await request({})).status).toBe(400);
  });

  it('rejects non-POST methods (405)', async () => {
    expect((await request({}, 'GET')).status).toBe(405);
  });
});

// Old handler loaded from the unmodified 37e82b7 Git blob and executed in memory against
// the same frozen native inputs; each body also matched the new handler byte-for-byte.
describe('ordinary Screener exact starting-baseline HTTP response bytes', () => {
  it.each([
    [{ definitionId: 'TEST-MATCH-ALL', version: '1', predicates: [{ field: 'conviction', operator: 'gte', operand: '0' }] }, '5cc48af758aca2f1072c8c00c00bf7ff3cabc77fdd7f74ec974c7653843b8084'],
    [{ definitionId: 'TEST-MATCH-NONE', version: '1', predicates: [{ field: 'quality', operator: 'gt', operand: '100' }] }, '75c735611891f2c1a1c9d4e4f7c57355d2245cf5ecf5c52682915a41f4140dac'],
    [{ definitionId: 'NP12-CERT-BASELINE-ALL', version: '01', predicates: [] }, '51463f0bdf5cde473ff35da66d9382e9f42d74cf5107027ee4563c4e90362763'],
  ] as const)('preserves original compact body for $definitionId', async (definition, expected) => {
    const response = await request({ definition });
    expect(response.status).toBe(200); expect(createHash('sha256').update(response.text).digest('hex')).toBe(expected);
    expect(response.body).not.toHaveProperty('snapshotId'); expect(response.body).not.toHaveProperty('captureState');
  });
});
