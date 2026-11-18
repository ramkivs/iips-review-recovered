/**
 * W05-A — the reusable issuer-level financial-data lifecycle.
 *
 * WHAT THIS MODULE DOES. Given portfolio holdings (identity observations), the established
 * security-to-issuer mapping and a catalog of available financial datasets, it produces, per
 * DISTINCT ISSUER:
 *
 *   1. the issuer, identified through the established identity resolver — never by name;
 *   2. whether an appropriate dataset already exists for that issuer;
 *   3. which existing dataset is REUSED when its issuer, reporting basis, periods, source rights
 *      and qualification remain suitable — one dataset per issuer, so the same issuer appearing in
 *      many holdings and portfolios never multiplies datasets;
 *   4. the missing or insufficient coverage, recorded DISTINCTLY (missing, stale, incomplete,
 *      rights-unknown, rights-restricted, unavailable) without blocking portfolio creation or
 *      ordinary portfolio use;
 *   5. a provisioning request for a missing issuer dataset through the AUTHORIZED acquisition
 *      process (the existing ingestion CLI with its authorization-record mechanism) — never
 *      automated retrieval, which the W05 assessment rules out;
 *   6. the link from dataset coverage back to every holding and portfolio revision that needs it.
 *
 * WHAT IT NEVER DOES. It never throws because data is missing, never gates portfolio creation or
 * use on financial coverage, never invents financial values, never converts missing values into
 * zero, and never treats a provider name or an operator assertion as independent permission.
 * Unknown rights fail closed. Datasets provision PROGRESSIVELY: a portfolio — including one with
 * more than 200 holdings — is fully supported with any subset of its issuers covered.
 *
 * REUSE, NOT REIMPLEMENTATION. Identity resolution is `identity/resolver.ts`; per-issuer dataset
 * assessment is `lifecycle/qualification.ts` (which itself reuses the period, freshness,
 * completeness and quality machinery); rights are `lifecycle/rightsRecord.ts` over the existing
 * manifest declaration. Dataset file verification is `readDataset`'s fail-closed digest check.
 */
import { readDataset } from '../ingestion/writer';
import { DatasetIntegrityError, DatasetMissingError } from '../fundamentals/errors';
import { assertSourceRights, type SourceRightsDeclaration } from '../fundamentals/manifest';
import type { DatasetSchema } from '../contracts/lineItems';
import type { IngestionIssue, NormalizedPeriod } from '../fundamentals/types';
import type { IdentityObservation, IdentitySources } from '../identity/types';
import { identityInputOf, resolveIdentity } from '../identity/resolver';
import type { FundamentalsReadPort } from '../port/fundamentalsReadPort';
import {
  buildRightsRecord,
  rightsRecordFromManifest,
  type DatasetRightsRecord,
} from './rightsRecord';
import {
  qualifyIssuerDataset,
  DEFAULT_QUALIFICATION_POLICY,
  type IssuerDatasetQualification,
  type QualificationPolicyConfig,
} from './qualification';

/* ------------------------------------------------------------------ catalog */

/** The dataset identity fields the lifecycle needs. `DatasetManifest` satisfies this structurally. */
export interface DatasetSourceRecord {
  readonly datasetVersion: string;
  readonly datasetSchema: DatasetSchema;
  readonly provider: string;
  readonly licence: string;
  readonly sourceRights?: SourceRightsDeclaration;
  readonly importRunId: string;
  readonly lastImportAt: string;
  readonly dataAsOf: string | null;
  readonly knownAsOf: string | null;
}

/**
 * One dataset in the catalog: which issuers it covers, their periods, and how it stands on rights
 * and integrity. Entries are plain records — the lifecycle holds no store and no cache.
 */
export interface DatasetCatalogEntry {
  readonly dataset: DatasetSourceRecord;
  /** Where this entry came from (a dataset directory, a read port, a test fixture). Disclosure only. */
  readonly sourceLabel: string;
  readonly integrity: { readonly ok: boolean; readonly detail: string | null };
  /**
   * The rights record for this dataset. Omitted means "derive from the manifest declaration",
   * which yields status UNKNOWN unless the declaration is SYNTHETIC — the fail-closed default.
   */
  readonly rights?: DatasetRightsRecord;
  readonly issuers: readonly {
    readonly issuerId: string;
    readonly periods: readonly NormalizedPeriod[];
  }[];
  readonly issues?: readonly IngestionIssue[];
}

/** Adapt a verified read port into a catalog entry. The port has already verified every digest. */
export function catalogEntryFromReadPort(port: FundamentalsReadPort, sourceLabel: string): DatasetCatalogEntry {
  const manifest = port.manifest();
  return {
    dataset: {
      datasetVersion: manifest.datasetVersion,
      datasetSchema: manifest.datasetSchema,
      provider: manifest.provider,
      licence: manifest.licence,
      ...(manifest.sourceRights === undefined ? {} : { sourceRights: manifest.sourceRights }),
      importRunId: manifest.importRunId,
      lastImportAt: manifest.lastImportAt,
      dataAsOf: manifest.dataAsOf,
      knownAsOf: manifest.knownAsOf,
    },
    sourceLabel,
    integrity: { ok: true, detail: null },
    issuers: port.listIssuers().map((issuer) => ({
      issuerId: issuer.issuerId,
      periods: port.periodsFor(issuer.issuerId),
    })),
    issues: port.issues(),
  };
}

export type CatalogReadResult =
  | { readonly ok: true; readonly entry: DatasetCatalogEntry }
  | { readonly ok: false; readonly sourceLabel: string; readonly error: string; readonly errorName: string };

/**
 * Read a dataset directory into a catalog entry. A missing or tampered dataset is NOT repaired and
 * NOT partially read: the digests are verified by `readDataset`, and a failure comes back as
 * `ok: false` naming the error — the lifecycle records it as unavailable and moves on.
 */
export function tryCatalogEntryFromDatasetDir(dir: string, sourceLabel: string = dir): CatalogReadResult {
  try {
    const read = readDataset(dir);
    return {
      ok: true,
      entry: {
        dataset: {
          datasetVersion: read.manifest.datasetVersion,
          datasetSchema: read.manifest.datasetSchema,
          provider: read.manifest.provider,
          licence: read.manifest.licence,
          ...(read.manifest.sourceRights === undefined ? {} : { sourceRights: read.manifest.sourceRights }),
          importRunId: read.manifest.importRunId,
          lastImportAt: read.manifest.lastImportAt,
          dataAsOf: read.manifest.dataAsOf,
          knownAsOf: read.manifest.knownAsOf,
        },
        sourceLabel,
        integrity: { ok: true, detail: null },
        issuers: read.content.issuers.map((issuer) => ({
          issuerId: issuer.issuerId,
          periods: read.content.periods.filter((period) => period.issuerId === issuer.issuerId),
        })),
        issues: read.content.issues,
      },
    };
  } catch (cause) {
    if (cause instanceof DatasetMissingError || cause instanceof DatasetIntegrityError) {
      return { ok: false, sourceLabel, error: cause.message, errorName: cause.name };
    }
    throw cause;
  }
}

/* ------------------------------------------------------------------ holdings */

export interface LifecyclePortfolio {
  readonly portfolioId: string;
  /** The portfolio revision these holdings belong to. Coverage is linked back to it. */
  readonly portfolioRevision: string;
}

export interface HoldingReference {
  readonly observationId: string;
  readonly portfolioId: string;
  readonly portfolioRevision: string;
  readonly securityId: string | null;
  readonly quantity: number | null;
}

export type IssuerCoverageState =
  | 'SUITABLE'
  | 'MISSING'
  | 'STALE'
  | 'INCOMPLETE'
  | 'RIGHTS_UNKNOWN'
  | 'RIGHTS_RESTRICTED'
  | 'UNAVAILABLE';

/** Why a holding could not be attached to an issuer. Recorded, never silently dropped. */
export interface UnresolvedHolding {
  readonly observationId: string;
  readonly portfolioId: string;
  readonly portfolioRevision: string;
  readonly state: string;
  readonly reason: string | null;
  readonly detail: string | null;
}

export interface IssuerDatasetCandidate {
  readonly datasetVersion: string;
  readonly sourceLabel: string;
  readonly states: readonly IssuerCoverageState[];
  readonly qualification: IssuerDatasetQualification;
}

/**
 * A provisioning request for an issuer whose coverage is missing or insufficient.
 *
 * The acquisition process is the EXISTING authorized path — the operator prepares an input bundle
 * under the W05 source restrictions and runs the ingestion CLI with an authorization record
 * (`cli/ingest.ts --authorization-record`). There is no automated exchange retrieval here and none
 * may be added: the W05 assessment rules out scripted retrieval.
 */
export interface ProvisioningRequest {
  readonly requestId: string;
  readonly issuerId: string;
  readonly issuerKeyBasis: 'CIN' | 'EQUITY_ISIN' | null;
  readonly gap: readonly IssuerCoverageState[];
  readonly requestedPeriods: { readonly annual: number; readonly quarterly: number };
  readonly reportingBasis: 'CONSOLIDATED';
  readonly acquisitionProcess: 'AUTHORIZED_MANUAL_INGESTION';
  readonly acquisitionNote: string;
  readonly rightsRequirement: string;
  readonly status: 'REQUESTED';
  readonly createdAt: string;
}

export interface IssuerCoverageRow {
  readonly issuerId: string;
  readonly holdings: readonly HoldingReference[];
  /** Every distinct state that applies. SUITABLE + STALE means "a suitable one exists, a stale one also exists". */
  readonly states: readonly IssuerCoverageState[];
  /** The single dataset REUSED for this issuer across all its holdings and portfolios, if suitable. */
  readonly selectedDatasetVersion: string | null;
  readonly candidates: readonly IssuerDatasetCandidate[];
  readonly qualification: IssuerDatasetQualification | null;
  readonly provisioning: ProvisioningRequest | null;
}

export interface IssuerLifecycleResult {
  readonly asOf: string;
  readonly issuers: readonly IssuerCoverageRow[];
  readonly unresolved: readonly UnresolvedHolding[];
  /** Every holding reference considered (resolved and unresolved). */
  readonly totalHoldings: number;
  /** Holdings that resolved to an eligible issuer. */
  readonly eligibleHoldings: number;
  /** Distinct issuers the eligible holdings resolve to. */
  readonly distinctIssuers: number;
  readonly policy: QualificationPolicyConfig;
  readonly notes: readonly string[];
}

export interface IssuerLifecycleInput {
  readonly asOf: string;
  readonly portfolios: readonly LifecyclePortfolio[];
  readonly observations: readonly IdentityObservation[];
  /** The established security-to-issuer mapping. `null` means identity cannot be resolved — disclosed, never guessed. */
  readonly identitySources: IdentitySources | null;
  readonly datasets: readonly DatasetCatalogEntry[];
  readonly policy?: QualificationPolicyConfig;
}

/* ------------------------------------------------------------------ lifecycle */

function issuerKeyBasisOf(issuerId: string): 'CIN' | 'EQUITY_ISIN' | null {
  if (issuerId.startsWith('IN:CIN:')) return 'CIN';
  if (issuerId.startsWith('IN:EQISIN:')) return 'EQUITY_ISIN';
  return null;
}

/** Candidate states, derived from the qualification gates. Order is stable; every state is listed. */
function statesOf(qualification: IssuerDatasetQualification): IssuerCoverageState[] {
  const states: IssuerCoverageState[] = [];
  const rightsStatus = qualification.evidence.rights.status;
  if (!qualification.evidence.integrity.ok) states.push('UNAVAILABLE');
  if (rightsStatus === 'UNKNOWN') states.push('RIGHTS_UNKNOWN');
  else if (rightsStatus === 'RESTRICTED') states.push('RIGHTS_RESTRICTED');
  if (qualification.freshness.status === 'STALE') states.push('STALE');
  if (
    qualification.periodsCovered.annual.length === 0 ||
    qualification.completeness.adequacy !== 'SUFFICIENT' ||
    qualification.freshness.status === 'UNKNOWN'
  ) {
    states.push('INCOMPLETE');
  }
  if (states.length === 0) states.push('SUITABLE');
  return states;
}

const PRIMARY_PRECEDENCE: readonly IssuerCoverageState[] = Object.freeze([
  'UNAVAILABLE',
  'RIGHTS_RESTRICTED',
  'RIGHTS_UNKNOWN',
  'STALE',
  'INCOMPLETE',
  'MISSING',
  'SUITABLE',
]);

function primaryStateOf(states: readonly IssuerCoverageState[]): IssuerCoverageState {
  return PRIMARY_PRECEDENCE.find((state) => states.includes(state)) ?? 'MISSING';
}

function provisioningRequestFor(
  issuerId: string,
  gap: readonly IssuerCoverageState[],
  asOf: string,
  policy: QualificationPolicyConfig,
): ProvisioningRequest {
  return {
    requestId: `provision:${issuerId}:${asOf.slice(0, 10)}`,
    issuerId,
    issuerKeyBasis: issuerKeyBasisOf(issuerId),
    gap: [...gap],
    requestedPeriods: {
      annual: policy.adequacy.minimumAnnualPeriods,
      quarterly: 4,
    },
    reportingBasis: 'CONSOLIDATED',
    acquisitionProcess: 'AUTHORIZED_MANUAL_INGESTION',
    acquisitionNote:
      'the operator prepares an input bundle under the W05 source restrictions and provisions it through the existing ingestion CLI with an authorization record (cli/ingest.ts --authorization-record). No automated exchange retrieval is performed or permitted.',
    rightsRequirement:
      'the provisioned dataset must carry source-rights evidence (lifecycle/rightsRecord.ts); unknown or unsupported rights fail closed and the dataset will not qualify.',
    status: 'REQUESTED',
    createdAt: asOf.slice(0, 10),
  };
}

/**
 * Run the issuer-level lifecycle. This function is TOTAL over its inputs: a missing dataset, a
 * failed integrity check or an unresolvable holding is reported in its own named state and the
 * run continues. It never blocks portfolio creation or ordinary portfolio use.
 */
export function buildIssuerLifecycle(input: IssuerLifecycleInput): IssuerLifecycleResult {
  const asOf = input.asOf.slice(0, 10);
  const policy = input.policy ?? DEFAULT_QUALIFICATION_POLICY;
  const revisionByPortfolio = new Map(input.portfolios.map((portfolio) => [portfolio.portfolioId, portfolio.portfolioRevision]));

  const notes: string[] = [];
  const unresolved: UnresolvedHolding[] = [];
  const holdingsByIssuer = new Map<string, HoldingReference[]>();

  for (const observation of input.observations) {
    const portfolioRevision = revisionByPortfolio.get(observation.portfolioId ?? '') ?? '';
    if (input.identitySources === null) {
      unresolved.push({
        observationId: observation.observationId,
        portfolioId: observation.portfolioId ?? '',
        portfolioRevision,
        state: 'UNMATCHED',
        reason: 'NO_IDENTIFIER_PROVIDED',
        detail: 'identity sources are not loaded, so no security-to-issuer mapping is available; the holding is recorded as unresolved, never guessed',
      });
      continue;
    }
    const resolution = resolveIdentity(identityInputOf(observation), { sources: input.identitySources, asOf });
    if (resolution.state !== 'RESOLVED' || resolution.issuerId === null) {
      unresolved.push({
        observationId: observation.observationId,
        portfolioId: observation.portfolioId ?? '',
        portfolioRevision,
        state: resolution.state,
        reason: resolution.failure?.reason ?? null,
        detail: resolution.failure?.detail ?? null,
      });
      continue;
    }
    const bucket = holdingsByIssuer.get(resolution.issuerId);
    const reference: HoldingReference = {
      observationId: observation.observationId,
      portfolioId: observation.portfolioId ?? '',
      portfolioRevision,
      securityId: resolution.securityId,
      quantity: observation.quantity,
    };
    if (bucket === undefined) holdingsByIssuer.set(resolution.issuerId, [reference]);
    else bucket.push(reference);
  }

  const rows: IssuerCoverageRow[] = [];
  for (const [issuerId, holdings] of [...holdingsByIssuer.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const candidates: IssuerDatasetCandidate[] = [];
    for (const entry of input.datasets) {
      const coverage = entry.issuers.find((candidate) => candidate.issuerId === issuerId);
      if (coverage === undefined) continue;

      // A rights record whose declaration disagrees with the dataset's own manifest is inconsistent
      // evidence: it fails closed and cannot produce a suitable candidate.
      let rights: DatasetRightsRecord;
      try {
        const declared = assertSourceRights(entry.dataset.sourceRights);
        if (entry.rights !== undefined && entry.rights.manifestRightsState !== declared.state) {
          throw new Error(
            `rights record claims declaration state ${entry.rights.manifestRightsState} but the dataset manifest declares ${declared.state}`,
          );
        }
        rights = entry.rights ?? rightsRecordFromManifest(entry.dataset.sourceRights, asOf);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause);
        candidates.push({
          datasetVersion: entry.dataset.datasetVersion,
          sourceLabel: entry.sourceLabel,
          states: ['RIGHTS_UNKNOWN'],
          qualification: qualifyIssuerDataset({
            dataset: entry.dataset,
            issuerId,
            periods: coverage.periods,
            issues: entry.issues ?? [],
            integrity: entry.integrity,
            rights: {
              manifestRightsState: 'UNKNOWN',
              datasetClass: 'UNKNOWN',
              status: 'UNKNOWN',
              statusReason: `the rights record is inconsistent with the dataset manifest and fails closed: ${message}`,
            },
            asOf,
            policy,
          }),
        });
        continue;
      }

      const qualification = qualifyIssuerDataset({
        dataset: entry.dataset,
        issuerId,
        periods: coverage.periods,
        issues: entry.issues ?? [],
        integrity: entry.integrity,
        rights: {
          manifestRightsState: rights.manifestRightsState,
          datasetClass: rights.datasetClass,
          status: rights.status,
          statusReason: rights.statusReason,
        },
        asOf,
        policy,
      });
      candidates.push({
        datasetVersion: entry.dataset.datasetVersion,
        sourceLabel: entry.sourceLabel,
        states: statesOf(qualification),
        qualification,
      });
    }

    const allStates: IssuerCoverageState[] = [...new Set(candidates.flatMap((candidate) => candidate.states))];
    const suitable = candidates
      .filter((candidate) => candidate.states.includes('SUITABLE'))
      .sort((a, b) => (a.datasetVersion < b.datasetVersion ? -1 : 1));
    const selected = suitable[0] ?? null;

    // The row records each distinct state. 'MISSING' and 'SUITABLE' are never mixed: a suitable
    // candidate means a dataset exists, so 'MISSING' would be false.
    const states: IssuerCoverageState[] = [];
    if (selected !== null) {
      states.push('SUITABLE');
      for (const state of allStates) if (state !== 'MISSING') states.push(state);
    } else if (allStates.length > 0) {
      states.push(...allStates);
    } else {
      states.push('MISSING');
    }
    const primary = primaryStateOf(states);

    const provisioning =
      selected === null
        ? provisioningRequestFor(
            issuerId,
            states.includes('MISSING') || states.length === 0
              ? (['MISSING'] as IssuerCoverageState[])
              : states.filter((state) => state !== 'MISSING'),
            asOf,
            policy,
          )
        : null;

    rows.push({
      issuerId,
      holdings,
      states: [...new Set([...states, primary])],
      selectedDatasetVersion: selected?.datasetVersion ?? null,
      candidates,
      qualification: selected?.qualification ?? candidates[0]?.qualification ?? null,
      provisioning,
    });
  }

  const eligibleHoldings = rows.reduce((total, row) => total + row.holdings.length, 0);
  if (unresolved.length > 0) {
    notes.push(
      `${unresolved.length} holding(s) could not be resolved to an issuer through the established mapping and are excluded from issuer denominators; they are listed individually under "unresolved".`,
    );
  }
  if (rows.some((row) => row.provisioning !== null)) {
    notes.push(
      'missing or insufficient issuer coverage is reported as a provisioning request; it never blocks portfolio creation or ordinary portfolio use.',
    );
  }

  return {
    asOf,
    issuers: rows,
    unresolved,
    totalHoldings: input.observations.length,
    eligibleHoldings,
    distinctIssuers: rows.length,
    policy,
    notes,
  };
}

/* ------------------------------------------------------------------ helper */

/** Build a rights record for a catalog entry from full evidence, refusing inconsistent input. */
export function rightsRecordForEntry(
  entry: Pick<DatasetCatalogEntry, 'dataset'>,
  evidence: Parameters<typeof buildRightsRecord>[0]['evidence'],
  permissions: Parameters<typeof buildRightsRecord>[0]['permissions'],
  asOf: string,
): DatasetRightsRecord {
  return buildRightsRecord(
    {
      manifestRights: entry.dataset.sourceRights,
      evidence,
      permissions,
    },
    asOf,
  );
}
