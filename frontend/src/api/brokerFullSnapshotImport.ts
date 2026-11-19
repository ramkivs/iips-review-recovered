/**
 * Daily full-snapshot broker import preparation (IPD PR #177/#178 partial acceptance).
 *
 * Distinct from the ordinary all-or-nothing path in `brokerHoldingsPreview.ts` /
 * `brokerImportStage4.ts`'s `prepareBrokerImport`: IPD's `persistDailySnapshot`
 * independently RE-ASSESSES identity for EVERY holding through its own governed
 * server-side resolver when a request carries `fullSnapshot: true`. This module never
 * needs — and never trusts — IRR's own client-side identity assessment to decide whether
 * a snapshot may be submitted; only IPD's server-side re-assessment decides that.
 *
 * It runs the SAME BI-03 ingress/mapping pipeline the ordinary preview uses, but with
 * `failOnUnmappedIdentity: false`, SOLELY to obtain the pipeline's own computed market
 * value, normalized weight and lineage digest for every row that passed row-level
 * validation (non-empty symbol/ISIN, positive quantity and price) — identity is never
 * asserted by this module. The published `BrokerImportHolding` wire DTO has no
 * `companyId`/`identityStatus`/`resolutionDisposition` field at all (IRR's IPC client
 * refuses to transmit the canonical-identity keys unconditionally), so whatever the
 * client-side pipeline privately believed about a row's identity never reaches the wire;
 * IPD re-derives identity independently and does not read anything IRR might claim.
 *
 * `clientIdentityPreview` is surfaced purely for the operator's INFORMATIONAL benefit
 * before they submit — a best-effort local estimate, explicitly not authoritative. The
 * authoritative resolved/unresolved split is whatever IPD's own `PARTIAL_ACCEPTANCE_REQUIRED`
 * response (or final success `snapshotState`/`unresolvedCount`) reports back.
 */
import { BrokerImportIngressOrchestrator } from '../../.cache/broker-import/frontend/src/features/portfolio/import/broker-import-ingress.js';
import { getGovernedBroadSecurityMaster } from '../../.cache/broker-import/src/identity/governed_fixture_master.js';
import type { BrokerImportHolding } from 'iips-production-market-data/portfolio-ui';
// `BrokerDailyFields` is hand-declared locally, not sourced from the newly-pinned
// `iips-broker-import` alias — see `../../server/broker-import/brokerPartialAcceptanceContract.ts`
// for why (a TypeScript Package ID collision between the two same-named npm aliases of the same
// upstream repository at different pinned commits). `BrokerImportHolding` above does not yet
// declare these fields itself, so they are intersected in below.
import type { BrokerDailyFields } from '../../server/broker-import/brokerPartialAcceptanceContract';
import type { PreparedBrokerImport } from './brokerImportStage4';

/** IRR's own non-authoritative, client-side identity estimate. Never sent over the wire. */
export interface ClientIdentityPreview {
  readonly evaluated: number;
  readonly resolved: number;
  readonly unresolved: number;
  readonly ambiguous: number;
}

export interface PreparedFullSnapshotImport extends PreparedBrokerImport {
  readonly fullSnapshot: true;
  /** IRR's own best-effort local estimate shown before submission; IPD's re-assessment governs. */
  readonly clientIdentityPreview: ClientIdentityPreview | null;
}

interface PipelineIdentitySummary {
  readonly evaluated: number;
  readonly resolved: number;
  readonly unresolved: number;
  readonly ambiguous: number;
}

/**
 * Prepares one daily full-snapshot submission from raw CSV text. Returns `null` when the file
 * cannot be parsed as a complete, valid book: a full snapshot must represent everything the
 * broker reported, so any row-level rejection (missing symbol/ISIN, non-positive quantity or
 * price — never an identity outcome, since identity never blocks preparation here) refuses
 * preparation entirely, exactly like the ordinary path's rejection check.
 */
export function prepareFullSnapshotBrokerImport(
  content: string,
  fileName: string,
  asOf: string,
): PreparedFullSnapshotImport | null {
  if (typeof content !== 'string' || typeof fileName !== 'string' || typeof asOf !== 'string'
      || !Number.isFinite(Date.parse(asOf))) return null;
  if (new TextEncoder().encode(content).byteLength > 1_048_576 || fileName.length > 256) return null;

  const result = BrokerImportIngressOrchestrator.executeIngress({
    content, fileName, asOf,
    // IPD-owned governed identity authority, used only to produce an informational local
    // estimate; IPD's own server-side resolver decides authoritatively.
    securityMaster: getGovernedBroadSecurityMaster(),
    failOnUnmappedIdentity: false,
    allowNonProductionBypass: false,
    allowPartialRejection: false,
    executionEnvironment: 'NON_PRODUCTION',
  });

  if (!result.success || result.disposition !== 'READY_FOR_PORTFOLIO_SAVE'
      || result.userHoldings.length === 0 || result.rejections.length !== 0) return null;

  const holdings: (BrokerImportHolding & BrokerDailyFields)[] = result.userHoldings.map(h => ({
    symbol: h.symbol,
    ...(h.isin ? { isin: h.isin } : {}),
    ...(h.exchange ? { exchange: h.exchange } : {}),
    quantity: h.quantity,
    averageBuyPrice: h.averageBuyPrice,
    currentPrice: h.currentPrice,
    marketValue: h.marketValue,
    weightPercentage: h.weightPercentage,
    active: h.active,
    sourceBroker: String(h.sourceBroker),
    lineageDigest: h.lineageDigest,
    // PR #177/#178 additive broker-reported daily fields, carried through verbatim.
    // `undefined` means the broker did not report the field; never substituted with 0.
    ...(h.dpQty !== undefined ? { dpQty: h.dpQty } : {}),
    ...(h.availableQty !== undefined ? { availableQty: h.availableQty } : {}),
    ...(h.profitLoss !== undefined ? { profitLoss: h.profitLoss } : {}),
    ...(h.pnlPercentage !== undefined ? { pnlPercentage: h.pnlPercentage } : {}),
  }));

  const summary = result.identitySummary as PipelineIdentitySummary | undefined;

  return {
    holdings,
    contentDigest: result.provenance.contentDigest,
    fileName: result.provenance.fileName,
    sourceBroker: String(result.provenance.sourceBroker),
    importedAt: result.provenance.asOf,
    mode: 'MERGE',
    fullSnapshot: true,
    clientIdentityPreview: summary
      ? { evaluated: summary.evaluated, resolved: summary.resolved, unresolved: summary.unresolved, ambiguous: summary.ambiguous }
      : null,
  };
}
