/**
 * IID-1 — runtime adapters for the surfaces that live outside `iips-platform`.
 *
 * The frontend server needs exactly two things from IRR: the versioned identity files, and the
 * financial-coverage disclosure for the dataset it serves. Both are expressed here so the transport
 * imports one module instead of reaching into the platform's internal layout — and so the platform
 * decides how its own files are read.
 *
 * Read-only. No write, no store, no cache, no persistence.
 */
import { openLocalSnapshot } from '../port/localSnapshotStore';
import { measureCoverage } from '../coverage/measure';
import { buildFinancialCoverageDisclosure, type FinancialCoverageDisclosure } from './coverage';
import { loadIdentitySourcesFromDir, resolveIdentityDir, type SourceLoadResult } from './sources';
import {
  buildInvestmentCoverageReport,
  type InvestmentCoverageReport,
} from '../coverage/investmentCoverage';
import type { DatasetManifest } from '../fundamentals/manifest';
import type {
  IngestionIssue,
  IssuerRecord,
  NormalizedPeriod,
  PriceRecord,
  SecurityRecord,
} from '../fundamentals/types';
import type { OperatingMetricRecord } from '../contracts/operatingMetrics';

/** Load the eligible roster, listing map and corporate-action table from the local data domain. */
export function loadRuntimeIdentitySources(dataRoot?: string): SourceLoadResult {
  return loadIdentitySourcesFromDir(resolveIdentityDir(dataRoot));
}

/** The directory the runtime reads, exposed so a failure can name it without guessing. */
export function runtimeIdentityDir(dataRoot?: string): string {
  return resolveIdentityDir(dataRoot);
}

/**
 * Disclose what the served dataset has actually been measured for. Never throws: an absent or
 * unreadable dataset is disclosed as `NONE`, which is the truthful answer and keeps identity coverage
 * independent of financial coverage.
 */
export function financialCoverageFromLocalDataset(dataRoot?: string): FinancialCoverageDisclosure {
  try {
    const port = openLocalSnapshot(dataRoot === undefined ? {} : { dataRoot });
    const manifest = port.manifest();
    const issuers = port.listIssuers();
    const securities = issuers.flatMap((issuer) => port.securitiesFor(issuer.issuerId));
    const report = measureCoverage(
      {
        issuers,
        securities,
        listings: issuers.flatMap((issuer) => port.listingsFor(issuer.issuerId)),
        periods: issuers.flatMap((issuer) => port.periodsFor(issuer.issuerId)),
        prices: securities.flatMap((security) => port.pricesFor(security.securityId)),
        corporateActions: issuers.flatMap((issuer) => port.corporateActionsFor(issuer.issuerId)),
        operatingMetrics: issuers.flatMap((issuer) => port.operatingMetricsFor(issuer.issuerId)),
        issues: port.issues(),
      },
      { datasetVersion: manifest.datasetVersion, generatedAt: manifest.lastImportAt },
    );
    const unmapped = port
      .issues()
      .filter((issue) => issue.code === 'UNMAPPED_XBRL_TAG')
      .map((issue) => /tag "([^"]+)"/.exec(issue.detail)?.[1] ?? issue.detail);
    return buildFinancialCoverageDisclosure({
      sectorReport: report,
      manifest,
      unmappedTagsObserved: unmapped,
    });
  } catch {
    return buildFinancialCoverageDisclosure({});
  }
}

/**
 * Read the INVESTMENT coverage position of the served dataset.
 *
 * INDEPENDENT OF THE IDENTITY SOURCES, BY CONSTRUCTION. This reads the local snapshot store and
 * the sector measurement only. The identity files are consulted for ONE thing only — whether they
 * could be loaded, so the report can disclose that fact — and their absence never prevents the
 * dataset position from being computed.
 *
 * Never throws for an absent dataset: an unreadable or missing dataset is reported as
 * `datasetClass: 'NONE'`, which is the truthful answer. A caller that wants to distinguish
 * "no dataset" from "the dataset could not be read" reads `datasetClass` and `dataset.quality`.
 *
 * Read-only. No write, no store, no cache, no persistence.
 */
export function investmentCoverageFromLocalDataset(
  asOf: string,
  dataRoot?: string,
): InvestmentCoverageReport {
  const identitySources = loadRuntimeIdentitySources(dataRoot);
  const identitySourcesAvailable = identitySources.available;

  let manifest: DatasetManifest | null = null;
  let issuers: readonly IssuerRecord[] = [];
  let securities: readonly SecurityRecord[] = [];
  let periods: readonly NormalizedPeriod[] = [];
  let prices: readonly PriceRecord[] = [];
  let operatingMetrics: readonly OperatingMetricRecord[] = [];
  let issues: readonly IngestionIssue[] = [];

  try {
    const port = openLocalSnapshot(dataRoot === undefined ? {} : { dataRoot });
    manifest = port.manifest();
    const issuerRecords = port.listIssuers();
    issuers = issuerRecords;
    securities = issuerRecords.flatMap((issuer) => port.securitiesFor(issuer.issuerId));
    periods = issuerRecords.flatMap((issuer) => port.periodsFor(issuer.issuerId));
    prices = securities.flatMap((security) => port.pricesFor(security.securityId));
    operatingMetrics = issuerRecords.flatMap((issuer) => port.operatingMetricsFor(issuer.issuerId));
    issues = port.issues();
  } catch {
    // An absent or unreadable dataset is disclosed as NONE. Nothing is estimated.
    manifest = null;
    issuers = [];
    securities = [];
    periods = [];
    prices = [];
    operatingMetrics = [];
    issues = [];
  }

  return buildInvestmentCoverageReport({
    asOf,
    generatedAt: `${asOf}T00:00:00.000Z`,
    manifest,
    issuers,
    securities,
    periods,
    prices,
    operatingMetrics,
    issues,
    identitySourcesAvailable,
    identitySourceDetail: identitySourcesAvailable
      ? null
      : identitySources.issues.map((issue) => `${issue.file}: ${issue.code}`).join('; '),
    // The identity binding could not be evaluated when the identity sources are absent. `null`
    // means "not evaluated" — it is never reported as "no dependency".
    issuerIdentityState: null,
  });
}
