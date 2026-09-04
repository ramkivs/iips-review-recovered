/**
 * IIPS v3.0 — Product E2E — HTTP transport tests for Product APIs
 *
 * Verifies CSIP→Product data flow for the authorized 10-engine LTS baseline:
 *   GET /api/executive, /api/portfolio, /api/cross-sector,
 *   GET /api/company/:id, /api/evidence/:id, /api/replay/:id,
 *   provenance (SNAPSHOT, calibratedAt 2026-08-09, dataSource certified),
 *   determinism (rerun identical), replay (byteIdentical, differenceAvailable:false),
 *   negative/boundary (404 for IES-016/017/020 + taxonomy-resolved + unknown).
 *
 * Uses the real executive-transport handlers via HTTP (offline-safe, no mock of business logic).
 * The executive transport's computeCertified* functions are pure and deterministic (fixed clock + deterministic IdProvider);
 * we test via HTTP like engine-transport.test.ts does.
 */

import { describe, it, expect } from 'vitest';
import http from 'node:http';
import { AddressInfo } from 'node:net';

// Import the certified product handlers directly (semantically inert, 1:1 DTO mapping).
import {
  computeCertifiedExecutive,
  computeCertifiedPortfolio,
  computeCertifiedCrossSector,
  computeCertifiedCompany,
  computeCertifiedEvidence,
  computeCertifiedReplay,
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

const TEN_SECTORS = [
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
];

describe('Product transport (E2E Product HTTP)', () => {
  it('GET /api/executive returns 10 holdings with SNAPSHOT provenance (no fabrication)', async () => {
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
    expect(body.portfolio.holdings).toBe(10);
    expect(typeof body.portfolio.avgConviction).toBe('number');
    expect(body.ranking.length).toBe(10);
    expect(body.decisions.length).toBe(10);
    expect(body.provenance.freshness).toBe('SNAPSHOT');
    expect(body.provenance.calibratedAt).toBe('2026-08-09T00:00:00.000Z');
    expect(body.provenance.dataSource).toMatch(/certified v2\.0 platform/);
    expect(body.provenance.transportSemantics).toMatch(/1:1 mapping/);
    // No 016/017/020 sector ever appears
    const sectors = body.decisions.map((d) => d.sector);
    expect(sectors).not.toContain('Telecom');
    expect(sectors).not.toContain('Auto');
    expect(sectors).not.toContain('Materials');
    // All 10 authorized sectors present
    for (const s of TEN_SECTORS) expect(sectors).toContain(s);
  });

  it('GET /api/portfolio returns 10 holdings with allocation and SNAPSHOT provenance', async () => {
    const { status, json } = await request('/api/portfolio');
    expect(status).toBe(200);
    const body = json as {
      portfolio: { holdings: number };
      holdings: Array<{ sector: string; decision: string; composite: number; weight: number }>;
      allocation: { strategy: string; recommendation: string };
      evidenceRefs: Array<{ evidenceId: string; engineId: string }>;
      provenance: { freshness: string; calibratedAt: string };
    };
    expect(body.portfolio.holdings).toBe(10);
    expect(body.holdings.length).toBe(10);
    expect(body.evidenceRefs.length).toBe(10);
    expect(body.allocation.strategy).toBe('Balanced');
    expect(typeof body.allocation.recommendation).toBe('string');
    expect(body.provenance.freshness).toBe('SNAPSHOT');
    expect(body.provenance.calibratedAt).toBe('2026-08-09T00:00:00.000Z');
    const sectors = body.holdings.map((h) => h.sector);
    expect(sectors).not.toContain('Telecom');
    for (const s of TEN_SECTORS) expect(sectors).toContain(s);
  });

  it('GET /api/cross-sector returns 10 ranking with SNAPSHOT provenance', async () => {
    const { status, json } = await request('/api/cross-sector');
    expect(status).toBe(200);
    const body = json as {
      portfolio: { holdings: number };
      ranking: Array<{ sector: string; conviction: number }>;
      decisions: Array<{ sector: string }>;
      provenance: { freshness: string };
    };
    expect(body.portfolio.holdings).toBe(10);
    expect(body.ranking.length).toBe(10);
    expect(body.decisions.length).toBe(10);
    expect(body.provenance.freshness).toBe('SNAPSHOT');
    const sectors = body.ranking.map((r) => r.sector);
    expect(sectors).not.toContain('Telecom');
    for (const s of TEN_SECTORS) expect(sectors).toContain(s);
  });

  it('GET /api/company/:id returns certified company for all 10 authorized sectors', async () => {
    for (const sector of TEN_SECTORS) {
      const { status, json } = await request(`/api/company/${encodeURIComponent(sector)}`);
      expect(status).toBe(200);
      const body = json as { sector: string; decision: { verdict: string; composite: number } };
      expect(body.sector).toBe(sector);
      expect(typeof body.decision.verdict).toBe('string');
      expect(typeof body.decision.composite).toBe('number');
    }
  });

  it('GET /api/company/:id returns 404 for IES-016/017/020 and taxonomy-resolved categories', async () => {
    for (const bad of ['Telecom', 'Auto', 'Materials', 'telecom', 'materials', 'auto', 'IT', 'Chemicals', 'Realty']) {
      const { status } = await request(`/api/company/${encodeURIComponent(bad)}`);
      expect(status).toBe(404);
    }
  });

  it('GET /api/evidence/:id and /api/replay/:id return attributable, replayable evidence for all 10', async () => {
    for (const sector of TEN_SECTORS) {
      const ev = await request(`/api/evidence/${encodeURIComponent(sector)}`);
      expect(ev.status).toBe(200);
      const evb = ev.json as { evidence: { evidenceId: string; replayReference: string }; provenance: { freshness: string } };
      expect(evb.evidence.evidenceId).toBe(`ev_${sector}`);
      expect(evb.evidence.replayReference).toBe(`snap_${sector}`);
      expect(evb.provenance.freshness).toBe('SNAPSHOT');

      const rep = await request(`/api/replay/${encodeURIComponent(sector)}`);
      expect(rep.status).toBe(200);
      const repb = rep.json as { replay: { reproduced: boolean; byteIdentical: boolean }; differenceAvailable: boolean };
      expect(repb.replay.reproduced).toBe(true);
      expect(repb.replay.byteIdentical).toBe(true);
      expect(repb.differenceAvailable).toBe(false);
    }
  });

  it('GET /api/evidence/:id and /api/replay/:id return 404 for unknown / IES-016/017/020', async () => {
    for (const bad of ['Telecom', 'UnknownSector', 'sector.telecom']) {
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

  it('Product responses never include IES-016/017/020 or taxonomy-resolved IT/Chemicals/Realty', async () => {
    const ex = await request('/api/executive');
    const body = ex.json as { decisions: Array<{ sector: string }>; ranking: Array<{ sector: string }>; opportunity: Array<{ sector: string }> };
    const allSectors = [...body.decisions.map((d) => d.sector), ...body.ranking.map((r) => r.sector), ...body.opportunity.map((o) => o.sector)];
    for (const forbidden of ['Telecom', 'Auto', 'Materials', 'IT', 'Chemicals', 'Realty']) {
      expect(allSectors).not.toContain(forbidden);
    }
    // Also ensure no sector.it / sector.chemicals in evidenceRefs via portfolio
    const pf = await request('/api/portfolio');
    const pfb = pf.json as { evidenceRefs: Array<{ engineId: string }> };
    for (const ref of pfb.evidenceRefs) {
      expect(ref.engineId).not.toMatch(/sector\.telecom|sector\.auto|sector\.materials|sector\.it/);
    }
  });

  it('Product CSIP→DTO preserves certified 10-engine baseline — holdings/ranking traceable', async () => {
    // Holdings weight comes from CSIP sectorExposure which sums from 10 engine outputs; ranking is CSIP ranking.
    const ex = await request('/api/executive');
    const pf = await request('/api/portfolio');
    const cs = await request('/api/cross-sector');
    const exb = ex.json as { portfolio: { holdings: number }; ranking: Array<{ sector: string }> };
    const pfb = pf.json as { portfolio: { holdings: number }; holdings: Array<{ sector: string }> };
    const csb = cs.json as { portfolio: { holdings: number }; ranking: Array<{ sector: string }> };
    // All three surfaces agree: 10 holdings
    expect(exb.portfolio.holdings).toBe(10);
    expect(pfb.portfolio.holdings).toBe(10);
    expect(csb.portfolio.holdings).toBe(10);
    // Holdings sectors equal ranking sectors (same CSIP source)
    expect(new Set(pfb.holdings.map((h) => h.sector))).toEqual(new Set(exb.ranking.map((r) => r.sector)));
    expect(new Set(csb.ranking.map((r) => r.sector))).toEqual(new Set(exb.ranking.map((r) => r.sector)));
  });
});
