/**
 * IID-4 — portfolio context for a disposition, built from the EXISTING portfolio read model.
 *
 * Nothing here re-derives a portfolio. The weights, the market values and the revision come from
 * `G2PortfolioView` exactly as the user-portfolio read transport published them; this module only picks the
 * three numbers a disposition needs (this subject's weight, the issuer's exposure across securities, the
 * sector's exposure) and states, in labelled notes, what it could not measure.
 *
 * THE TWO RULES THAT MATTER:
 *
 *   1. An unmeasured weight is never 0. When the read model reports a weight sum below 100 %, the shortfall
 *      is `unmeasuredWeightPct`, not a silent zero — a zero would read as "this holding is empty" and would
 *      understate every exposure computed from it.
 *   2. A sector exposure that covers only part of the portfolio says so. `sectorMeasuredWeightPct` is the
 *      share of measured weight whose sector reference is known, so a partial sum cannot be mistaken for a
 *      complete one.
 *
 * No CSIP scoring is fabricated. The count-based fields are counts, the diversification band is `null` with
 * a note, and the sector-reference block carries no conviction/quality/risk numbers it did not receive.
 */
import type { G2HoldingView, G2PortfolioView } from '../user-portfolio/userPortfolioContract.js';
import type { PortfolioContextBlock } from '../../../iips-platform/src/investment/disposition/types';
import type { PortfolioFacts } from '../../../iips-platform/src/investment/disposition/gates';
import { missing, notComputable, notApplicable, present } from '../../../iips-platform/src/investment/contracts/observation';

const SOURCE = Object.freeze({ kind: 'DATASET' as const, ref: 'user-portfolio:view' });
const DERIVED = Object.freeze({ kind: 'DERIVED' as const, ref: 'disposition/portfolio-context' });

/** What a holding's sector/issuer resolves to, when anything does. Injected: never guessed here. */
export interface HoldingIdentity {
  readonly issuerId: string | null;
  readonly sector: string | null;
}

export type HoldingIdentityResolver = (holding: G2HoldingView) => HoldingIdentity;

export interface PortfolioContextInput {
  readonly view: G2PortfolioView;
  /** The subject this context is FOR. */
  readonly subjectSecurityId: string;
  readonly subjectIssuerId: string;
  /** Sector of the subject, from its assessment payload (never inferred from a name). */
  readonly subjectSector: string | null;
  readonly asOf: string;
  readonly resolveIdentity?: HoldingIdentityResolver;
}

export interface PortfolioContextResult {
  readonly block: PortfolioContextBlock;
  readonly facts: PortfolioFacts;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isMeasured(holding: G2HoldingView): boolean {
  return holding.active && holding.identityStatus !== 'UNRESOLVED' && Number.isFinite(holding.weightPercentage);
}

function sameSecurity(a: string, b: string): boolean {
  return a.trim().toUpperCase() === b.trim().toUpperCase();
}

export function buildPortfolioContext(input: PortfolioContextInput): PortfolioContextResult {
  const { view, subjectSecurityId, subjectIssuerId, subjectSector, asOf } = input;
  const resolve = input.resolveIdentity ?? ((): HoldingIdentity => ({ issuerId: null, sector: null }));

  const active = view.holdings.filter((holding) => holding.active);
  const measured = active.filter(isMeasured);
  const unresolved = active.filter((holding) => holding.identityStatus === 'UNRESOLVED');

  const subject = active.find((holding) => sameSecurity(holding.isin ?? '', subjectSecurityId)) ?? null;

  const measuredWeight = round2(measured.reduce((sum, holding) => sum + holding.weightPercentage, 0));
  // The shortfall is a measurement in its own right: 100 − published weight sum. When the read model already
  // accounts for every holding, the shortfall is genuinely 0 and is reported as a measured zero.
  const shortfall = round2(Math.max(0, 100 - measuredWeight));

  const companyExposure = round2(
    measured
      .filter((holding) => {
        const identity = resolve(holding);
        return identity.issuerId !== null && identity.issuerId === subjectIssuerId;
      })
      .reduce((sum, holding) => sum + holding.weightPercentage, 0),
  );

  const notes: string[] = [];
  const sectorKnown = measured.filter((holding) => resolve(holding).sector !== null);
  const sectorMeasuredWeight = round2(sectorKnown.reduce((sum, holding) => sum + holding.weightPercentage, 0));
  const sectorExposure =
    subjectSector === null
      ? null
      : round2(
          sectorKnown
            .filter((holding) => resolve(holding).sector === subjectSector)
            .reduce((sum, holding) => sum + holding.weightPercentage, 0),
        );
  if (subjectSector === null) {
    notes.push('the subject has no sector reference, so sector exposure cannot be computed for it');
  }
  if (sectorMeasuredWeight < measuredWeight) {
    notes.push(
      `sector references cover ${sectorMeasuredWeight.toFixed(2)}% of ${measuredWeight.toFixed(2)}% measured weight; ` +
        'the sector exposure below covers only the holdings whose sector is known',
    );
  }

  const counts = new Map<string, number>();
  for (const holding of sectorKnown) {
    const sector = resolve(holding).sector!;
    counts.set(sector, (counts.get(sector) ?? 0) + 1);
  }
  const totalCount = sectorKnown.length;
  const countBasedSectorExposure: Record<string, number> = {};
  for (const [sector, count] of counts) {
    countBasedSectorExposure[sector] = totalCount === 0 ? 0 : round2((count / totalCount) * 100);
  }
  const countBasedConcentrationPct =
    totalCount === 0 ? 0 : round2((Math.max(...counts.values(), 0) / totalCount) * 100);

  notes.push(
    'count-based sector exposure and concentration are holding COUNTS, not weights; they are labelled context and drive no verb',
  );
  notes.push(
    'a count-based diversification band and correlation coefficients are NOT computed in this phase: the frozen CSIP engines score holdings from normalized sector-engine outputs that a user portfolio does not carry, and no score is invented here',
  );
  if (unresolved.length > 0) {
    notes.push(
      `${unresolved.length} active holding(s) have unresolved identity and contribute ${shortfall.toFixed(2)}% of unmeasured weight`,
    );
  }
  notes.push('security-class (equity vs other) coverage is not published by the portfolio read model; out-of-scope counts are 0, not zero holdings');

  const topHolding = measured.reduce((max, holding) => Math.max(max, holding.weightPercentage), 0);

  const block: PortfolioContextBlock = Object.freeze({
    portfolioRevision: typeof view.revision === 'number' ? view.revision : null,
    asOf,
    holdingsMeasured: measured.length,
    holdingsUnresolved: unresolved.length,
    holdingsOutOfScope: 0,
    measuredWeightPct: measuredWeight,
    unmeasuredWeightPct:
      shortfall > 0
        ? present(shortfall, DERIVED, { note: '100 % minus the published weight sum; never a fabricated zero' })
        : present(0, DERIVED, { note: 'the read model accounts for every active holding' }),
    weightPct:
      subject === null
        ? missing('SCOPE_MISMATCH', { note: 'the subject is not an active holding in this portfolio' })
        : present(round2(subject.weightPercentage), SOURCE),
    companyExposurePct:
      subject === null
        ? notApplicable('SCOPE_MISMATCH', { note: 'the subject is not an active holding in this portfolio' })
        : present(companyExposure, DERIVED, { note: 'issuer exposure across every listed security of that issuer' }),
    sectorExposurePct:
      sectorExposure === null
        ? notComputable('SECTOR_METHOD_NOT_APPLICABLE', {
            note: 'the subject carries no sector reference, so no sector exposure can be attributed to it',
          })
        : present(sectorExposure, DERIVED, { note: `over holdings with a known sector (${sectorMeasuredWeight.toFixed(2)}% of weight)` }),
    sectorMeasuredWeightPct: present(sectorMeasuredWeight, DERIVED),
    topHoldingWeightPct:
      measured.length === 0
        ? notComputable('NOT_REPORTED', { note: 'the portfolio has no active, identity-resolved holding' })
        : present(round2(topHolding), DERIVED),
    concentrationBand: notComputable<'Very Low' | 'Low' | 'Moderate' | 'Good' | 'High'>('POLICY_INPUTS_UNAVAILABLE', {
      note: 'no concentration band policy is applied in this phase; the weight is reported instead',
    }),
    countBasedSectorExposure,
    countBasedConcentrationPct,
    diversificationBand: null,
    correlationFlags: [],
    sectorReferenceContext: {
      evidenceClass: 'SECTOR_REFERENCE' as const,
      sector: subjectSector as never,
      normalizedHolding: null,
      note: 'CSIP sector reference is not available for user-portfolio holdings in this phase; this block is labelled context and governs nothing',
    },
    notes,
  });

  const facts: PortfolioFacts = Object.freeze({
    present: true,
    weightPct: subject === null ? null : round2(subject.weightPercentage),
    companyExposurePct: subject === null ? null : companyExposure,
    sectorExposurePct: sectorExposure,
    topHoldingWeightPct: measured.length === 0 ? null : round2(topHolding),
  });

  return { block, facts };
}

/** The facts a candidate gets: it holds nothing, so every position measure is NOT_APPLICABLE, not 0. */
export function candidatePortfolioFacts(input: {
  readonly view: G2PortfolioView;
  readonly subjectSector: string | null;
  readonly resolveIdentity?: HoldingIdentityResolver;
}): PortfolioFacts {
  const { facts } = buildPortfolioContext({
    view: input.view,
    subjectSecurityId: '',
    subjectIssuerId: '',
    subjectSector: input.subjectSector,
    asOf: '',
    ...(input.resolveIdentity === undefined ? {} : { resolveIdentity: input.resolveIdentity }),
  });
  return Object.freeze({
    present: true,
    weightPct: 0,
    companyExposurePct: 0,
    sectorExposurePct: facts.sectorExposurePct,
    topHoldingWeightPct: facts.topHoldingWeightPct,
  });
}
