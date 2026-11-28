/**
 * Phase C (`PA-DEC-04` / `D-4.7` / `IRR-AC-04`) — `HistoricalPriceEvidence` v1 validation,
 * real `NP-04` SQLite persistence, offline `GET /api/reports/artifacts/:reportId` replay with
 * EquiCore stopped, tamper failure, and `W16` `v1` vs `v2` diff tests.
 *
 * @vitest-environment node
 */
import { describe, expect, it, afterEach } from 'vitest';
import http from 'node:http';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';
import { ReportingEngine } from '../../../iips-platform/src/sector-engines/cross-sector/reporting/ReportingEngine';
import { ReportsPersistence } from './persistence';
import { adaptNp04Store } from './np04-adapter';
import {
  NP04_DATABASE_PATH_ENV,
  releaseNp04DatabasesUnderDirectory,
} from './persistence-port';
import {
  APPROVED_REPORTS_OWNER_USER_ID,
  APPROVED_REPORTS_TENANT_ID,
  materialiseReportsOwnerCarrier,
} from '../reports-owner-carrier';
import { REPORTS_OWNER_PATH_ENV } from '../reports-owner-resolver';
import { handleReportsRequest } from '../reports-transport';
import {
  computeObservationDigest,
  diffHistoricalPriceEvidence,
  embedHistoricalPriceEvidence,
  extractHistoricalPriceEvidenceFromPayload,
  HISTORICAL_PRICE_EVIDENCE_SCHEMA,
  HistoricalPriceEvidenceError,
  validateHistoricalPriceEvidence,
  type HistoricalPriceEvidence,
  type HistoricalPriceObservation,
} from './historicalEvidence';
import {
  compareW15HistoricalEvidence,
  mapReportArtifactToEnvelope,
} from '../investment/lineage/provenanceEnvelope';

const OWNER = { tenantId: 'test-tenant-d47', userId: 'test-user-d47' } as const;
const MANIFEST_V1 = 'e7c7e4c8'.repeat(8);
const MANIFEST_V2 = 'f8d8f5d9'.repeat(8);
const DIGEST_V1 = '11'.repeat(32);
const DIGEST_V2 = '22'.repeat(32);

const temporaryDirs: string[] = [];
const savedOwnerPath = process.env[REPORTS_OWNER_PATH_ENV];
const savedDbPath = process.env[NP04_DATABASE_PATH_ENV];

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-d47-evidence-'));
  temporaryDirs.push(dir);
  return dir;
}

afterEach(() => {
  if (savedOwnerPath === undefined) delete process.env[REPORTS_OWNER_PATH_ENV];
  else process.env[REPORTS_OWNER_PATH_ENV] = savedOwnerPath;

  if (savedDbPath === undefined) delete process.env[NP04_DATABASE_PATH_ENV];
  else process.env[NP04_DATABASE_PATH_ENV] = savedDbPath;

  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (!dir) continue;
    releaseNp04DatabasesUnderDirectory(dir);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function makeEvidence(opts: {
  readonly close: string;
  readonly manifestSha?: string;
  readonly compositeGen?: string | null;
  readonly responseDigest?: string;
  readonly retrievedAt?: string;
}): HistoricalPriceEvidence {
  const observations: HistoricalPriceObservation[] = [
    {
      businessDate: '2026-09-01',
      open: '2950.00',
      high: '2980.00',
      low: '2940.00',
      close: opts.close,
      last: opts.close,
      prevClose: '2945.00',
      volume: '5000000',
      tradedValue: '14850000000.00',
      tradesCount: 120000,
      observedSymbol: 'RELIANCE',
      isinValidity: 'VALID',
      flags: [],
      archiveSha256: 'dd'.repeat(32),
      sourceArchive: 'bhav_20260901.zip',
      memberName: 'bhav.csv',
      sourceFile: 'rows/2026-09-01.jsonl',
      sourceLineNumber: 42,
    },
  ];
  return {
    schema: HISTORICAL_PRICE_EVIDENCE_SCHEMA,
    observations,
    observationDigest: computeObservationDigest(observations),
    sourceIdentity: {
      source: 'EQUICORE_NSE_EOD',
      exchange: 'NSE',
      exchangeSegment: 'NSE_EQ',
      securityId: 'ISIN:INE002A01018:EQ',
      isin: 'INE002A01018',
      series: 'EQ',
      companyId: 'COMP:REL',
      isinValidity: 'VALID',
      frequency: '1D',
      observedSymbols: ['RELIANCE'],
    },
    adjustment: {
      mode: 'RAW_UNADJUSTED',
      isAdjusted: false,
      corporateActionApplied: false,
      factor: null,
      corporateActionId: null,
      unitsProvenanceNote: 'Unadjusted for corporate actions (RAW_UNADJUSTED).',
    },
    provenance: {
      specVersion: 'D05/1.0',
      runId: 'run-m2',
      baselineManifestSha256: opts.manifestSha ?? MANIFEST_V1,
      compositeGeneration: opts.compositeGen ?? null,
      servingIndexSha256: 'aa'.repeat(32),
      isinIndexSha256: 'bb'.repeat(32),
      engineToolSha256: 'cc'.repeat(32),
      runnerSha256: null,
      corpusCoverageFrom: '2016-09-20',
      corpusCoverageTo: '2026-09-18',
    },
    temporal: {
      temporalModel: 'PINNED_GENERATION_EOD_SNAPSHOT',
      bitemporalKnowledgeAsOf: false,
      requestedFromDate: '2026-09-01',
      requestedToDate: '2026-09-01',
    },
    completeness: {
      status: 'exact',
      tradingDaysWithArchive: 1,
      returnedBarCount: 1,
      securityAbsentOnTradingDaysCount: 0,
      unexplainedCalendarDates: [],
      notRetrievedCalendarDates: [],
      officialHolidayDates: [],
      d21HeldDates: [],
    },
    integrity: {
      responseDigest: opts.responseDigest ?? DIGEST_V1,
      responseDigests: [opts.responseDigest ?? DIGEST_V1],
      digestVerified: true,
      retrievedAt: opts.retrievedAt ?? '2026-11-24T10:00:00.000Z',
    },
  };
}

function makeEngineOutput(evidence: HistoricalPriceEvidence) {
  const out = new ReportingEngine().build(
    'Portfolio Summary',
    'P-D47',
    {
      scenario: 'Base',
      sectorExposure: { Energy: 1 },
      concentration: { hhi: 1 },
      diversificationScore: 0.5,
      avgConviction: 0.7,
      avgQuality: 0.7,
      avgRisk: 0.2,
    } as never,
    [{ companyId: 'COMP:REL', sector: 'Energy', conviction: 0.7 }] as never,
    { recommendation: { Energy: 1 }, rulesApplied: [] } as never,
    { diversificationBand: 'LOW', flags: [] } as never,
    { top: [], rationale: 'd47' } as never,
    { flags: [] } as never,
  );
  return {
    ...out,
    payload: embedHistoricalPriceEvidence(out.payload as Record<string, unknown>, evidence),
  };
}

describe('D-4.7 HistoricalPriceEvidence v1 contract, NP-04 persistence, offline replay & W16 diff', () => {
  it('validates all 6 mandatory blocks and rejects tampered observationDigest or missing EQUICORE provenance', () => {
    const valid = makeEvidence({ close: '2975.50' });
    expect(validateHistoricalPriceEvidence(valid).observationDigest).toMatch(/^[0-9a-f]{64}$/);

    // Tampered price with stale observationDigest -> rejected fail-closed
    const tamperedObs = {
      ...valid,
      observations: [{ ...valid.observations[0]!, close: '9999.99' }],
    };
    expect(() => validateHistoricalPriceEvidence(tamperedObs)).toThrow(
      HistoricalPriceEvidenceError,
    );

    // Missing responseDigest on EQUICORE_NSE_EOD -> rejected
    const missingDigest = {
      ...valid,
      integrity: { ...valid.integrity, responseDigest: null, digestVerified: false },
    };
    expect(() => validateHistoricalPriceEvidence(missingDigest)).toThrow(
      HistoricalPriceEvidenceError,
    );
  });

  it('persists into real NP-04 SQLite, serves GET /api/reports/artifacts/:reportId offline with EquiCore stopped, and diffs v1 vs v2 in W16', async () => {
    const dir = tempDir();
    const dbPath = path.join(dir, 'reports-d47.db');
    const carrierDir = path.join(dir, 'owner');

    // Materialize R1 owner carrier for HTTP read route
    const carrierPath = materialiseReportsOwnerCarrier(carrierDir);
    process.env[REPORTS_OWNER_PATH_ENV] = carrierPath;
    process.env[NP04_DATABASE_PATH_ENV] = dbPath;

    // Ensure EquiCore env is completely absent during offline read
    delete process.env.IIPS_EQUICORE_BASE_URL;
    delete process.env.IIPS_EQUICORE_TRANSPORT_TOKEN;

    const ev1 = makeEvidence({
      close: '2975.50',
      manifestSha: MANIFEST_V1,
      compositeGen: null,
      responseDigest: DIGEST_V1,
      retrievedAt: '2026-11-24T10:00:00.000Z',
    });
    const ev2 = makeEvidence({
      close: '2990.00',
      manifestSha: MANIFEST_V2,
      compositeGen: 'comp-gen-2026-09-21',
      responseDigest: DIGEST_V2,
      retrievedAt: '2026-11-24T11:00:00.000Z',
    });

    let v1Id = '';
    let v2Id = '';
    const db = openDatabase({ path: dbPath, createDirectory: true, migrate: true });
    try {
      const persistence = new ReportsPersistence(adaptNp04Store(new GovernedArtifactStore(db)));
      const ownerPair = { tenantId: APPROVED_REPORTS_TENANT_ID, userId: APPROVED_REPORTS_OWNER_USER_ID };

      const v1 = persistence.persistNew(ownerPair, {
        engineOutput: makeEngineOutput(ev1),
        generatedAt: '2026-11-24T10:01:00.000Z',
        parameters: { source: 'EQUICORE_NSE_EOD', securityId: 'ISIN:INE002A01018:EQ' },
      });
      v1Id = v1.reportId;

      const v2 = persistence.appendVersion(ownerPair, v1Id, {
        engineOutput: makeEngineOutput(ev2),
        generatedAt: '2026-11-24T11:01:00.000Z',
        parameters: { source: 'EQUICORE_NSE_EOD', securityId: 'ISIN:INE002A01018:EQ' },
      });
      v2Id = v2.reportId;

      expect(v2.artifactVersion).toBe(2);
      expect(v2.supersedesReportId).toBe(v1Id);
    } finally {
      db.close();
    }

    // Boot real Reports HTTP transport with EquiCore completely absent/stopped
    const server = http.createServer((req, res) => {
      void handleReportsRequest(req, res);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = (server.address() as AddressInfo).port;
    try {
      const res1 = await fetch(`http://127.0.0.1:${port}/api/reports/artifacts/${encodeURIComponent(v1Id)}`);
      expect(res1.status).toBe(200);
      const art1 = (await res1.json() as { data: Record<string, unknown> }).data;

      const res2 = await fetch(`http://127.0.0.1:${port}/api/reports/artifacts/${encodeURIComponent(v2Id)}`);
      expect(res2.status).toBe(200);
      const art2 = (await res2.json() as { data: Record<string, unknown> }).data;

      const extracted1 = extractHistoricalPriceEvidenceFromPayload(String(art1.canonicalPayload));
      const extracted2 = extractHistoricalPriceEvidenceFromPayload(String(art2.canonicalPayload));
      expect(extracted1?.observations[0]?.close).toBe('2975.50');
      expect(extracted2?.observations[0]?.close).toBe('2990.00');

      // W16 provenanceEnvelope comparison across v1 -> v2
      const env1 = mapReportArtifactToEnvelope({
        reportType: String(art1.reportType),
        portfolioId: String(art1.portfolioId),
        chainRef: `reports:${v1Id}`,
        reportId: String(art1.reportId),
        reportKey: String(art1.reportKey),
        artifactVersion: Number(art1.artifactVersion),
        supersedesReportId: null,
        engineOutputId: String((art1.provenance as { engineOutputId: string }).engineOutputId),
        schemaVersion: Number(art1.schemaVersion),
        generatedAt: String(art1.generatedAt),
        historicalPriceEvidence: extracted1,
      });
      const env2 = mapReportArtifactToEnvelope({
        reportType: String(art2.reportType),
        portfolioId: String(art2.portfolioId),
        chainRef: `reports:${v1Id}`,
        reportId: String(art2.reportId),
        reportKey: String(art2.reportKey),
        artifactVersion: Number(art2.artifactVersion),
        supersedesReportId: String(art2.supersedesReportId),
        engineOutputId: String((art2.provenance as { engineOutputId: string }).engineOutputId),
        schemaVersion: Number(art2.schemaVersion),
        generatedAt: String(art2.generatedAt),
        historicalPriceEvidence: extracted2,
      });

      const comparison = compareW15HistoricalEvidence(env1, env2);
      expect(comparison.pair.classification).toBe('SUCCESSIVE_REVISION');
      expect(comparison.evidenceDiff).not.toBeNull();
      expect(comparison.evidenceDiff?.identical).toBe(false);
      expect(comparison.evidenceDiff?.baselineManifestSha256).toEqual({
        before: MANIFEST_V1,
        after: MANIFEST_V2,
        changed: true,
      });
      expect(comparison.evidenceDiff?.compositeGeneration).toEqual({
        before: null,
        after: 'comp-gen-2026-09-21',
        changed: true,
      });
      expect(comparison.evidenceDiff?.responseDigest).toEqual({
        before: DIGEST_V1,
        after: DIGEST_V2,
        changed: true,
      });
      expect(comparison.evidenceDiff?.priceDeltas).toEqual([
        { businessDate: '2026-09-01', field: 'close', before: '2975.50', after: '2990.00' },
        { businessDate: '2026-09-01', field: 'last', before: '2975.50', after: '2990.00' },
      ]);

      // Direct diff helper sanity check for OWNER constant usage
      expect(diffHistoricalPriceEvidence(extracted1!, extracted1!).identical).toBe(true);
      expect(OWNER.tenantId).toBe('test-tenant-d47');
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
