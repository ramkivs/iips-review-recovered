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
