#!/usr/bin/env node
/**
 * WS-A §4 investigation — can `DHAN_DETAILED_HOLDINGS_V1` authoritatively resolve the 67 rows?
 *
 * This is an INVESTIGATION artefact. It invents nothing: it reads the governed D05 corpus that the
 * newly pinned `iips-broker-import` alias actually publishes, and reports — for each of the 67
 * unresolved Dhan Web UI rows — whether the governed master already holds an entity for that
 * company. If it does not, then no ISIN or exchange-scoped symbol from a detailed export could
 * resolve the row either, because there would be no governed entity to resolve it TO; a governed
 * D05 deposition (IPD-owned, authorization-act-governed) would be a precondition.
 *
 * Matching here is deliberately reported as a NORMALIZED-NAME / NORMALIZED-SYMBOL PROBE ONLY. It is
 * NOT a mapping, NOT a deposition and NOT an identity claim: the governed master resolves on exact
 * keys, and the probe is wider than the master precisely so that a negative result is conclusive.
 *
 * Run from `frontend/`:
 *   npx tsx ../evidence/integration/ws-a-dhan-68-row-pin-advance-2026-11-05/probe-d05-coverage.mts
 */
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

const FRONTEND = path.resolve(import.meta.dirname, '../../../frontend');
const CACHE = path.join(FRONTEND, '.cache/broker-import');
const CSV = path.join(FRONTEND, 'server/broker-import/__fixtures__/dhan-web-ui-summary-68.csv');

const corpus = (await import(path.join(CACHE, 'src/identity/d05_broad_universe_data.js'))) as {
  D05_BROAD_UNIVERSE_ENTITIES: ReadonlyArray<{
    companyId: string; companyName?: string; isin?: string;
    nseSymbol?: string; bseSymbol?: string;
    listings?: ReadonlyArray<{ exchange?: string; symbol?: string }>;
  }>;
};
const master = (await import(path.join(CACHE, 'src/identity/governed_fixture_master.js'))) as {
  getGovernedBroadSecurityMaster(): { listAllCompanyIds(): string[]; sourceRevision?: { batchId: string; fileChecksumSha256: string } };
};

const entities = corpus.D05_BROAD_UNIVERSE_ENTITIES;
const governed = master.getGovernedBroadSecurityMaster();
const norm = (s: string | undefined | null): string => (s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const byCompanyName = new Map<string, string>();
const byListingSymbol = new Map<string, string>();
const byNseSymbol = new Map<string, string>();
const byBseSymbol = new Map<string, string>();
const isins = new Set<string>();
for (const e of entities) {
  if (e.companyName) byCompanyName.set(norm(e.companyName), e.companyId);
  if (e.nseSymbol) byNseSymbol.set(norm(e.nseSymbol), e.companyId);
  if (e.bseSymbol) byBseSymbol.set(norm(e.bseSymbol), e.companyId);
  if (e.isin) isins.add(e.isin.toUpperCase());
  for (const l of e.listings ?? []) byListingSymbol.set(norm(l.symbol), e.companyId);
}

const content = fs.readFileSync(CSV, 'utf8');
const names = content.trim().split('\n').slice(1).map((l) => l.split(',')[0]);

// The unresolved set is TAKEN FROM the pinned pipeline's own published per-row assessment
// (03-identity-assessment-68-row.json), never assumed here.
const assessmentPath = path.join(import.meta.dirname, '03-identity-assessment-68-row.json');
const assessment = JSON.parse(fs.readFileSync(assessmentPath, 'utf8')) as {
  rows: ReadonlyArray<{ rowIndex: number; symbol: string; identityStatus: string; identityRefusalCode: string | null }>;
};
const unresolvedRows = assessment.rows.filter((r) => r.identityStatus !== 'RESOLVED');
const resolvedRows = assessment.rows.filter((r) => r.identityStatus === 'RESOLVED');
if (unresolvedRows.length + resolvedRows.length !== names.length) {
  throw new Error('assessment vector does not cover the fixture row inventory');
}

const rows = unresolvedRows.map(({ rowIndex, symbol: name }) => {
  const key = norm(name);
  const probeHits = {
    companyNameExactNormalized: byCompanyName.get(key) ?? null,
    listingSymbolExactNormalized: byListingSymbol.get(key) ?? null,
    nseSymbolExactNormalized: byNseSymbol.get(key) ?? null,
    bseSymbolExactNormalized: byBseSymbol.get(key) ?? null,
  };
  const anyHit = Object.values(probeHits).some((v) => v !== null);
  return {
    rowIndex,
    sourceName: name,
    governedCorpusProbe: probeHits,
    presentInGovernedD05Corpus: anyHit,
    couldDetailedExportResolveAgainstCurrentCorpus: anyHit,
    preconditionIfAbsent: anyHit
      ? null
      : 'A governed D05 deposition of the entity (IPD-owned, authorization-act-governed) is required before any ISIN or exchange-scoped symbol could resolve it.',
  };
});

const result = {
  investigation: 'WS-A §4 — DHAN_DETAILED_HOLDINGS_V1 as an authoritative identifier source for the 67 unresolved rows',
  generatedFrom: {
    governedCorpusModule: 'src/identity/d05_broad_universe_data.js (published by the pinned alias, consumed byte-for-byte)',
    governedMasterModule: 'src/identity/governed_fixture_master.js',
    fixture: path.relative(FRONTEND, CSV),
    fixtureSha256: createHash('sha256').update(content, 'utf8').digest('hex'),
  },
  governedMaster: {
    entityCount: entities.length,
    companyIdsInMaster: governed.listAllCompanyIds().length,
    sourceRevision: governed.sourceRevision ?? null,
    distinctIsinsInCorpus: isins.size,
  },
  probeSemantics: [
    'This is a COVERAGE PROBE, not a mapping. It is deliberately WIDER than the governed master (which resolves on exact keys only) so that a negative result is conclusive.',
    'Nothing here is deposited, asserted as an identity, or fed back into the pipeline. No ISIN, symbol or companyId was invented.',
  ],
  unresolvedRowCount: unresolvedRows.length,
  unresolvedRowIndices: unresolvedRows.map((r) => r.rowIndex),
  unresolvedRefusalCodes: unresolvedRows.reduce<Record<string, number>>((a, r) => {
    const k = r.identityRefusalCode ?? 'null';
    a[k] = (a[k] ?? 0) + 1;
    return a;
  }, {}),
  presentInGovernedD05CorpusCount: rows.filter((r) => r.presentInGovernedD05Corpus).length,
  absentFromGovernedD05CorpusCount: rows.filter((r) => !r.presentInGovernedD05Corpus).length,
  resolvedReferenceRows: resolvedRows.map((r) => ({
    rowIndex: r.rowIndex,
    sourceName: r.symbol,
    resolvedByPipeline: true,
    governedAliasHit: byListingSymbol.get(norm(r.symbol)) ?? byCompanyName.get(norm(r.symbol)) ?? null,
    note: 'Resolved by the governed master on an exact governed key/alias. Not part of the unresolved set.',
  })),
  rows,
};

fs.writeFileSync(
  path.join(import.meta.dirname, '08-d05-coverage-probe.json'),
  `${JSON.stringify(result, null, 2)}\n`,
);
process.stdout.write(
  `08-d05-coverage-probe.json written\n`
  + `  governed D05 corpus entities            : ${entities.length}\n`
  + `  distinct ISINs in the governed corpus    : ${isins.size}\n`
  + `  unresolved rows probed                  : ${unresolvedRows.length}\n`
  + `  present in the governed corpus          : ${result.presentInGovernedD05CorpusCount}\n`
  + `  absent from the governed corpus         : ${result.absentFromGovernedD05CorpusCount}\n`,
);
