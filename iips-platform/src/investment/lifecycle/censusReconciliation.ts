/**
 * W05 census reconciliation harness (PR #598 final targeted review, item 2 — IRR side).
 *
 * WHAT THIS IS. The deliverable of the review's item 2: the code and tests that run the ACTUAL
 * W04 revision-1 holdings through the issuer-level financial-data lifecycle and reconcile the
 * result TO THE W04 CENSUS HOLDING BY HOLDING. The operator supplies the holdings rows; this
 * module refuses to invent any of them.
 *
 * WHAT THIS IS NOT. The W04 revision-1 per-holding rows (the identities-route response — 64
 * holdings, each with its stored security identity or its absence) are NOT in this repository and
 * NOT obtainable from this sandbox (IPD read access is an external blocker; tracker
 * §16.286 limitation 3 records that the rows are in no repository). Therefore NO revision-1
 * reconciliation figure exists yet, and none is computed or claimed here. Any demonstration of
 * this harness over the 68-row published Dhan CSV census is a run over THE CSV CENSUS ONLY — D1
 * keeps the two censuses apart (W05 roadmap reconciliation §4: no record maps the rows of one onto
 * the holdings of the other) — and is never evidence about revision 1.
 *
 * D2 NUANCE, PINNED. The lifecycle's RESOLVED is NOT identity passed at W04: the resolver also
 * resolves on exchange+symbol. When the census stored NO security identity for a holding and the
 * run RESOLVED it on EXCHANGE_SYMBOL, the two stories DISAGREE and the disagreement is disclosed
 * on the face of the entry (agreement false + note), never averaged away. "0 of 64" style
 * headline numbers remain not measurements until this reconciliation actually runs over the
 * revision-1 rows.
 *
 * W05 REMAINS IN PROGRESS — NOT ACCEPTED. This harness is machinery for producing evidence; it
 * produces none until the operator feeds it the actual rows.
 */
import type { IdentityObservation, IdentitySources } from '../identity/types';
import type { QualificationPolicyConfig } from './qualification';
import {
  buildIssuerLifecycle,
  type DatasetCatalogEntry,
  type EligibleSetDesignation,
  type EligibleSetSummary,
  type IssuerLifecycleResult,
} from './issuerLifecycle';

/** One row of a persisted holdings census — the shape W04's five-category census is published in. */
export interface CensusHoldingRow {
  readonly holdingId: string;
  readonly portfolioId: string;
  readonly portfolioRevision: string;
  /** Broker symbol exactly as stored, or null when absent. Never normalised here. */
  readonly symbol: string | null;
  readonly isin: string | null;
  readonly exchange: string | null;
  readonly quantity: number | null;
  /**
   * The security identity the census STORED for this holding, or null when it stored none
   * (W04: "1 stored security identity, 63 none"). The whole point of the reconciliation.
   */
  readonly storedSecurityIdentity: string | null;
  /** W04's five-category census disposition for this row. */
  readonly category: 'QUALIFIED' | 'AMBIGUOUS' | 'MISSING_OR_UNRESOLVED' | 'EXPIRED_OR_INELIGIBLE' | 'UNAVAILABLE';
}

export interface CensusReconciliationInput {
  readonly asOf: string;
  /** The census rows as persisted — operator-supplied, never synthesised here. */
  readonly rows: readonly CensusHoldingRow[];
  readonly identitySources: IdentitySources | null;
  readonly datasets: readonly DatasetCatalogEntry[];
  /** The roadmap's eligible-set designation, when the operator supplies one. */
  readonly eligibleSet?: EligibleSetDesignation;
  readonly policy?: QualificationPolicyConfig;
}

/**
 * How the run's identity story compares with the census's stored identity for one holding.
 * BOTH_UNIDENTIFIED counts as agreement (both sides say "no identity"); every other split is a
 * disclosed disagreement.
 */
export type CensusIdentityAgreementState = 'BOTH_IDENTIFIED' | 'BOTH_UNIDENTIFIED' | 'CENSUS_ONLY' | 'RUN_ONLY';

export interface CensusIdentityAgreement {
  readonly state: CensusIdentityAgreementState;
  /** False whenever the run and the census disagree about whether this holding has an identity. */
  readonly agrees: boolean;
  readonly note: string | null;
}

export interface CensusHoldingReconciliationEntry {
  readonly holdingId: string;
  readonly portfolioId: string;
  readonly portfolioRevision: string;
  readonly quantity: number | null;
  readonly census: {
    readonly category: CensusHoldingRow['category'];
    readonly storedSecurityIdentity: string | null;
  };
  readonly run: {
    readonly disposition: 'RESOLVED' | 'UNRESOLVED' | 'EXCLUDED_FROM_E';
    readonly resolutionBasis: 'ISIN' | 'EXCHANGE_SYMBOL' | null;
    readonly issuerId: string | null;
    readonly states: readonly string[];
    /** True when the holding is in E, resolved, and its issuer has a selected dataset. */
    readonly contributesToFinancialRatioNumerator: boolean;
  };
  readonly identityAgreement: CensusIdentityAgreement;
}

export interface CensusReconciliationResult {
  readonly asOf: string;
  /** The rows exactly as supplied, for audit. */
  readonly rows: readonly CensusHoldingRow[];
  readonly entries: readonly CensusHoldingReconciliationEntry[];
  /** |E| as the run applied the designation (every supplied row when undesignated). */
  readonly eligibleSet: EligibleSetSummary;
  readonly summary: {
    readonly rowsSupplied: number;
    readonly runResolved: number;
    readonly runUnresolved: number;
    readonly excludedFromEligibleSet: number;
    readonly contributesToFinancialRatioNumerator: number;
    readonly agreement: Record<CensusIdentityAgreementState, number>;
    /** category of the census row × run disposition, for the holding-by-holding reconciliation. */
    readonly categoryByDisposition: readonly {
      readonly category: CensusHoldingRow['category'];
      readonly resolved: number;
      readonly unresolved: number;
      readonly excludedFromEligibleSet: number;
    }[];
    readonly headline: string;
  };
  readonly notes: readonly string[];
}

/** Build the lifecycle observations the harness feeds the run from the census rows, verbatim. */
export function observationsFromCensusRows(rows: readonly CensusHoldingRow[]): IdentityObservation[] {
  return rows.map((row) => ({
    observationId: row.holdingId,
    source: 'HOLDING',
    isin: row.isin,
    symbol: row.symbol,
    exchange: row.exchange,
    series: null,
    cin: null,
    companyIdHint: null,
    displayName: null,
    portfolioId: row.portfolioId,
    quantity: row.quantity,
    upstreamStatus: row.category,
    raw: {
      holdingId: row.holdingId,
      portfolioId: row.portfolioId,
      portfolioRevision: row.portfolioRevision,
      symbol: row.symbol,
      isin: row.isin,
      exchange: row.exchange,
      quantity: row.quantity,
      storedSecurityIdentity: row.storedSecurityIdentity,
      category: row.category,
    },
  }));
}

/**
 * Run the supplied census rows through the issuer-level lifecycle and reconcile each holding to
 * its census row. The run NEVER decides what the census says: the rows are consumed verbatim and
 * every disagreement between the stored identity story and the run's resolution story is itemised.
 */
export function runCensusReconciliation(input: CensusReconciliationInput): CensusReconciliationResult {
  const observations = observationsFromCensusRows(input.rows);
  const lifecycle: IssuerLifecycleResult = buildIssuerLifecycle({
    asOf: input.asOf,
    portfolios: portfolioRevisionsOf(input.rows),
    observations,
    identitySources: input.identitySources,
    datasets: input.datasets,
    ...(input.eligibleSet === undefined ? {} : { eligibleSet: input.eligibleSet }),
    ...(input.policy === undefined ? {} : { policy: input.policy }),
  });

  const excludedByObservation = new Map(lifecycle.eligibleSet.exclusions.map((entry) => [entry.observationId, entry.reason]));
  const resolvedByObservation = new Map<
    string,
    { readonly issuerId: string; readonly resolutionBasis: 'ISIN' | 'EXCHANGE_SYMBOL'; readonly states: readonly string[] }
  >();
  const contributesNumerator = new Set<string>();
  for (const row of lifecycle.issuers) {
    for (const holding of row.holdings) {
      resolvedByObservation.set(holding.observationId, {
        issuerId: row.issuerId,
        resolutionBasis: holding.resolutionBasis === 'EXCHANGE_SYMBOL' ? 'EXCHANGE_SYMBOL' : 'ISIN',
        states: row.states,
      });
      if (row.selectedDatasetVersion !== null) contributesNumerator.add(holding.observationId);
    }
  }

  const entries: CensusHoldingReconciliationEntry[] = input.rows.map((row) => {
    const excluded = excludedByObservation.has(row.holdingId);
    const resolved = resolvedByObservation.get(row.holdingId);
    const runDisposition: CensusHoldingReconciliationEntry['run']['disposition'] = excluded
      ? 'EXCLUDED_FROM_E'
      : resolved !== undefined
        ? 'RESOLVED'
        : 'UNRESOLVED';
    return {
      holdingId: row.holdingId,
      portfolioId: row.portfolioId,
      portfolioRevision: row.portfolioRevision,
      quantity: row.quantity,
      census: { category: row.category, storedSecurityIdentity: row.storedSecurityIdentity },
      run: {
        disposition: runDisposition,
        resolutionBasis: resolved?.resolutionBasis ?? null,
        issuerId: resolved?.issuerId ?? null,
        states: resolved?.states ?? [],
        contributesToFinancialRatioNumerator: !excluded && contributesNumerator.has(row.holdingId),
      },
      identityAgreement: identityAgreementOf(row, runDisposition, resolved?.resolutionBasis ?? null),
    };
  });

  const agreementCounts: Record<CensusIdentityAgreementState, number> = {
    BOTH_IDENTIFIED: 0,
    BOTH_UNIDENTIFIED: 0,
    CENSUS_ONLY: 0,
    RUN_ONLY: 0,
  };
  for (const entry of entries) agreementCounts[entry.identityAgreement.state] += 1;

  const categories: readonly CensusHoldingRow['category'][] = [
    'QUALIFIED',
    'AMBIGUOUS',
    'MISSING_OR_UNRESOLVED',
    'EXPIRED_OR_INELIGIBLE',
    'UNAVAILABLE',
  ];
  const categoryByDisposition = categories.map((category) => {
    const matching = entries.filter((entry) => entry.census.category === category);
    return {
      category,
      resolved: matching.filter((entry) => entry.run.disposition === 'RESOLVED').length,
      unresolved: matching.filter((entry) => entry.run.disposition === 'UNRESOLVED').length,
      excludedFromEligibleSet: matching.filter((entry) => entry.run.disposition === 'EXCLUDED_FROM_E').length,
    };
  });

  const notes: string[] = [];
  notes.push(
    "the run's RESOLVED is not identity passed at W04: the resolver also resolves on exchange+symbol. " +
      'Where the census stored no security identity and the run resolved on EXCHANGE_SYMBOL the two stories disagree, ' +
      'and the disagreement is itemised per holding under identityAgreement — never averaged away.',
  );
  notes.push(
    'no revision-1 reconciliation figure exists from this run unless these rows ARE the W04 revision-1 rows; ' +
      'rows from any other census (for example the 68-row published Dhan CSV census) produce results about THAT census only. ' +
      'D1 keeps the censuses apart.',
  );
  notes.push(...lifecycle.notes);

  return {
    asOf: input.asOf,
    rows: input.rows,
    entries,
    eligibleSet: lifecycle.eligibleSet,
    summary: {
      rowsSupplied: entries.length,
      runResolved: entries.filter((entry) => entry.run.disposition === 'RESOLVED').length,
      runUnresolved: entries.filter((entry) => entry.run.disposition === 'UNRESOLVED').length,
      excludedFromEligibleSet: entries.filter((entry) => entry.run.disposition === 'EXCLUDED_FROM_E').length,
      contributesToFinancialRatioNumerator: entries.filter((entry) => entry.run.contributesToFinancialRatioNumerator).length,
      agreement: agreementCounts,
      categoryByDisposition,
      headline: 'per-holding reconciliation only; no revision-1 coverage figure is asserted until the run consumes the W04 revision-1 rows',
    },
    notes,
  };
}

/** The per-portfolio revisions the rows declare — one run portfolio per distinct portfolioId. */
function portfolioRevisionsOf(rows: readonly CensusHoldingRow[]): readonly { portfolioId: string; portfolioRevision: string }[] {
  const byPortfolio = new Map<string, string>();
  for (const row of rows) {
    if (!byPortfolio.has(row.portfolioId)) byPortfolio.set(row.portfolioId, row.portfolioRevision);
  }
  return [...byPortfolio].map(([portfolioId, portfolioRevision]) => ({ portfolioId, portfolioRevision }));
}

/** The D2 comparison, per holding. Disagreement is disclosed, never resolved by this harness. */
function identityAgreementOf(
  row: CensusHoldingRow,
  disposition: CensusHoldingReconciliationEntry['run']['disposition'],
  resolutionBasis: 'ISIN' | 'EXCHANGE_SYMBOL' | null,
): CensusIdentityAgreement {
  const censusIdentified = row.storedSecurityIdentity !== null && row.storedSecurityIdentity.trim() !== '';
  const runIdentified = disposition === 'RESOLVED';
  if (censusIdentified && runIdentified) {
    return {
      state: 'BOTH_IDENTIFIED',
      agrees: true,
      note:
        'both sides identify this holding; whether they identify the SAME security is asserted only when comparable identifiers are supplied to the operator procedure, never assumed here',
    };
  }
  if (!censusIdentified && !runIdentified) {
    return { state: 'BOTH_UNIDENTIFIED', agrees: true, note: null };
  }
  if (censusIdentified && !runIdentified) {
    return {
      state: 'CENSUS_ONLY',
      agrees: false,
      note: 'the census stored a security identity for this holding but the run did not resolve it — a disclosed disagreement, not a run failure to hide',
    };
  }
  return {
    state: 'RUN_ONLY',
    agrees: false,
    note:
      `the census stored NO security identity for this holding while the run RESOLVED it on ${resolutionBasis ?? 'an unnamed basis'} ` +
      '(D2: RESOLVED is not identity passed at W04). The run reports what the census does not support — a disclosed disagreement, never a reconciliation win',
  };
}
