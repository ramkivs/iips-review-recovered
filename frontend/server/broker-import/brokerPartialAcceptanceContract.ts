/**
 * Local, hand-declared mirror of IPD's additive partial-acceptance wire types.
 *
 * RE-VERIFIED 2026-11-19 against the MERGED IPD main commit
 * `12a3d625d0ad603cb0bd9cea46bae314942ee40f` (merge commit of IPD PR #178; tree
 * `89c14d48a3ab48b772bd59a9a3903b2c4e2f278d`, byte-identical to the PR head
 * `9d03a35b4d4d79972c466c2c8e45e8c9270524d4` this file was originally copied from — so
 * no field below changed when the pin advanced).
 *
 * WHY THIS FILE STILL EXISTS, RATHER THAN IMPORTING FROM THE PACKAGE:
 *
 * This project depends on THREE npm aliases of the SAME upstream repository pinned at three
 * DIFFERENT commits: `iips-production-market-data` (the long-standing, separately-governed pin
 * this project's broker-import wire contract consumes, commit
 * `1ce6a829a7ce65550356a0071c108a60f2d813be`), `iips-broker-import` (the alias pinned to the
 * merged PR #178 commit `12a3d625d0ad603cb0bd9cea46bae314942ee40f`, consumed by the ingress/
 * mapping pipeline under `.cache/broker-import`), and `iips-np04-governed-persistence`.
 *
 * All of them declare the IDENTICAL `name`/`version` (`iips-production-market-data@1.0.0`)
 * because they really are the same published package at different commits. TypeScript's module
 * resolution computes a "Package ID" from that `name@version` alone (not from the npm alias
 * directory), so when one compilation unit imports a type from
 * `iips-broker-import/portfolio-ui` AND a type from
 * `iips-production-market-data/portfolio-ui`, TypeScript treats them as the same package and
 * coalesces the resolution, serving the OLDER package's declarations for BOTH imports.
 *
 * This was re-tested directly on 2026-11-19 after the pin advanced to merged main, and it is
 * still reproducible. `tsc --traceResolution` reports for an explicit
 * `iips-broker-import/portfolio-ui` import:
 *
 *   resolved to '…/node_modules/iips-broker-import/dist/package/src/ui/portfolio_ui_package.d.ts'
 *   with Package ID 'iips-production-market-data/dist/package/src/ui/portfolio_ui_package.d.ts@1.0.0'
 *
 * and, in a program that also imports `iips-production-market-data/portfolio-ui`, the NEW
 * import then FAILS to see the additive members:
 *
 *   error TS2305: Module '"iips-broker-import/portfolio-ui"' has no exported member
 *                 'BrokerPartialAcceptanceApproval'
 *   error TS2339: Property 'snapshotState' does not exist on type 'BrokerImportSuccess'
 *
 * The same import succeeds when the older alias is NOT in the program, which is exactly why this
 * is easy to get wrong and why the mirror is not simply deleted. Advancing
 * `iips-production-market-data`'s own separately-governed pin to the merged commit would resolve
 * the collision at the root, but that pin is independently verified by name in
 * `.ci/verify-ipd-pins.mjs` and consumed far more broadly than this one feature; changing it is a
 * materially larger, separate decision that has NOT been authorised.
 *
 * Until that decision is made, this file remains the single IRR-owned source of truth for the
 * additive partial-acceptance TYPES ONLY (no runtime code). Every shared type below was
 * field-for-field re-diffed on 2026-11-19 against IPD's published `broker_import_ipc.d.ts` at
 * `12a3d625` and is identical: `BrokerDailyFields`, `BrokerPartialAcceptanceApproval`,
 * `BrokerSnapshotUnresolvedRow`, `BrokerSnapshotAbsentHolding`,
 * `BrokerPartialAcceptanceSummary`, `BrokerSnapshotReconciliation`, and the
 * `BrokerSnapshotState` union. This confers no authority and skips no validation: every shape is
 * still independently re-checked at the untrusted IPC/HTTP boundary by
 * `brokerImportStage4.ts`'s own validators, exactly as for any other externally-sourced type.
 *
 * `BrokerImportSuccessWithSnapshot` is NOT an IPD type and has no published counterpart — it is
 * the IRR-side composition of the additive optional success fields, kept here deliberately.
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
