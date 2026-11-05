/**
 * NP-06 Reports — real producer → NP-04 persistence verification.
 *
 * AUTHORITY
 *   PA IMPLEMENTATION AUTHORIZATION — NP-06 REAL REPORT PERSISTENCE (2026-11-05).
 *
 * SCOPE
 *   This is a targeted verification, not a repeat of the five-operation contract suite and not
 *   the F-7 HTTP restart qualification. It proves the missing link identified by the end-to-end
 *   investigation: the GENUINE certified `CrossSectorEngine` output (`pr.reports`) reaches the
 *   existing NP-06 persistence adapter and the NP-04 governed `createInstance` boundary, and is
 *   readable after a fresh store handle is opened on the same durable file.
 *
 * WHAT THIS TEST DOES NOT DO
 *   - It does not fabricate or reconstruct report content. The only input is `pr.reports`.
 *   - It does not construct a Reports-local store. It uses the authoritative NP-04 store.
 *   - It does not exercise the HTTP transport; `reports-api.test.ts` covers that boundary.
 *   - It does not repeat the F-7 separate-process HTTP qualification; the operator script's
 *     `--verify` mode provides the new-process read-back evidence for the real reports.
 *
 * @vitest-environment node
 */
import { describe, it, expect, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';
import { openDatabase, GovernedArtifactStore } from 'iips-np04-governed-persistence/persistence';
import { ReportsPersistence } from './persistence';
import { adaptNp04Store } from './np04-adapter';
import {
  APPROVED_REPORTS_OWNER_USER_ID,
  APPROVED_REPORTS_TENANT_ID,
} from '../reports-owner-carrier';

const temporaryDirs: string[] = [];

afterEach(() => {
  while (temporaryDirs.length > 0) {
    const dir = temporaryDirs.pop();
    if (dir !== undefined) fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('NP-06 real report persistence', () => {
  it('persists the genuine certified CrossSectorEngine reports through NP-04 and reads them back after a store reopen', async () => {
    // Reuse the certified platform execution exactly as the executive transport does. No engine
    // logic is duplicated here: `computeCertifiedPlatform()` is the same function the routes call.
    const { computeCertifiedPlatform } = await import('../executive-transport.js');
    const { csip } = computeCertifiedPlatform();
    const reports = csip.reports;

    // The producer output is genuine, not a fixture: the certified frozen v1.1 baseline produces
    // exactly the Executive and Portfolio Summary reports for the certified reference portfolio.
    expect(reports.length).toBeGreaterThan(0);
    for (const report of reports) {
      expect(report.reportId).toMatch(/^report-(executive|portfolio-summary)-PF-REAL$/);
      expect(['Executive', 'Portfolio Summary']).toContain(report.reportType);
      expect(report.portfolioId).toBe('PF-REAL');
      expect(report.payload).toBeTruthy();
    }

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iips-reports-real-'));
    temporaryDirs.push(dir);
    const dbPath = path.join(dir, 'real-reports.db');

    // The authoritative NP-04 store, not a Reports-local implementation.
    const database = openDatabase({ path: dbPath, createDirectory: true, migrate: true });
    const persistence = new ReportsPersistence(
      adaptNp04Store(new GovernedArtifactStore(database)),
    );

    // The approved Reports owner pair, exactly as the server-owned carrier resolves it.
    const owner = {
      tenantId: APPROVED_REPORTS_TENANT_ID,
      userId: APPROVED_REPORTS_OWNER_USER_ID,
    };
    const generatedAt = '2026-11-05T00:00:00.000Z';

    const persisted = reports.map((report) =>
      persistence.persistNew(owner, { engineOutput: report, generatedAt }),
    );
    expect(persisted).toHaveLength(reports.length);

    for (let index = 0; index < persisted.length; index += 1) {
      const artifact = persisted[index];
      const report = reports[index];

      // NP-04 mints the durable instance identity; the engine content id is only provenance.
      expect(artifact.artifactVersion).toBe(1);
      expect(artifact.supersedesReportId).toBeNull();
      expect(artifact.reportId).not.toBe(report.reportId);
      expect(artifact.reportId.length).toBeGreaterThan(0);
      expect(artifact.ownership).toEqual(owner);
      expect(artifact.provenance.engineOutputId).toBe(report.reportId);
      expect(artifact.reportType).toBe(report.reportType);
      expect(artifact.portfolioId).toBe(report.portfolioId);
      expect(artifact.generatedAt).toBe(generatedAt);

      const resolved = persistence.resolve(owner, artifact.reportId);
      expect(resolved.reportId).toBe(artifact.reportId);
      expect(resolved.reportKey).toBe(artifact.reportKey);
      expect(resolved.canonicalPayload).toBe(artifact.canonicalPayload);
    }

    const page = persistence.queryByOwner(owner);
    expect(page.items).toHaveLength(reports.length);
    expect(page.nextCursor).toBeNull();

    // Close the store and open a fresh handle on the same durable file. This is the
    // persistence-level restart evidence for the real producer output.
    database.close();
    const reopened = openDatabase({ path: dbPath, createDirectory: true, migrate: true });
    const persistenceAfterRestart = new ReportsPersistence(
      adaptNp04Store(new GovernedArtifactStore(reopened)),
    );

    for (const artifact of persisted) {
      const resolved = persistenceAfterRestart.resolve(owner, artifact.reportId);
      expect(resolved.reportId).toBe(artifact.reportId);
      expect(resolved.reportKey).toBe(artifact.reportKey);
      expect(resolved.canonicalPayload).toBe(artifact.canonicalPayload);
    }
    const pageAfterRestart = persistenceAfterRestart.queryByOwner(owner);
    expect(pageAfterRestart.items).toHaveLength(reports.length);
    reopened.close();
  });
});
