/**
 * IID-0 — the fundamentals read boundary.
 *
 * The ONLY way any analysis code may reach fundamental data. Shaped to sit beside the existing PIT read
 * boundary (`frontend/server/pit/pitReadPort.ts`) without duplicating it, and beside — not instead of —
 * the NP-04 persistence port, which arrives in IID-3.
 *
 * Resolution is a discriminated result, not a throw, so a composition root can answer a degraded state
 * while still reporting the precise blocker. There is no fallback implementation and no in-memory
 * substitute: a missing dataset is a missing dataset.
 */
import type { DatasetManifest } from '../fundamentals/manifest';
import type {
  CorporateActionRecord,
  IngestionIssue,
  IssuerRecord,
  ListingRecord,
  NormalizedPeriod,
  PriceRecord,
  SecurityRecord,
} from '../fundamentals/types';
import type { OperatingMetricRecord } from '../contracts/operatingMetrics';

export interface FundamentalsReadPort {
  /** Manifest of the dataset being served. Identity, coverage and freshness live here. */
  manifest(): DatasetManifest;
  listIssuers(): readonly IssuerRecord[];
  getIssuer(issuerId: string): IssuerRecord | null;
  securitiesFor(issuerId: string): readonly SecurityRecord[];
  listingsFor(issuerId: string): readonly ListingRecord[];
  periodsFor(issuerId: string): readonly NormalizedPeriod[];
  pricesFor(securityId: string): readonly PriceRecord[];
  operatingMetricsFor(issuerId: string): readonly OperatingMetricRecord[];
  corporateActionsFor(issuerId: string): readonly CorporateActionRecord[];
  issues(): readonly IngestionIssue[];
}

export const FUNDAMENTALS_BOUNDARY = Object.freeze({
  /** Environment variable that locates the local data domain. */
  dataDirEnv: 'IIPS_DATA_DIR',
  defaultSubdir: 'investment',
  datasetSubdir: 'dataset',
  manifestFile: 'manifest.json',
  blocker:
    'The investment fundamentals dataset is not present or not readable at the configured data location. No analysis is produced and no substitute dataset is used.',
});

export interface FundamentalsBoundaryErrorOptions {
  readonly cause?: unknown;
}

export class FundamentalsBoundaryError extends Error {
  declare readonly cause?: unknown;

  constructor(message: string, readonly detail: Record<string, unknown> = {}, options?: FundamentalsBoundaryErrorOptions) {
    super(message);
    if (options?.cause !== undefined) {
      Object.defineProperty(this, 'cause', { value: options.cause, enumerable: false, writable: true, configurable: true });
    }
    this.name = 'FundamentalsBoundaryError';
  }
}

export type FundamentalsResolution =
  | { readonly available: true; readonly port: FundamentalsReadPort }
  | {
      readonly available: false;
      readonly reason: string;
      readonly boundary: typeof FUNDAMENTALS_BOUNDARY;
      readonly dataDir: string;
    };
