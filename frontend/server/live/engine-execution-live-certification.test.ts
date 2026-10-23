/**
 * Engine execution certification: exercise the composed executive transport over real HTTP.
 *
 * This deliberately imports the production route table rather than constructing a test server
 * around EngineApiAdapter. It is local/non-production evidence only; it performs no external
 * provider calls and makes no durable portfolio or journal writes.
 *
 * @vitest-environment node
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import { server } from '../executive-transport.js';

let baseUrl = '';

beforeAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve();
    });
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (server.listening) {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

async function call(method: string, path: string, body?: unknown) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return {
    status: response.status,
    body: await response.json().catch(() => ({})) as Record<string, unknown>,
  };
}

const technologyInput: Record<string, unknown> = {
  subsegment: 'software-saas',
  archetype: 'subscription',
  revenueGrowth: 22,
  grossMargin: 75,
  ruleOf40: 35,
  netRetention: 120,
  salesEfficiency: 1.2,
  rndIntensity: 18,
  sbcAdjMargin: 25,
  fcfMargin: 30,
  debtEbitda: 1.5,
  governance: 'clean',
};

const validRequest = {
  apiVersion: '1.0',
  engineId: 'sector.technology',
  requestId: 'composed-http-technology-001',
  inputs: technologyInput,
};

describe('Engine execution certification — composed executive transport', () => {
  it('serves the certified 13-engine registry through the composed route', async () => {
    const { status, body } = await call('GET', '/api/engines');
    const registry = body as {
      engines: Array<{ engineId: string; ies: string }>;
      provenance: { certifiedCount: number; freshness: string };
    };
    expect(status).toBe(200);
    expect(registry.engines).toHaveLength(13);
    expect(registry.provenance).toMatchObject({ certifiedCount: 13, freshness: 'FROZEN' });
    expect(registry.engines.every(engine => engine.engineId && engine.ies)).toBe(true);
  });

  it('executes a certified engine through the composed POST route with governed provenance', async () => {
    const { status, body } = await call('POST', '/api/engines/sector.technology/execute', validRequest);
    expect(status).toBe(200);
    expect(body).toMatchObject({
      state: 'COMPLETED',
      ies: 'IES-015',
      provenance: { ies: 'IES-015', deterministic: true },
    });
    expect(typeof body.composite).toBe('number');
    expect(typeof body.verdict).toBe('string');
    expect(body.snapshotRef).toMatch(/^SNAP_/);
    expect(body.evidenceRef).toMatch(/^ev_/);
  });

  it('preserves deterministic output for an identical request through the composed route', async () => {
    const first = await call('POST', '/api/engines/sector.technology/execute', validRequest);
    const second = await call('POST', '/api/engines/sector.technology/execute', validRequest);
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
  });

  it('rejects a path/body engine mismatch at the composed boundary', async () => {
    const { status, body } = await call('POST', '/api/engines/sector.banking/execute', {
      ...validRequest,
      engineId: 'sector.technology',
    });
    expect(status).toBe(400);
    expect(String(body.error)).toMatch(/engineId mismatch/i);
  });

  it('keeps an uncertified engine denied at the composed boundary', async () => {
    const { status, body } = await call('POST', '/api/engines/sector.not-certified/execute', {
      apiVersion: '1.0',
      engineId: 'sector.not-certified',
      requestId: 'composed-http-denied-001',
      inputs: {},
    });
    expect(status).toBe(404);
    expect(String(body.reason ?? body.error)).toMatch(/uncertified/i);
  });

  it('rejects an unsupported API version at the composed boundary', async () => {
    const { status, body } = await call('POST', '/api/engines/sector.technology/execute', {
      ...validRequest,
      apiVersion: '2.0',
    });
    expect(status).toBe(422);
    expect(String(body.error)).toMatch(/unsupported-api-version/i);
  });
});
