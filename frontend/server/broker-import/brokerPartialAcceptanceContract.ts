/**
 * Local, hand-declared mirror of IPD PR #177/#178's additive partial-acceptance wire types.
 *
 * WHY THIS FILE EXISTS, RATHER THAN IMPORTING FROM A PACKAGE:
 *
 * This project depends on TWO npm aliases of the SAME upstream repository pinned at TWO
 * DIFFERENT commits: `iips-production-market-data` (the long-standing, separately-governed pin
 * this project's broker-import wire contract already consumes, commit
 * `1ce6a829a7ce65550356a0071c108a60f2d813be`) and `iips-broker-import` (the alias newly pinned
 * to the PR #178 commit `9d03a35b4d4d79972c466c2c8e45e8c9270524d4`, consumed by the ingress/
 * mapping pipeline under `.cache/broker-import`). Both packages' own `package.json` declare the
 * IDENTICAL `name`/`version` (`iips-production-market-data@1.0.0`) because they really are the
 * same published package at two different commits. TypeScript's module resolution treats that
 * identical `name@version` as ONE "Package ID" and silently coalesces the two — importing a type
 * from `iips-broker-import/portfolio-ui` in the same compilation unit as a type from
 * `iips-production-market-data/portfolio-ui` resolves BOTH to whichever copy's declaration file
 * TypeScript's resolution cache populated first, non-deterministically serving the OLD package's
 * (pre-#178) declarations even for an explicit `iips-broker-import` import. Verified directly
 * with `tsc --traceResolution`: the reported Package ID for a from `iips-broker-import/portfolio-ui`
 * import is `iips-production-market-data/dist/package/src/ui/portfolio_ui_package.d.ts@1.0.0`.
 *
 * Advancing `iips-production-market-data`'s own separately-governed pin to the #178 commit would
 * resolve this cleanly, but that pin is deliberately independent (see `.ci/verify-ipd-pins.mjs`)
 * and used far more broadly than this one feature; changing it is a materially larger, separate
 * decision outside the scope authorized so far.
 *
 * Until that decision is made, this file is the single IRR-owned source of truth for the
 * additive partial-acceptance TYPES ONLY (no runtime code). Every field below is copied
 * VERBATIM from IPD's published `broker_import_ipc.d.ts` at commit
 * `9d03a35b4d4d79972c466c2c8e45e8c9270524d4` (diffed against the pinned
 * `iips-production-market-data` package to confirm the base contract is unchanged — only these
 * fields are additive). This confers no authority and skips no validation: every shape is still
 * independently re-checked at the untrusted IPC/HTTP boundary by
 * `brokerImportStage4.ts`'s own validators, exactly as for any other externally-sourced type.
 */

/** The four broker-reported daily fields carried by the Dhan detailed export. */
export interface BrokerDailyFields {
  readonly dpQty?: number | null;
  readonly availableQty?: number | null;
  readonly profitLoss?: number | null;
  readonly pnlPercentage?: number | null;
}

/**
 * Explicit confirmation that a partially resolvable snapshot may be persisted.
 *
 * The operator sees the totals, the resolved and unresolved rows with their original
 * identifiers and exact refusal reasons, and approves THAT summary. The approval is bound to the
 * summary digest so an approval cannot be replayed against a different set of rows.
 */
export interface BrokerPartialAcceptanceApproval {
  readonly approved: true;
  readonly approvedAt: string;
  readonly approvedBy: string;
  /** Digest of the exact partial-acceptance summary the operator saw. */
  readonly summaryDigest: string;
}

/** One row the snapshot could not resolve when the operator approved a partial import. */
export interface BrokerSnapshotUnresolvedRow extends BrokerDailyFields {
  readonly symbol: string;
  readonly isin?: string;
  readonly exchange?: 'NSE' | 'BSE';
  readonly series?: string;
  readonly quantity: number;
  readonly averageBuyPrice: number;
  readonly currentPrice: number;
  readonly marketValue: number;
  readonly sourceBroker: string;
  readonly lineageDigest: string;
  /** The exact reason identity qualification failed. Never a generic message. */
  readonly reason: string;
  readonly sourceRevision?: string;
}

/** A holding the latest snapshot did not mention; carried forward, not dropped. */
export interface BrokerSnapshotAbsentHolding {
  readonly symbol: string;
  readonly quantity: number;
  readonly marketValue: number;
  readonly reason: 'ABSENT_FROM_LATEST_SNAPSHOT';
}

/** What the caller must show before it may ask for partial acceptance. */
export interface BrokerPartialAcceptanceSummary {
  readonly importId: string;
  readonly totalRows: number;
  readonly resolvedCount: number;
  readonly unresolvedCount: number;
  readonly resolvedMarketValue: number;
  readonly refusedHoldings: readonly BrokerSnapshotUnresolvedRow[];
  readonly duplicateSymbols: readonly { readonly symbol: string; readonly occurrences: number }[];
  readonly summaryDigest: string;
}

export type BrokerSnapshotState = 'ACCEPTED' | 'PARTIALLY_ACCEPTED';

/** Explicit reconciliation report attached to a committed snapshot. */
export interface BrokerSnapshotReconciliation {
  readonly observed: number;
  readonly exitedZeroQuantity: number;
  readonly carriedForwardAbsent: number;
  readonly unresolved: number;
  readonly stale: boolean;
  readonly complete: boolean;
  readonly totalMarketValue: number;
  readonly absent: readonly BrokerSnapshotAbsentHolding[];
}

/**
 * `BrokerImportSuccess` (from the pinned `iips-production-market-data` package) extended with
 * the three additive fields IPD's success result carries ONLY for a daily-snapshot import. All
 * three are optional and shape-checked when present by `interpretStage4Result`; their absence is
 * the unchanged ordinary (non-snapshot) success shape.
 */
export interface BrokerImportSuccessWithSnapshot {
  readonly importId?: string;
  readonly snapshotState?: BrokerSnapshotState;
  readonly unresolvedCount?: number;
  readonly reconciliation?: BrokerSnapshotReconciliation;
}
