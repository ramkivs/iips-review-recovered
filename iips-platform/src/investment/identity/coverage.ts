/**
 * IID-1 — coverage computation over observed surfaces.
 *
 * Every observed row — holding, broker-import preview row, watchlist entry — is classified exactly once.
 * Counts are derived from the classifications, never from the upstream surfaces' own summaries: a source
 * that says "resolved" cannot make an identity resolved here.
 *
 * The report also carries the IID-0 limitations forward, visibly: which sectors have been measured,
 * how many XBRL tags are mapped, how many derivations exist, and whether the roster describes a
 * synthetic fixture. Identity coverage and financial coverage are different things and the report says
 * so in its own fields rather than in a footnote.
 */
import { DERIVATIONS } from '../fundamentals/derive';
import { XBRL_TAG_MAP } from '../ingestion/xbrl';
import type { DatasetManifest } from '../fundamentals/manifest';
import type { CoverageReport as SectorCoverageReport } from '../coverage/measure';
import { reconcileSuccessors, type SuccessorReconciliation } from './corporateActions';
import { buildBinding, reasonText, resolveIdentity, identityInputOf, type ResolveContext } from './resolver';
import {
  REASON_TEXT,
  RESOLUTION_STATES,
  type CompanyIdentityBinding,
  type IdentityObservation,
  type IdentityResolution,
  type IdentitySources,
  type ObservationSource,
  type ResolutionState,
} from './types';

export interface FinancialCoverageDisclosure {
  readonly measuredSectors: number;
  readonly totalSectors: number;
  readonly outstandingSectors: readonly string[];
  readonly usableMethods: number;
  readonly withheldMethods: number;
  readonly xbrlMappedTags: number;
  readonly derivationItems: number;
  readonly unmappedTagsObserved: readonly string[];
  readonly datasetClass: 'SYNTHETIC_FIXTURE' | 'OPERATOR_SUPPLIED' | 'NONE';
  readonly note: string;
}

export interface CoverageItem {
  readonly observationId: string;
  readonly source: ObservationSource;
  readonly portfolioId: string | null;
  readonly state: ResolutionState;
  readonly reason: string | null;
  readonly reasonText: string | null;
  readonly detail: string | null;
  readonly candidates: readonly string[];
  readonly binding: CompanyIdentityBinding;
  readonly resolution: IdentityResolution;
  /** Presentation fields, carried through untouched for display beside an unresolved state. */
  readonly displayName: string | null;
  readonly raw: Readonly<Record<string, string | number | boolean | null>>;
  readonly upstreamStatus: string | null;
}

export type StateCounts = Readonly<Record<ResolutionState, number>> & { readonly observed: number; readonly assessable: number };

export interface SourceCounts {
  readonly observed: number;
  readonly resolved: number;
  readonly unresolved: number;
  readonly assessable: number;
}

export interface IdentityCoverageReport {
  readonly reportVersion: 1;
  readonly asOf: string;
  readonly generatedAt: string;
  readonly identitySources: {
    readonly rosterVersion: string;
    readonly listingMapVersion: string;
    readonly corporateActionTableVersion: string;
    readonly rosterLabel: string;
    readonly rosterDataClass: IdentitySources['rosterDataClass'];
  };
  readonly counts: StateCounts;
  readonly bySource: Readonly<Record<ObservationSource, SourceCounts>>;
  readonly items: readonly CoverageItem[];
  readonly unresolved: readonly CoverageItem[];
  readonly successorReconciliations: readonly SuccessorReconciliation[];
  readonly financialCoverage: FinancialCoverageDisclosure;
  readonly statusLine: string;
  readonly notes: readonly string[];
}

export interface ComputeCoverageOptions {
  readonly observations: readonly IdentityObservation[];
  readonly sources: IdentitySources;
  readonly asOf: string;
  readonly generatedAt: string;
  readonly financialCoverage: FinancialCoverageDisclosure;
}

const SOURCES: readonly ObservationSource[] = ['HOLDING', 'BROKER_PREVIEW', 'WATCHLIST'];

function emptyCounts(): Record<ResolutionState, number> {
  const counts = {} as Record<ResolutionState, number>;
  for (const state of RESOLUTION_STATES) counts[state] = 0;
  return counts;
}

function financialClass(manifest: DatasetManifest | null): FinancialCoverageDisclosure['datasetClass'] {
  if (manifest === null) return 'NONE';
  return /synthetic|test-fixture|fixture/i.test(`${manifest.provider} ${manifest.licence}`)
    ? 'SYNTHETIC_FIXTURE'
    : 'OPERATOR_SUPPLIED';
}

/**
 * Disclose the IID-0 position honestly. The numbers are read from the artefacts themselves (tag map,
 * derivation set, sector measurement), so they cannot drift from the code that produced them.
 */
export function buildFinancialCoverageDisclosure(input: {
  readonly sectorReport?: SectorCoverageReport;
  readonly manifest?: DatasetManifest | null;
  readonly unmappedTagsObserved?: readonly string[];
}): FinancialCoverageDisclosure {
  const sectorReport = input.sectorReport;
  const measuredSectors = sectorReport?.completedMeasurements.length ?? 0;
  const totalSectors = sectorReport?.sectors.length ?? 0;
  const methods = sectorReport?.sectors.flatMap((sector) => sector.methods) ?? [];
  const manifest = input.manifest ?? null;
  const unmapped = [...new Set(input.unmappedTagsObserved ?? [])].sort();
  return {
    measuredSectors,
    totalSectors,
    outstandingSectors: sectorReport?.outstandingSectors ?? [],
    usableMethods: methods.filter((method) => method.state === 'AVAILABLE').length,
    withheldMethods: methods.filter((method) => method.state === 'WITHHELD').length,
    xbrlMappedTags: Object.keys(XBRL_TAG_MAP).length,
    derivationItems: DERIVATIONS.length,
    unmappedTagsObserved: unmapped,
    datasetClass: financialClass(manifest),
    note:
      'Identity coverage says whether a row has a defensible issuer/security/listing. It says nothing about whether the issuer has usable fundamentals: ' +
      `${measuredSectors} of ${totalSectors} sectors have been measured, ${Object.keys(XBRL_TAG_MAP).length} XBRL tags are mapped and ${DERIVATIONS.length} items are derivable. ` +
      'An identity-resolved security is not a covered sector.',
  };
}

/** Classify every observation and derive the counts. Deterministic for identical inputs. */
export function computeIdentityCoverage(options: ComputeCoverageOptions): IdentityCoverageReport {
  const context: ResolveContext = { sources: options.sources, asOf: options.asOf };
  const items: CoverageItem[] = options.observations
    .slice()
    .sort((a, b) => a.observationId.localeCompare(b.observationId))
    .map((observation) => {
      const resolution = resolveIdentity(identityInputOf(observation), context);
      const binding = buildBinding(observation, resolution, context);
      return {
        observationId: observation.observationId,
        source: observation.source,
        portfolioId: observation.portfolioId,
        state: resolution.state,
        reason: resolution.failure === null ? null : resolution.failure.reason,
        reasonText: reasonText(resolution.failure === null ? null : resolution.failure.reason),
        detail: resolution.failure === null ? null : resolution.failure.detail,
        candidates: resolution.failure === null ? [] : resolution.failure.candidates,
        binding,
        resolution,
        displayName: observation.displayName,
        raw: observation.raw,
        upstreamStatus: observation.upstreamStatus,
      };
    });

  const counts = emptyCounts();
  const bySource = SOURCES.reduce(
    (accumulator, source) => {
      accumulator[source] = { observed: 0, resolved: 0, unresolved: 0, assessable: 0 };
      return accumulator;
    },
    {} as Record<ObservationSource, { observed: number; resolved: number; unresolved: number; assessable: number }>,
  );
  let assessable = 0;
  for (const item of items) {
    counts[item.state] += 1;
    const bucket = bySource[item.source];
    bucket.observed += 1;
    if (item.state === 'RESOLVED') {
      bucket.resolved += 1;
      bucket.assessable += 1;
      assessable += 1;
    } else {
      bucket.unresolved += 1;
    }
  }

  // Successor reconciliation covers issuers seen in observations AND issuers with merger/demerger
  // actions: an unmapped slice is an identity-coverage fact even before anyone holds the successor.
  const observedIssuerIds = items
    .map((item) => item.resolution.issuerId)
    .filter((issuerId): issuerId is string => issuerId !== null);
  const rekeyingIssuerIds = options.sources.corporateActionTable.actions
    .filter((action) => action.type === 'MERGER' || action.type === 'DEMERGER')
    .map((action) => action.subjectIssuerId);
  const issuerIds = [...new Set([...observedIssuerIds, ...rekeyingIssuerIds])].sort();
  const successorReconciliations = issuerIds.flatMap((issuerId) =>
    reconcileSuccessors(
      options.sources.corporateActionTable,
      issuerId,
      options.sources.roster.issuers.filter((issuer) => issuer.status === 'ELIGIBLE').map((issuer) => issuer.issuerId),
    ),
  );

  const unresolved = items
    .filter((item) => item.state !== 'RESOLVED')
    .sort((a, b) => a.state.localeCompare(b.state) || a.observationId.localeCompare(b.observationId));

  const statusLine = buildStatusLine(options.observations, items);
  const notes = [
    'Resolution uses identity fields only (ISIN, exchange, symbol, series, CIN, company reference). Company names are never read by the resolver.',
    'A resolved identity is not a valuation: IID-2 onwards would produce an assessment, and is not started.',
    'Rows resolved through EXCHANGE_SYMBOL are labelled as such; a symbol is weaker evidence than an ISIN and is never presented as equivalent.',
    ...(options.sources.rosterDataClass === 'SYNTHETIC_FIXTURE'
      ? ['The roster in use is a synthetic fixture: the mechanics are verified, real-company identity coverage is not.']
      : []),
  ];

  return {
    reportVersion: 1,
    asOf: options.asOf,
    generatedAt: options.generatedAt,
    identitySources: {
      rosterVersion: options.sources.versions.rosterVersion,
      listingMapVersion: options.sources.versions.listingMapVersion,
      corporateActionTableVersion: options.sources.versions.corporateActionTableVersion,
      rosterLabel: options.sources.roster.rosterLabel,
      rosterDataClass: options.sources.rosterDataClass,
    },
    counts: { observed: items.length, assessable, ...counts },
    bySource,
    items,
    unresolved,
    successorReconciliations,
    financialCoverage: options.financialCoverage,
    statusLine,
    notes,
  };
}

/** The user-visible one-liner: "12 holdings assessed · 2 unresolved · 1 out-of-scope security". */
export function buildStatusLine(
  observations: readonly IdentityObservation[],
  items: readonly CoverageItem[],
): string {
  const holdings = observations.filter((observation) => observation.source === 'HOLDING').length;
  const assessed = items.filter((item) => item.state === 'RESOLVED').length;
  const unresolvedCount = items.filter(
    (item) =>
      item.state !== 'RESOLVED' &&
      item.state !== 'OUT_OF_SCOPE_SECURITY' &&
      item.state !== 'INELIGIBLE',
  ).length;
  const outOfScope = items.filter((item) => item.state === 'OUT_OF_SCOPE_SECURITY').length;
  const ineligible = items.filter((item) => item.state === 'INELIGIBLE').length;
  const parts = [
    `${assessed} of ${items.length} observed row${items.length === 1 ? '' : 's'} assessed`,
    `${unresolvedCount} unresolved`,
  ];
  if (holdings > 0) parts.push(`${holdings} holding${holdings === 1 ? '' : 's'} in scope`);
  if (outOfScope > 0) parts.push(`${outOfScope} out-of-scope security${outOfScope === 1 ? '' : 'ies'}`);
  if (ineligible > 0) parts.push(`${ineligible} ineligible`);
  return parts.join(' · ');
}

/** Reason text for a state, used by both renderers. */
export function stateSummaryLine(item: CoverageItem): string {
  if (item.state === 'RESOLVED') {
    const basis = item.resolution.resolutionBasis === 'ISIN' ? 'ISIN' : 'exchange symbol';
    return `resolved via ${basis} → ${item.resolution.issuerId} / ${item.resolution.securityId} / ${item.resolution.listingId}`;
  }
  return `${item.state}: ${item.reasonText ?? item.detail ?? 'no reason recorded'}`;
}

export const COVERAGE_NOTES = Object.freeze({
  identityVsFinancial:
    'Identity coverage and financial/operating-metric coverage are separate. This view reports identity only.',
  synthetic:
    'When the roster data class is SYNTHETIC_FIXTURE, the counts validate mechanics rather than real-company coverage.',
  reasons: REASON_TEXT,
});
