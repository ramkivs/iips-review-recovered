/**
 * IID-3 — M-1 pipeline helper (synthetic).
 *
 * One place that assembles the demonstration environment: identity files, two dataset snapshots (v1 and the
 * perturbed v2), the owner carrier, and the governed database path. Tests and the demonstration script both
 * use it, so the evidence and the tests cannot describe different environments.
 *
 * Nothing here is product code. The owner carrier is the approved canonical carrier bytes written OUTSIDE any
 * Git working tree, exactly as the carrier materialiser requires.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { assessCompany } from '../../../../iips-platform/src/investment/assessment/engine';
import type { SectorName } from '../../../../iips-platform/src/investment/contracts/operatingMetrics';
import { buildBinding, resolveIdentity } from '../../../../iips-platform/src/investment/identity/resolver';
import { loadIdentitySources, IDENTITY_FILE_NAMES } from '../../../../iips-platform/src/investment/identity/sources';
import { readDataset } from '../../../../iips-platform/src/investment/ingestion/writer';
import { CANONICAL_REPORTS_CARRIER_TEXT } from '../../reports-owner-carrier.js';
import { composeAssessmentArtifact, type ComposedAssessment, type DatasetClass } from '../assessmentComposition.js';
import {
  M1_DATASET_PROVIDER,
  M1_ISSUER_ID,
  M1_OBSERVATION,
  m1Dataset,
  m1DatasetV2,
  writeM1Dataset,
  writeM1IdentityDir,
} from './m1Data';

export interface M1Environment {
  readonly root: string;
  readonly identityDir: string;
  readonly datasetV1Dir: string;
  readonly datasetV2Dir: string;
  readonly dbPath: string;
  readonly carrierPath: string;
  readonly cleanup: () => void;
}

/** Deterministic clocks, so two runs over identical inputs are byte-identical. */
export const M1_NOW = '2026-11-06T00:00:00.000Z';
export const M1_NOW_V2 = '2026-11-06T00:05:00.000Z';

/**
 * Create an isolated demonstration environment.
 *
 * The default root is a fresh temporary directory, so an M-1 run cannot touch an existing store, an existing
 * carrier, or any previously persisted artifact — the demonstration is always a NEW isolated scope.
 */
export function prepareM1Environment(root?: string): M1Environment {
  const rootDir = root ?? mkdtempSync(join(tmpdir(), 'iid3-m1-'));
  mkdirSync(rootDir, { recursive: true });

  const identityDir = writeM1IdentityDir(join(rootDir, 'identity'));
  const datasetV1Dir = join(rootDir, 'dataset-v1');
  const datasetV2Dir = join(rootDir, 'dataset-v2');
  writeM1Dataset(datasetV1Dir, m1Dataset(), M1_NOW);
  writeM1Dataset(datasetV2Dir, m1DatasetV2(), M1_NOW);

  const carrierPath = join(rootDir, 'reports-owner-context.json');
  writeFileSync(carrierPath, CANONICAL_REPORTS_CARRIER_TEXT, 'utf8');

  const dbPath = join(rootDir, 'investment.db');

  return {
    root: rootDir,
    identityDir,
    datasetV1Dir,
    datasetV2Dir,
    dbPath,
    carrierPath,
    cleanup: (): void => {
      rmSync(rootDir, { recursive: true, force: true });
    },
  };
}

export interface M1Assembly {
  readonly composed: ComposedAssessment;
  readonly datasetClass: DatasetClass;
  readonly dataset: {
    readonly datasetVersion: string;
    readonly contentDigest: string;
    readonly provider: string;
    readonly dataAsOf: string | null;
    readonly knownAsOf: string | null;
  };
  readonly identity: {
    readonly state: string;
    readonly issuerId: string | null;
    readonly securityId: string | null;
    readonly bindingId: string;
  };
  readonly assessment: {
    readonly adequacy: string;
    readonly qualityVerdict: string;
    readonly confidence: number;
    readonly withheldMethods: number;
    readonly missingFields: number;
    readonly evidence: number;
  };
  readonly violations: number;
}

/** Load the identity sources of an environment, labelled as synthetic. */
export function m1Sources(identityDir: string) {
  const result = loadIdentitySources({
    roster: readFileSync(join(identityDir, IDENTITY_FILE_NAMES.roster), 'utf8'),
    listingMap: readFileSync(join(identityDir, IDENTITY_FILE_NAMES.listingMap), 'utf8'),
    corporateActions: readFileSync(join(identityDir, IDENTITY_FILE_NAMES.corporateActions), 'utf8'),
    dataClass: 'SYNTHETIC_FIXTURE',
  });
  if (!result.available) {
    throw new Error(`identity sources unavailable: ${JSON.stringify(result.issues)}`);
  }
  return result.sources;
}

/**
 * Run the household sequence up to composition: snapshot → identity → assessment → compose.
 *
 * Deliberately the same steps, in the same order, as the CLI. Persistence is the caller's business.
 */
export function assembleAssessment(options: {
  readonly identityDir: string;
  readonly datasetDir: string;
  readonly generatedAt: string;
}): M1Assembly {
  const datasetRead = readDataset(options.datasetDir);
  const manifest = datasetRead.manifest;
  const datasetClass: DatasetClass =
    manifest.provider === M1_DATASET_PROVIDER ? 'SYNTHETIC_REFERENCE' : 'APPROVED_LOCAL_INGESTION';

  const sources = m1Sources(options.identityDir);
  const asOf = options.generatedAt.slice(0, 10);
  const resolution = resolveIdentity(
    {
      observationId: M1_OBSERVATION.observationId,
      source: M1_OBSERVATION.source,
      isin: M1_OBSERVATION.isin,
      symbol: M1_OBSERVATION.symbol,
      exchange: M1_OBSERVATION.exchange,
      series: M1_OBSERVATION.series,
      cin: M1_OBSERVATION.cin,
      companyIdHint: M1_OBSERVATION.companyIdHint,
    },
    { sources, asOf },
  );
  if (resolution.state !== 'RESOLVED' || resolution.issuerId !== M1_ISSUER_ID) {
    throw new Error(`identity did not resolve to ${M1_ISSUER_ID}: ${resolution.state}`);
  }
  const binding = buildBinding(
    { ...M1_OBSERVATION, raw: { ...M1_OBSERVATION.raw } },
    resolution,
    { sources, asOf },
  );

  const issuer = sources.roster.issuers.find((entry) => entry.issuerId === M1_ISSUER_ID)!;
  const engineResult = assessCompany({
    issuerId: M1_ISSUER_ID,
    legalName: issuer.legalName,
    sector: issuer.sector as SectorName,
    sectorSubsegment: issuer.subSegment,
    securityId: resolution.securityId ?? M1_ISSUER_ID,
    dataset: datasetRead.content,
    datasetVersion: manifest.datasetVersion,
    contentDigest: manifest.contentDigest,
    provider: manifest.provider,
    identity: {
      bindingRef: binding.bindingId,
      rosterVersion: sources.versions.rosterVersion,
      listingMapVersion: sources.versions.listingMapVersion,
      corporateActionTableVersion: sources.versions.corporateActionTableVersion,
    },
    generatedAt: options.generatedAt,
    knownAsOf: manifest.knownAsOf ?? options.generatedAt,
  });

  const composed = composeAssessmentArtifact({
    payload: engineResult.payload,
    inputDigest: engineResult.inputDigest,
    generatedAt: options.generatedAt,
    datasetClass,
    violations: engineResult.violations,
  });

  const payload = engineResult.payload;
  return {
    composed,
    datasetClass,
    dataset: {
      datasetVersion: manifest.datasetVersion,
      contentDigest: manifest.contentDigest,
      provider: manifest.provider,
      dataAsOf: manifest.dataAsOf,
      knownAsOf: manifest.knownAsOf,
    },
    identity: {
      state: resolution.state,
      issuerId: resolution.issuerId,
      securityId: resolution.securityId,
      bindingId: binding.bindingId,
    },
    assessment: {
      adequacy: payload.completeness.adequacy,
      qualityVerdict: payload.quality.verdict,
      confidence: payload.confidence.combined,
      withheldMethods: payload.valuation.methods.filter((method) => method.output === null).length,
      missingFields: payload.completeness.missingFields.length,
      evidence: payload.evidence.length,
    },
    violations: engineResult.violations.length,
  };
}
