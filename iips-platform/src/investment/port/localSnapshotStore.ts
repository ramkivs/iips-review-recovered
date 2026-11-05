/**
 * IID-0 — local, read-only fundamentals snapshot store.
 *
 * Reads the operator's dataset from `${IIPS_DATA_DIR}/investment/dataset` (or an explicit directory),
 * verifies its digests, and serves it through `FundamentalsReadPort`. Read-only by construction: there is
 * no write method and no cache that could outlive the dataset it came from.
 *
 * This is the IID analogue of `frontend/server/pit/nonProductionPitStore.ts`. When ingestion ownership
 * migrates to IPD, this module is replaced by an adapter and nothing above it changes.
 */
import { resolve } from 'node:path';

import { readDataset } from '../ingestion/writer';
import { DatasetIntegrityError, DatasetMissingError } from '../fundamentals/errors';
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
import {
  FUNDAMENTALS_BOUNDARY,
  FundamentalsBoundaryError,
  type FundamentalsReadPort,
  type FundamentalsResolution,
} from './fundamentalsReadPort';

export interface LocalStoreOptions {
  /** Absolute or relative dataset directory. Defaults to `<cwd>/.iips-data/investment/dataset`. */
  readonly dataDir?: string;
  /** Overrides the data domain root (otherwise `IIPS_DATA_DIR` or `<cwd>/.iips-data`). */
  readonly dataRoot?: string;
  readonly cwd?: string;
}

/** `<dataRoot>/investment/dataset`, where dataRoot = explicit > IIPS_DATA_DIR > `<cwd>/.iips-data`. */
export function resolveDatasetDir(options: LocalStoreOptions = {}): string {
  if (options.dataDir !== undefined) return resolve(options.dataDir);
  const cwd = options.cwd ?? process.cwd();
  const dataRoot = options.dataRoot ?? process.env[FUNDAMENTALS_BOUNDARY.dataDirEnv] ?? resolve(cwd, '.iips-data');
  return resolve(dataRoot, FUNDAMENTALS_BOUNDARY.defaultSubdir, FUNDAMENTALS_BOUNDARY.datasetSubdir);
}

interface Snapshot {
  readonly manifest: DatasetManifest;
  readonly issuers: readonly IssuerRecord[];
  readonly securities: readonly SecurityRecord[];
  readonly listings: readonly ListingRecord[];
  readonly periods: readonly NormalizedPeriod[];
  readonly prices: readonly PriceRecord[];
  readonly corporateActions: readonly CorporateActionRecord[];
  readonly operatingMetrics: readonly OperatingMetricRecord[];
  readonly ingestionIssues: readonly IngestionIssue[];
  readonly byIssuerPeriods: Map<string, NormalizedPeriod[]>;
  readonly byIssuerMetrics: Map<string, OperatingMetricRecord[]>;
  readonly byIssuerActions: Map<string, CorporateActionRecord[]>;
  readonly bySecurityPrices: Map<string, PriceRecord[]>;
}

/**
 * Fields are true ECMAScript private members, so the served object exposes methods only: there is no
 * data property for a caller to mutate, and no write method at all.
 */
class LocalSnapshotStore implements FundamentalsReadPort {
  readonly #state: Snapshot;

  constructor(input: Omit<Snapshot, 'byIssuerPeriods' | 'byIssuerMetrics' | 'byIssuerActions' | 'bySecurityPrices'>) {
    const byIssuerPeriods = new Map<string, NormalizedPeriod[]>();
    const byIssuerMetrics = new Map<string, OperatingMetricRecord[]>();
    const byIssuerActions = new Map<string, CorporateActionRecord[]>();
    const bySecurityPrices = new Map<string, PriceRecord[]>();
    for (const period of input.periods) push(byIssuerPeriods, period.issuerId, period);
    for (const metric of input.operatingMetrics) push(byIssuerMetrics, metric.issuerId, metric);
    for (const action of input.corporateActions) push(byIssuerActions, action.subjectIssuerId, action);
    for (const price of input.prices) push(bySecurityPrices, price.securityId, price);
    this.#state = { ...input, byIssuerPeriods, byIssuerMetrics, byIssuerActions, bySecurityPrices };
  }

  manifest(): DatasetManifest {
    return this.#state.manifest;
  }
  listIssuers(): readonly IssuerRecord[] {
    return this.#state.issuers;
  }
  getIssuer(issuerId: string): IssuerRecord | null {
    return this.#state.issuers.find((issuer) => issuer.issuerId === issuerId) ?? null;
  }
  securitiesFor(issuerId: string): readonly SecurityRecord[] {
    return this.#state.securities.filter((security) => security.issuerId === issuerId);
  }
  listingsFor(issuerId: string): readonly ListingRecord[] {
    return this.#state.listings.filter((listing) => listing.issuerId === issuerId);
  }
  periodsFor(issuerId: string): readonly NormalizedPeriod[] {
    return this.#state.byIssuerPeriods.get(issuerId) ?? [];
  }
  pricesFor(securityId: string): readonly PriceRecord[] {
    return this.#state.bySecurityPrices.get(securityId) ?? [];
  }
  operatingMetricsFor(issuerId: string): readonly OperatingMetricRecord[] {
    return this.#state.byIssuerMetrics.get(issuerId) ?? [];
  }
  corporateActionsFor(issuerId: string): readonly CorporateActionRecord[] {
    return this.#state.byIssuerActions.get(issuerId) ?? [];
  }
  issues(): readonly IngestionIssue[] {
    return this.#state.ingestionIssues;
  }
}

function push<T>(map: Map<string, T[]>, key: string, value: T): void {
  const bucket = map.get(key);
  if (bucket === undefined) map.set(key, [value]);
  else bucket.push(value);
}

/** Open a verified local snapshot, or throw a precise boundary error. */
export function openLocalSnapshot(options: LocalStoreOptions = {}): FundamentalsReadPort {
  const dir = resolveDatasetDir(options);
  try {
    const dataset = readDataset(dir);
    const { content, manifest } = dataset;
    return new LocalSnapshotStore({
      manifest,
      issuers: content.issuers,
      securities: content.securities,
      listings: content.listings,
      periods: content.periods,
      prices: content.prices,
      corporateActions: content.corporateActions,
      operatingMetrics: content.operatingMetrics,
      ingestionIssues: content.issues,
    });
  } catch (cause) {
    if (cause instanceof DatasetMissingError || cause instanceof DatasetIntegrityError) {
      throw new FundamentalsBoundaryError(FUNDAMENTALS_BOUNDARY.blocker, { dataDir: dir, reason: cause.name }, { cause });
    }
    throw new FundamentalsBoundaryError('the fundamentals dataset could not be read', { dataDir: dir }, { cause });
  }
}

/** Fail-closed resolution: the caller gets a port, or the precise reason it has none. */
export async function resolveFundamentalsPort(options: LocalStoreOptions = {}): Promise<FundamentalsResolution> {
  const dir = resolveDatasetDir(options);
  try {
    return { available: true, port: openLocalSnapshot(options) };
  } catch (cause) {
    const reason =
      cause instanceof FundamentalsBoundaryError
        ? String((cause.detail as { reason?: string }).reason ?? cause.message)
        : 'unknown';
    return { available: false, reason, boundary: FUNDAMENTALS_BOUNDARY, dataDir: dir };
  }
}
