/**
 * IID-0 — dataset manifest and identity.
 *
 * `datasetVersion` IS the content digest. The import timestamp is recorded but excluded from identity,
 * so re-importing identical content does not mint a new dataset version (design of record Part II §R-7).
 */
import type { IssuerRecord } from './types';
import { canonicalize, digestOf, sha256Hex } from './canonical';
import type { DatasetSchema } from '../contracts/lineItems';
import type { SectorName } from '../contracts/operatingMetrics';

/** Legacy (V1) schema identifier. V2 is additive and is selected per build — see `DatasetSchema`. */
export const DATASET_SCHEMA = 'IIPS_INVESTMENT_FUNDAMENTALS_V1' as const;

/** Explicit, auditable statement of what identity covers. */
export const DIGEST_SCOPE = Object.freeze({
  included: Object.freeze([
    'issuers',
    'securities',
    'listings',
    'periods',
    'prices',
    'corporateActions',
    'operatingMetrics',
    'issues',
  ]),
  excluded: Object.freeze([
    'lastImportAt',
    'importRunId',
    'inputFileNames',
    'fileOrder',
    'fileMtimes',
    'elapsedMillis',
  ]),
});

export interface DatasetCoverage {
  readonly issuers: number;
  readonly securities: number;
  readonly listings: number;
  readonly annualPeriods: number;
  readonly quarterlyPeriods: number;
  readonly earliestPeriodEnd: string | null;
  readonly latestPeriodEnd: string | null;
  readonly operatingMetricRecords: number;
  readonly corporateActions: number;
  readonly prices: number;
}

/**
 * HOW THE OPERATOR ASSERTED THE RIGHTS TO THIS DATASET.
 *
 * A dataset is not permitted merely because it exists on the disk. `licence` is free text a
 * caller writes; `provider` is a label; neither is evidence of a right to use, retain or
 * redistribute the data. So the rights state is DECLARED EXPLICITLY and carries its own basis.
 *
 * The three states are deliberately unequal:
 *
 * - `SYNTHETIC` — the content is not real-world data. No rights question arises.
 * - `OPERATOR_ASSERTED` — the operator has stated that the use is within their authority, and
 *   has given the basis for that statement. This is the operator's own attestation, recorded so
 *   it can be audited; it is NOT an independent verification and it does not assert that any
 *   third party's rights were checked.
 * - `UNKNOWN` — no rights evidence was supplied. The dataset may be real and permitted, or real
 *   and not; nothing here says which. This is the DEFAULT, and it is the fail-closed state.
 *
 * `OPERATOR_ASSERTED` is deliberately not named "approved": an approval is a review somebody
 * performed, and no such review is recorded by the ingestion path.
 */
export const SOURCE_RIGHTS_STATES = ['SYNTHETIC', 'OPERATOR_ASSERTED', 'UNKNOWN'] as const;
export type SourceRightsState = (typeof SOURCE_RIGHTS_STATES)[number];

/**
 * The declaration itself. `basis` names where the operator's statement comes from (for example a
 * terms URL or a named agreement). An empty basis is not a statement of rights: it is the same
 * as `UNKNOWN`, and is rejected by `assertSourceRights`.
 */
export interface SourceRightsDeclaration {
  readonly state: SourceRightsState;
  /** Why the operator holds the right. Required and non-empty for `OPERATOR_ASSERTED`. */
  readonly basis: string;
  /** Free-text note, for example the exact terms consulted. Empty is fine. */
  readonly note: string;
}

/** One input file a bundle contributed, with the digest of the exact bytes the run consumed. */
export interface DatasetInputFile {
  /** Path relative to the bundle's input directory. */
  readonly name: string;
  readonly sha256: string;
}

/**
 * WHICH BUNDLE A DATASET WAS BUILT FROM (`S3-D2`).
 *
 * A dataset assembled from several input bundles must say so, per bundle, or the operator cannot later tell
 * three admitted issuers from one — which is exactly how sequential single-bundle ingestion silently reduced a
 * dataset to its last issuer. Each entry records the directory read, a digest over the files that run actually
 * consumed, and the issuers and sectors that bundle contributed.
 *
 * `inputDigest` covers only the files the ingestion path reads. It is computed from those bytes, never taken on
 * trust from a bundle's own evidence manifest, so it cannot claim a provenance the run did not consume.
 *
 * This is AUDIT metadata, not identity. `DIGEST_SCOPE.excluded` already excludes `inputFileNames`, and the same
 * reasoning applies here: where a dataset came from is not part of what it says. Recording provenance therefore
 * cannot mint a new `datasetVersion` for unchanged content, and two runs over the same content share one identity
 * whichever directories they were read from.
 */
export interface DatasetInputProvenance {
  /** The input directory this bundle was read from, as resolved by the run. */
  readonly inputDir: string;
  /** `sha256:<hex>` over the canonical list of `files` — this bundle's input-side identity. */
  readonly inputDigest: string;
  readonly files: readonly DatasetInputFile[];
  /** The issuers this bundle contributed, in roster order. */
  readonly issuerIds: readonly string[];
  /** The canonical sectors those issuers declared. */
  readonly sectors: readonly SectorName[];
}

export interface DatasetManifest {
  readonly datasetSchema: DatasetSchema;
  /** Identity. Equal to `contentDigest`; carries no timestamp. */
  readonly datasetVersion: string;
  readonly contentDigest: string;
  readonly provider: string;
  readonly licence: string;
  /**
   * The operator's rights declaration for this dataset.
   *
   * OPTIONAL on the wire, so a dataset written before this field existed still reads. It is
   * ABSENT-equals-`UNKNOWN`: an older manifest carries no rights evidence, and an older manifest
   * is therefore not permitted evidence of anything.
   */
  readonly sourceRights?: SourceRightsDeclaration;
  /**
   * The input bundles this dataset was assembled from (`S3-D2`).
   *
   * OPTIONAL on the wire, exactly like `sourceRights`: a dataset written before this field existed still reads,
   * and an absent value means the run recorded no per-bundle provenance. It is populated only when a run consumed
   * more than one input bundle. A single-bundle run leaves it absent on purpose — its provenance is already stated
   * by `sourceRights.basis`, which names the directory read, and omitting the field keeps a single-bundle manifest
   * byte-identical to the manifests already committed as evidence.
   *
   * Audit metadata, never identity: `datasetVersion` does not cover it (see `DatasetInputProvenance`).
   */
  readonly inputs?: readonly DatasetInputProvenance[];
  readonly dataAsOf: string | null;
  readonly knownAsOf: string | null;
  /** Recorded for audit only — NOT part of identity. */
  readonly lastImportAt: string;
  readonly importRunId: string;
  readonly quality: 'good' | 'stale' | 'partial' | 'unavailable';
  readonly completenessPct: number;
  readonly coverage: DatasetCoverage;
  readonly digestScope: typeof DIGEST_SCOPE;
  /** Relative path → sha256 of the exact bytes written, for tamper detection. */
  readonly files: Readonly<Record<string, string>>;
}

export interface DigestableContent {
  readonly issuers: readonly IssuerRecord[];
  readonly securities: readonly unknown[];
  readonly listings: readonly unknown[];
  readonly periods: readonly unknown[];
  readonly prices: readonly unknown[];
  readonly corporateActions: readonly unknown[];
  readonly operatingMetrics: readonly unknown[];
  readonly issues: readonly unknown[];
}

/**
 * Validate a rights declaration. A declaration that claims `OPERATOR_ASSERTED` without a basis
 * is REFUSED rather than downgraded, because silently downgrading it would hide a malformed
 * declaration behind a plausible-looking one.
 *
 * An absent declaration is `UNKNOWN`. That is the whole point: a dataset that says nothing about
 * its rights says nothing, and nothing is not permission.
 */
export function assertSourceRights(declaration: SourceRightsDeclaration | undefined | null): SourceRightsDeclaration {
  if (declaration === undefined || declaration === null) {
    return { state: 'UNKNOWN', basis: '', note: 'no rights declaration was supplied with this dataset' };
  }
  const state = declaration.state;
  if (!SOURCE_RIGHTS_STATES.includes(state)) {
    throw new Error(
      `source rights state must be one of ${SOURCE_RIGHTS_STATES.join(', ')}, received "${String(state)}"`,
    );
  }
  const basis = typeof declaration.basis === 'string' ? declaration.basis.trim() : '';
  if (state === 'OPERATOR_ASSERTED' && basis.length === 0) {
    throw new Error(
      'a source rights declaration of OPERATOR_ASSERTED must state the basis on which the operator holds the right',
    );
  }
  return {
    state,
    basis: state === 'OPERATOR_ASSERTED' ? basis : '',
    note: typeof declaration.note === 'string' ? declaration.note : '',
  };
}

/** The rights declaration of a manifest, defaulted to `UNKNOWN` when absent. */
export function sourceRightsOf(manifest: Pick<DatasetManifest, 'sourceRights'>): SourceRightsDeclaration {
  return assertSourceRights(manifest.sourceRights);
}

/** Content digest over the included members only. Deterministic and order-insensitive per member set. */
export function computeContentDigest(content: DigestableContent): string {
  const scoped: Record<string, unknown> = {};
  for (const key of DIGEST_SCOPE.included) {
    const value = (content as unknown as Record<string, unknown>)[key];
    scoped[key] = Array.isArray(value) ? sortForDigest(value) : value;
  }
  return digestOf(scoped);
}

/** Sort records by their canonical form so input ordering cannot change identity. */
function sortForDigest(values: readonly unknown[]): readonly string[] {
  return values.map((value) => canonicalize(value)).sort();
}

export function buildManifest(
  content: DigestableContent,
  options: {
    readonly provider: string;
    readonly licence: string;
    readonly now: string;
    readonly importRunId: string;
    readonly files: Readonly<Record<string, string>>;
    readonly quality?: DatasetManifest['quality'];
    /** Declared dataset schema for this build. Defaults to the legacy V1 identifier, so existing datasets do not move. */
    readonly datasetSchema?: DatasetSchema;
    /**
     * The operator's rights declaration. Omitted means `UNKNOWN` — a dataset written without it
     * carries no rights evidence, and the classification downstream reflects exactly that.
     */
    readonly sourceRights?: SourceRightsDeclaration;
    /**
     * Per-bundle provenance for a multi-input run (`S3-D2`). Omitted or empty means none is recorded, and the
     * `inputs` key is then left out of the manifest entirely.
     */
    readonly inputProvenance?: readonly DatasetInputProvenance[];
  },
): DatasetManifest {
  const contentDigest = computeContentDigest(content);
  const periods = content.periods as readonly { period: { periodType: string; periodEnd: string } }[];
  const annual = periods.filter((p) => p.period.periodType === 'ANNUAL').length;
  const quarterly = periods.filter((p) => p.period.periodType === 'QUARTER').length;
  const periodEnds = periods.map((p) => p.period.periodEnd).sort();
  const coverage: DatasetCoverage = {
    issuers: content.issuers.length,
    securities: content.securities.length,
    listings: content.listings.length,
    annualPeriods: annual,
    quarterlyPeriods: quarterly,
    earliestPeriodEnd: periodEnds.length > 0 ? periodEnds[0]! : null,
    latestPeriodEnd: periodEnds.length > 0 ? periodEnds[periodEnds.length - 1]! : null,
    operatingMetricRecords: content.operatingMetrics.length,
    corporateActions: content.corporateActions.length,
    prices: content.prices.length,
  };
  const dataAsOf = coverage.latestPeriodEnd;
  const knownAsOf = periodEnds.length > 0 ? options.now : null;
  const errorCount = (content.issues as readonly { severity: string }[]).filter(
    (issue) => issue.severity === 'ERROR',
  ).length;
  return {
    datasetSchema: options.datasetSchema ?? DATASET_SCHEMA,
    datasetVersion: contentDigest,
    contentDigest,
    provider: options.provider,
    licence: options.licence,
    // The rights declaration is validated, never inferred: an invalid declaration throws here
    // rather than reaching a reader as a plausible-looking class.
    sourceRights: assertSourceRights(options.sourceRights),
    // Written ONLY for a multi-input run. An absent or empty list omits the key entirely, so a single-bundle
    // manifest stays byte-identical to the manifests already committed as evidence (`S3-D2`, compatibility).
    ...(options.inputProvenance === undefined || options.inputProvenance.length === 0
      ? {}
      : { inputs: options.inputProvenance }),
    dataAsOf,
    knownAsOf,
    lastImportAt: options.now,
    importRunId: options.importRunId,
    quality: options.quality ?? (errorCount > 0 ? 'partial' : 'good'),
    completenessPct: completenessOf(content),
    coverage,
    digestScope: DIGEST_SCOPE,
    files: options.files,
  };
}

/** Share of the closed line-item set populated across annual periods, 1 dp. */
export function completenessOf(content: DigestableContent): number {
  const periods = content.periods as readonly { values: Record<string, unknown> }[];
  const annual = periods.filter((p) => (p as unknown as { period: { periodType: string } }).period.periodType === 'ANNUAL');
  if (annual.length === 0) return 0;
  let populated = 0;
  for (const period of annual) {
    for (const value of Object.values(period.values)) {
      const observation = value as { presence?: string; value?: unknown };
      if ((observation.presence === 'PRESENT' || observation.presence === 'IMPUTED') && observation.value !== null) {
        populated += 1;
      }
    }
  }
  const expected = annual.length * 20;
  return Math.min(100, Math.round((populated / expected) * 1000) / 10);
}

export interface IntegrityResult {
  readonly ok: boolean;
  readonly mismatches: readonly { readonly file: string; readonly expected: string; readonly actual: string }[];
  readonly digestOk: boolean;
  readonly recomputedDigest: string;
}

/** Verify both the per-file digests and the content digest. Fails closed. */
export function verifyManifest(
  manifest: DatasetManifest,
  files: Readonly<Record<string, string>>,
  content: DigestableContent,
): IntegrityResult {
  const mismatches: { file: string; expected: string; actual: string }[] = [];
  for (const [file, expected] of Object.entries(manifest.files)) {
    const actual = files[file];
    if (actual === undefined) {
      mismatches.push({ file, expected, actual: '<missing>' });
      continue;
    }
    if (actual !== expected) mismatches.push({ file, expected, actual });
  }
  const recomputedDigest = computeContentDigest(content);
  return {
    ok: mismatches.length === 0 && recomputedDigest === manifest.contentDigest,
    mismatches,
    digestOk: recomputedDigest === manifest.contentDigest,
    recomputedDigest,
  };
}

export function sha256OfText(text: string): string {
  return sha256Hex(text);
}
