/**
 * IIPS v3.0 — Product E2E — HTTP transport tests for Product APIs
 *
 * Verifies CSIP→Product data flow for the authorized 13-engine product baseline:
 *   GET /api/executive, /api/portfolio, /api/cross-sector,
 *   GET /api/company/:id, /api/evidence/:id, /api/replay/:id,
 *   provenance (SNAPSHOT, calibratedAt 2026-08-09, dataSource certified),
 *   determinism (rerun identical), honest reference replay availability,
 *   negative/boundary (404 for taxonomy-resolved + unknown sectors).
 *
 * Uses the real executive-transport handlers via HTTP (offline-safe, no mock of business logic).
 * The executive transport's computeCertified* functions are pure and deterministic (fixed clock + deterministic IdProvider);
 * we test via HTTP like engine-transport.test.ts does.
 */

import { describe, it, expect } from 'vitest';
import http from 'node:http';
import { createHash } from 'node:crypto';
import { AddressInfo } from 'node:net';

// Import the certified product handlers directly (semantically inert, 1:1 DTO mapping).
import {
  computeCertifiedExecutive,
  computeCertifiedPortfolio,
  computeCertifiedCrossSector,
  computeCertifiedCompany,
  computeCertifiedEvidence,
  computeCertifiedReplay,
  computeCertifiedDecisionMatrix,
  computeCertifiedPlatform,
} from './executive-transport';

function startProductTestServer(): http.Server {
  return http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      if (req.url === '/api/executive' && req.method === 'GET') {
        const data = computeCertifiedExecutive() as Record<string, unknown>;
        res.writeHead(200);
        res.end(JSON.stringify(data));
        return;
      }
      if (req.url === '/api/portfolio' && req.method === 'GET') {
        const data = computeCertifiedPortfolio() as Record<string, unknown>;
        res.writeHead(200);
        res.end(JSON.stringify(data));
        return;
      }
      if (req.url === '/api/cross-sector' && req.method === 'GET') {
        const data = computeCertifiedCrossSector() as Record<string, unknown>;
        res.writeHead(200);
        res.end(JSON.stringify(data));
        return;
      }
      if (req.url?.startsWith('/api/company/') && req.method === 'GET') {
        const id = decodeURIComponent(req.url.slice('/api/company/'.length));
        try {
          const data = computeCertifiedCompany(id) as Record<string, unknown>;
          res.writeHead(200);
          res.end(JSON.stringify(data));
          return;
        } catch (e) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: String(e) }));
          return;
        }
      }
      if (req.url?.startsWith('/api/evidence/') && req.method === 'GET') {
        const id = decodeURIComponent(req.url.slice('/api/evidence/'.length));
        try {
          const data = computeCertifiedEvidence(id) as Record<string, unknown>;
          res.writeHead(200);
          res.end(JSON.stringify(data));
          return;
        } catch (e) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: String(e) }));
          return;
        }
      }
      if (req.url?.startsWith('/api/replay/') && req.method === 'GET') {
        const id = decodeURIComponent(req.url.slice('/api/replay/'.length));
        try {
          const data = computeCertifiedReplay(id) as Record<string, unknown>;
          res.writeHead(200);
          res.end(JSON.stringify(data));
          return;
        } catch (e) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: String(e) }));
          return;
        }
      }
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'not found' }));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'product transport error', detail: String(e) }));
    }
  });
}

async function request(path: string): Promise<{ status: number; json: unknown }> {
  const server = startProductTestServer();
  await new Promise<void>((r) => server.listen(0, r));
  const port = (server.address() as AddressInfo).port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`);
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
  }
}

const CERTIFIED_SECTORS = [
  'Banking',
  'Insurance',
  'Capital Markets',
  'Healthcare',
  'Hospitality',
  'Energy',
  'Utilities',
  'Consumer',
  'Industrials',
  'Technology',
  'Telecommunications',
  'Automobile',
  'Materials & Metals',
];

describe('Product transport (E2E Product HTTP)', () => {
  it('GET /api/executive returns 13 holdings with SNAPSHOT provenance (no fabrication)', async () => {
    const { status, json } = await request('/api/executive');
    expect(status).toBe(200);
    const body = json as {
      portfolio: { holdings: number; avgConviction: number };
      ranking: Array<{ sector: string; conviction: number }>;
      opportunity: Array<{ sector: string }>;
      correlation: { flags: string[] };
      decisions: Array<{ sector: string; verdict: string; composite: number }>;
      provenance: { dataSource: string; freshness: string; calibratedAt: string; transportSemantics: string };
    };
    expect(body.portfolio.holdings).toBe(13);
    expect(typeof body.portfolio.avgConviction).toBe('number');
    expect(body.ranking.length).toBe(13);
    expect(body.decisions.length).toBe(13);
    expect(body.provenance.freshness).toBe('SNAPSHOT');
    expect(body.provenance.calibratedAt).toBe('2026-08-09T00:00:00.000Z');
    expect(body.provenance.dataSource).toMatch(/certified v2\.0 platform/);
    expect(body.provenance.transportSemantics).toMatch(/1:1 mapping/);
    const sectors = body.decisions.map((d) => d.sector);
    // All 13 certified sectors present
    for (const s of CERTIFIED_SECTORS) expect(sectors).toContain(s);
  });

  it('GET /api/portfolio returns 13 holdings with allocation and SNAPSHOT provenance', async () => {
    const { status, json } = await request('/api/portfolio');
    expect(status).toBe(200);
    const body = json as {
      portfolio: { holdings: number };
      holdings: Array<{ sector: string; decision: string; composite: number; weight: number }>;
      allocation: { strategy: string; recommendation: string };
      evidenceRefs: Array<{ evidenceId: string; engineId: string }>;
      provenance: { freshness: string; calibratedAt: string };
    };
    expect(body.portfolio.holdings).toBe(13);
    expect(body.holdings.length).toBe(13);
    expect(body.evidenceRefs.length).toBe(13);
    expect(body.allocation.strategy).toBe('Balanced');
    expect(typeof body.allocation.recommendation).toBe('string');
    expect(body.provenance.freshness).toBe('SNAPSHOT');
    expect(body.provenance.calibratedAt).toBe('2026-08-09T00:00:00.000Z');
    const sectors = body.holdings.map((h) => h.sector);
    for (const s of CERTIFIED_SECTORS) expect(sectors).toContain(s);
  });

  it('GET /api/cross-sector returns 13 ranking with SNAPSHOT provenance', async () => {
    const { status, json } = await request('/api/cross-sector');
    expect(status).toBe(200);
    const body = json as {
      portfolio: { holdings: number };
      ranking: Array<{ sector: string; conviction: number }>;
      decisions: Array<{ sector: string }>;
      provenance: { freshness: string };
    };
    expect(body.portfolio.holdings).toBe(13);
    expect(body.ranking.length).toBe(13);
    expect(body.decisions.length).toBe(13);
    expect(body.provenance.freshness).toBe('SNAPSHOT');
    const sectors = body.ranking.map((r) => r.sector);
    for (const s of CERTIFIED_SECTORS) expect(sectors).toContain(s);
  });

  it('GET /api/company/:id returns certified company for all 13 certified sectors', async () => {
    for (const sector of CERTIFIED_SECTORS) {
      const { status, json } = await request(`/api/company/${encodeURIComponent(sector)}`);
      expect(status).toBe(200);
      const body = json as { sector: string; decision: { verdict: string; composite: number } };
      expect(body.sector).toBe(sector);
      expect(typeof body.decision.verdict).toBe('string');
      expect(typeof body.decision.composite).toBe('number');
    }
  });

  it('GET /api/company/:id returns 404 for taxonomy-resolved categories and unknown sectors', async () => {
    for (const bad of ['IT', 'Chemicals', 'Realty', 'UnknownSector', 'sector.unknown']) {
      const { status } = await request(`/api/company/${encodeURIComponent(bad)}`);
      expect(status).toBe(404);
    }
  });

  it('GET /api/evidence/:id and /api/replay/:id return reference metadata and truthful replay availability for all 13', async () => {
    for (const sector of CERTIFIED_SECTORS) {
      const ev = await request(`/api/evidence/${encodeURIComponent(sector)}`);
      expect(ev.status).toBe(200);
      const evb = ev.json as { referenceOnly: boolean; evidence: { evidenceId: string; replayReference: string | null }; provenance: { freshness: string } };
      expect(evb.evidence.evidenceId).toBe(`ev_${sector}`);
      expect(evb.evidence.replayReference).toBeNull();
      expect(evb.referenceOnly).toBe(true);
      expect(evb.provenance.freshness).toBe('SNAPSHOT');

      const rep = await request(`/api/replay/${encodeURIComponent(sector)}`);
      expect(rep.status).toBe(200);
      const repb = rep.json as { original: null; replay: { state: string }; evidenceRefs: string[]; differenceAvailable: boolean };
      expect(repb.original).toBeNull();
      expect(repb.replay.state).toBe('NOT_PERFORMED');
      expect(repb.replay).not.toHaveProperty('reproduced');
      expect(repb.replay).not.toHaveProperty('byteIdentical');
      expect(repb.evidenceRefs).toEqual([]);
      expect(repb.differenceAvailable).toBe(false);
    }
  });

  it('GET /api/evidence/:id and /api/replay/:id return 404 for taxonomy-resolved and unknown sectors', async () => {
    for (const bad of ['IT', 'Chemicals', 'Realty', 'UnknownSector', 'sector.unknown']) {
      const { status: es } = await request(`/api/evidence/${encodeURIComponent(bad)}`);
      expect(es).toBe(404);
      const { status: rs } = await request(`/api/replay/${encodeURIComponent(bad)}`);
      expect(rs).toBe(404);
    }
  });

  it('Product determinism — rerun identical holdings/ranking/provenance via HTTP', async () => {
    const a = await request('/api/executive');
    const b = await request('/api/executive');
    const ja = a.json as { portfolio: { holdings: number; avgConviction: number }; ranking: Array<{ sector: string; conviction: number }>; provenance: { freshness: string; calibratedAt: string } };
    const jb = b.json as typeof ja;
    expect(ja.portfolio.holdings).toBe(jb.portfolio.holdings);
    expect(ja.portfolio.avgConviction).toBe(jb.portfolio.avgConviction);
    expect(ja.ranking).toEqual(jb.ranking);
    expect(ja.provenance).toEqual(jb.provenance);

    const pa = await request('/api/portfolio');
    const pb = await request('/api/portfolio');
    const pja = pa.json as { holdings: Array<unknown>; allocation: unknown; provenance: unknown };
    const pjb = pb.json as typeof pja;
    expect(pja.holdings).toEqual(pjb.holdings);
    expect(pja.allocation).toEqual(pjb.allocation);
    expect(pja.provenance).toEqual(pjb.provenance);

    const ca = await request('/api/cross-sector');
    const cb = await request('/api/cross-sector');
    expect((ca.json as { ranking: unknown }).ranking).toEqual((cb.json as { ranking: unknown }).ranking);
  });

  it('Product responses reject taxonomy-resolved categories while permitting all certified engines', async () => {
    const ex = await request('/api/executive');
    const body = ex.json as { decisions: Array<{ sector: string }>; ranking: Array<{ sector: string }>; opportunity: Array<{ sector: string }> };
    const allSectors = [...body.decisions.map((d) => d.sector), ...body.ranking.map((r) => r.sector), ...body.opportunity.map((o) => o.sector)];
    for (const forbidden of ['IT', 'Chemicals', 'Realty']) {
      expect(allSectors).not.toContain(forbidden);
    }
    const pf = await request('/api/portfolio');
    const pfb = pf.json as { evidenceRefs: Array<{ engineId: string }> };
    const engineIds = pfb.evidenceRefs.map((ref) => ref.engineId);
    for (const forbidden of ['sector.it', 'sector.chemicals', 'sector.realty']) {
      expect(engineIds).not.toContain(forbidden);
    }
    for (const certified of ['sector.telecom', 'sector.auto', 'sector.materials', 'sector.capital-markets']) {
      expect(engineIds).toContain(certified);
    }
    // Regression protection (main-health remediation): engine IDs are the governed
    // taxonomy (D42/baseline), never display-sector interpolations.
    for (const fabricated of ['sector.telecommunications', 'sector.automobile', 'sector.materials & metals', 'sector.capital markets']) {
      expect(engineIds).not.toContain(fabricated);
    }
  });

  it('Product CSIP→DTO preserves certified 13-engine baseline — holdings/ranking traceable', async () => {
    // Holdings weight comes from CSIP sectorExposure which sums from 13 engine outputs; ranking is CSIP ranking.
    const ex = await request('/api/executive');
    const pf = await request('/api/portfolio');
    const cs = await request('/api/cross-sector');
    const exb = ex.json as { portfolio: { holdings: number }; ranking: Array<{ sector: string }> };
    const pfb = pf.json as { portfolio: { holdings: number }; holdings: Array<{ sector: string }> };
    const csb = cs.json as { portfolio: { holdings: number }; ranking: Array<{ sector: string }> };
    // All three surfaces agree: 13 holdings
    expect(exb.portfolio.holdings).toBe(13);
    expect(pfb.portfolio.holdings).toBe(13);
    expect(csb.portfolio.holdings).toBe(13);
    // Holdings sectors equal ranking sectors (same CSIP source)
    expect(new Set(pfb.holdings.map((h) => h.sector))).toEqual(new Set(exb.ranking.map((r) => r.sector)));
    expect(new Set(csb.ranking.map((r) => r.sector))).toEqual(new Set(exb.ranking.map((r) => r.sector)));
  });
});

// Captured from unmodified 37e82b7 before the strict transport-only CSIP projection change.
// Protects every unrelated response and the raw nullable reference projection, not just scores.
describe('Stage A strict import closure — unchanged certified reference values', () => {
  const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  it('preserves complete reference and CSIP bytes against the starting baseline', () => {
    expect(hash(computeCertifiedExecutive())).toBe('4823dd63fe58db10045387b5c69d55bdd67c28fb63139d756cbb797f77a3eb21');
    expect(hash(computeCertifiedPortfolio())).toBe('e06d6d84d02ce5ff928fb037acc32bcfc4453222dff1395a2de3c5cbf93edcd6');
    expect(hash(computeCertifiedCrossSector())).toBe('ede27a1d594ade216bd90cb10b64f7ba72619a7d6a110ac20068f898dae27c98');
    expect(hash(computeCertifiedDecisionMatrix())).toBe('8ed24d7c3220c6459bfce04e6fc79e176f73ec774d173333d8eecb7f3a145dc0');
    expect(hash(computeCertifiedCompany('Banking'))).toBe('f58fc01d8123c65488ee44ed0e7b95843c266faff1aab06b143e544046dec02e');
    const platform = computeCertifiedPlatform();
    expect(hash(platform.engineOutputs)).toBe('c95ba5f4c4416d17a99e6b7d4e3bf299aaaad111abbec1bddf1b00e958d5d2b8');
    expect(hash(platform.csip)).toBe('3f4b7b848f2f0b52f63a1e7d2834885104bffc8774e3dcc40ac98dfc55aa59c7');
  });
});
