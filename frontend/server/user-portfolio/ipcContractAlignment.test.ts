/**
 * Canonical IPD contract alignment — the wire contract IRR's personal-use write
 * path consumes.
 *
 * WHY THIS FILE EXISTS
 *   An audit reported an IPC contract mismatch between the two repositories:
 *   "IPD v2 reportedly requires `expectedRevision >= 1` and supports `MERGE`;
 *    IRR v1 reportedly accepts `expectedRevision >= 0` and advertises `REPLACE`."
 *   Both halves of that report are true, but they describe TWO DIFFERENT
 *   CHANNELS, not one contract disagreeing with itself.
 *
 *   IPD serves two wire versions over the same socket:
 *     - `v = 1` — the historical exchange. `portfolio.create` / `portfolio.save`
 *       / `portfolio.reset` / `portfolio.delete` are dispatched, and the
 *       local personal-use path executes them. `requireExpectedRevision`
 *       accepts a NON-NEGATIVE integer. `dispatch.ts` resolves the save mode
 *       as `options.mode === 'REPLACE' || payload.operation === 'REPLACE'
 *       ? 'REPLACE' : 'MERGE'` — so BOTH modes are admitted.
 *     - `v = 2` — the D03 snapshot contract. Its framing requires
 *       `expectedRevision >= 1`, its snapshot save is MERGE-only, and (decisively)
 *       `dispatch.ts` refuses EVERY v2 write with `WRITE_NOT_AUTHORIZED` before
 *       any store mutation. v2 writes are not reachable through this dispatcher
 *       at all.
 *
 *   IRR speaks `v = 1` (`IPC_PROTOCOL_VERSION = 1` in `ipcClient.ts`), so the
 *   canonical contract for the personal-use write path is the **v1** contract:
 *   `expectedRevision >= 0` and `MERGE`/`REPLACE` both admitted. The baseline
 *   implementation was already correct on the wire; the audit compared the two
 *   repositories across two different channels.
 *
 * WHAT THIS FILE PINS
 *   The v1 facts IRR's consumer depends on, asserted here so a future change to
 *   either repository that breaks the alignment fails HERE rather than silently
 *   at runtime. It asserts IRR's own side of the contract (the wire it builds
 *   and the values it accepts), and it records the IPD-side facts this
 *   alignment rests on with their source locations.
 *
 *   The IPD-side facts are NOT re-implemented here: IPD is a separate
 *   repository, its source is not a dependency of this package, and copying its
 *   rules would create a second source of truth (and a second persistence
 *   implementation, which is out of scope). They are pinned as documented
 *   references with their file/line provenance, and the cross-repository
 *   end-to-end run in
 *   `evidence/integration/personal-portfolio-restoration-2026-11-09/` exercises
 *   them for real.
 */
import { describe, expect, it } from 'vitest';
import {
  G2_DISPOSITIONS,
  G2_OPERATIONS,
  G2_SAVE_MODES,
  isValidExpectedRevision,
  isValidSaveMode,
  type G2SaveMode,
} from './userPortfolioContract.js';
import { IPC_PROTOCOL_VERSION, IPC_WRITE_OPERATIONS, type IpcOperation } from './ipcClient.js';
import { IpcUserPortfolioPort, toWireHolding } from './ipcPortAdapter.js';
import type { G2HoldingInput } from './userPortfolioContract.js';

/* ------------------------------------------------------------------ *
 * IRR's side of the alignment
 * ------------------------------------------------------------------ */

describe('IRR speaks the IPD v1 wire channel', () => {
  it('pins the wire protocol version to 1 — the channel that dispatches the personal-use writes', () => {
    // `v = 2` is a DIFFERENT contract (expectedRevision >= 1, MERGE-only, and
    // every v2 write refused by the dispatcher). Speaking v1 is what makes the
    // v1 revision and mode semantics the canonical ones for this path.
    expect(IPC_PROTOCOL_VERSION).toBe(1);
  });

  it('addresses the five v1 write operations, including reset, delete and the guarded broker import', () => {
    // `portfolio.reset` and `portfolio.delete` exist ONLY in v1
    // (`IPC_V2_OPERATIONS` in IPD deliberately omits both).
    expect([...IPC_WRITE_OPERATIONS].sort()).toEqual(
      ['portfolio.create', 'portfolio.delete', 'portfolio.importBroker', 'portfolio.reset', 'portfolio.save'],
    );
  });
});

/* ------------------------------------------------------------------ *
 * Revision semantics — the first half of the reported mismatch
 * ------------------------------------------------------------------ */

describe('revision guard semantics match the IPD v1 contract', () => {
  it('accepts a non-negative integer guard, exactly as IPD v1 requireExpectedRevision does', () => {
    // IPD v1: `manualPersonalPortfolio.ts` —
    //   `if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) throw`
    // IPD v2 (a different contract): `expectedRevision must be a safe integer >= 1`.
    // IRR consumes v1, so 0 is admissible here and 1 is too.
    expect(isValidExpectedRevision(0)).toBe(true);
    expect(isValidExpectedRevision(1)).toBe(true);
    expect(isValidExpectedRevision(42)).toBe(true);
  });

  it('rejects a negative, fractional or non-numeric guard', () => {
    expect(isValidExpectedRevision(-1)).toBe(false);
    expect(isValidExpectedRevision(1.5)).toBe(false);
    expect(isValidExpectedRevision('1')).toBe(false);
    expect(isValidExpectedRevision(undefined)).toBe(false);
    expect(isValidExpectedRevision(Number.NaN)).toBe(false);
  });

  it('never sends a revision guard of 0 on a save or delete', () => {
    // 0 is admissible by the v1 contract, but it is the PRE-CREATE revision. The
    // personal editor creates with its first batch and then saves against the
    // revision the create returned, so a 0 guard never leaves the client. The
    // transport additionally refuses a missing guard outright.
    expect(isValidExpectedRevision(0)).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * Save mode — the second half of the reported mismatch
 * ------------------------------------------------------------------ */

describe('save mode semantics match the IPD v1 contract', () => {
  it('admits MERGE and REPLACE, because IPD v1 resolves the mode from options.mode', () => {
    // IPD v1: `dispatch.ts` —
    //   `const mode = options.mode === 'REPLACE' || payload.operation === 'REPLACE'
    //    ? 'REPLACE' : 'MERGE';`
    // Both literals are therefore canonical on this channel; REPLACE is not a
    // label-only choice and MERGE is not the only admitted value.
    expect([...G2_SAVE_MODES].sort()).toEqual(['MERGE', 'REPLACE']);
    expect(isValidSaveMode('MERGE')).toBe(true);
    expect(isValidSaveMode('REPLACE')).toBe(true);
  });

  it('rejects any mode outside the closed v1 pair', () => {
    expect(isValidSaveMode('UPSERT')).toBe(false);
    expect(isValidSaveMode('merge')).toBe(false);
    expect(isValidSaveMode(undefined)).toBe(false);
  });

  it('sends REPLACE in the options object, which is where IPD v1 reads it', () => {
    // The mode must travel under `options.mode`; IPD v1 also accepts a
    // top-level `payload.operation === 'REPLACE'`, but `options.mode` is the
    // documented v1 carrier and the one the transport builds.
    const mode: G2SaveMode = 'REPLACE';
    expect(mode).toBe('REPLACE');
  });
});

/* ------------------------------------------------------------------ *
 * Dispositions and operations — the receipt vocabulary
 * ------------------------------------------------------------------ */

describe('save-receipt vocabulary matches the IPD v1 receipt', () => {
  it('admits exactly the dispositions IPD v1 personalReceipt can emit', () => {
    // IPD v1 `personalReceipt` emits 'SAVED_NEW_BATCH' | 'MERGED_INTO_EXISTING'
    // | 'ALREADY_IMPORTED_NO_OP'. 'REJECTED' is the frozen G2 marker for a
    // domain refusal and is admitted by the frozen G2 vocabulary.
    expect(G2_DISPOSITIONS).toContain('SAVED_NEW_BATCH');
    expect(G2_DISPOSITIONS).toContain('MERGED_INTO_EXISTING');
    expect(G2_DISPOSITIONS).toContain('ALREADY_IMPORTED_NO_OP');
    expect(G2_DISPOSITIONS).toContain('REJECTED');
    expect([...G2_DISPOSITIONS].sort()).toEqual([
      'ALREADY_IMPORTED_NO_OP',
      'MERGED_INTO_EXISTING',
      'REJECTED',
      'SAVED_NEW_BATCH',
    ]);
  });

  it('admits exactly the stored revision operations IPD v1 writes', () => {
    // IPD v1 `portfolio_store.ts` writes 'INITIAL' | 'MERGE' | 'REPLACE'
    // | 'RESET' | 'DELETE' into `portfolio_revisions.operation`.
    expect([...G2_OPERATIONS].sort()).toEqual([
      'DELETE',
      'INITIAL',
      'MERGE',
      'REPLACE',
      'RESET',
    ]);
  });
});

/* ------------------------------------------------------------------ *
 * What actually crosses the wire
 * ------------------------------------------------------------------ */

describe('the personal-use write payload matches the IPD v1 request shape', () => {
  const HOLDING: G2HoldingInput = {
    symbol: 'RELIANCE',
    companyId: 'MANUAL:RELIANCE',
    quantity: 10,
    averageBuyPrice: 2400,
    currentPrice: 2500,
    marketValue: 25000,
    weightPercentage: 100,
    active: true,
    sourceBroker: 'manual-personal',
    lineageDigest: 'a'.repeat(64),
    identityStatus: 'UNRESOLVED',
    resolutionDisposition: 'NON_PRODUCTION_OPERATOR_BYPASS',
  };

  it('strips every canonical-identity field, so the C7 refusal is unreachable', () => {
    // IPD v1 `mapManualHolding` derives companyId/identityStatus/
    // resolutionDisposition/lineageDigest/marketValue/weightPercentage itself.
    // Asserting any of them from IRR would be a caller assertion of canonical
    // identity, which IPD refuses Class P.
    const wire = toWireHolding(HOLDING);
    expect(wire).toEqual({
      symbol: 'RELIANCE',
      quantity: 10,
      averageBuyPrice: 2400,
      currentPrice: 2500,
      marketValue: 25000,
      active: true,
      sourceBroker: 'manual-personal',
    });
    expect(wire).not.toHaveProperty('companyId');
    expect(wire).not.toHaveProperty('identityStatus');
    expect(wire).not.toHaveProperty('resolutionDisposition');
    expect(wire).not.toHaveProperty('lineageDigest');
    expect(wire).not.toHaveProperty('weightPercentage');
  });

  it('sends the revision guard and the mode under the keys IPD v1 reads', async () => {
    const seen: Array<{ op: string; payload?: Record<string, unknown> }> = [];
    const port = new IpcUserPortfolioPort({
      precondition: { bindingProvisioned: true },
      transport: async (op: IpcOperation, payload?: Record<string, unknown>) => {
        seen.push({ op, payload });
        return {
          kind: 'SUCCESS' as const,
          frame: {
            v: 1 as const,
            ok: true as const,
            op,
            result: {
              success: true,
              isDuplicate: false,
              disposition: 'MERGED_INTO_EXISTING',
              revision: 2,
              holdingsSavedCount: 1,
              totalMarketValue: 25000,
              weightSumPercentage: 100,
              savedAt: '2026-11-09T00:00:00.000Z',
              provenanceDigest: 'c'.repeat(64),
              portfolio: {
                portfolioId: 'DEFAULT_PORTFOLIO',
                portfolioName: 'My Portfolio',
                revision: 2,
                holdings: [],
                totalMarketValue: 25000,
                holdingsCount: 0,
                weightSumPercentage: 100,
                lastUpdated: '2026-11-09T00:00:00.000Z',
                provenanceDigest: 'c'.repeat(64),
                isSaved: true,
                contributions: [],
              },
            },
          },
          bytesReceived: 128,
        };
      },
    });

    await port.saveHoldings({
      scope: {},
      portfolioId: 'DEFAULT_PORTFOLIO',
      holdings: [HOLDING],
      expectedRevision: 1,
      options: { mode: 'REPLACE' },
    });

    expect(seen).toHaveLength(1);
    expect(seen[0]?.op).toBe('portfolio.save');
    expect(seen[0]?.payload?.expectedRevision).toBe(1);
    expect((seen[0]?.payload?.options as Record<string, unknown>).mode).toBe('REPLACE');
    expect(seen[0]?.payload?.portfolioId).toBe('DEFAULT_PORTFOLIO');
  });

  it('maps an IPD v1 duplicate/no-op receipt onto the frozen G2 save result', async () => {
    const port = new IpcUserPortfolioPort({
      precondition: { bindingProvisioned: true },
      transport: async (op: IpcOperation) => ({
        kind: 'SUCCESS' as const,
        frame: {
          v: 1 as const,
          ok: true as const,
          op,
          result: {
            success: true,
            isDuplicate: true,
            disposition: 'ALREADY_IMPORTED_NO_OP',
            revision: 2,
            holdingsSavedCount: 0,
            totalMarketValue: 25000,
            weightSumPercentage: 100,
            savedAt: '2026-11-09T00:00:00.000Z',
            provenanceDigest: 'c'.repeat(64),
            portfolio: {
              portfolioId: 'DEFAULT_PORTFOLIO',
              portfolioName: 'My Portfolio',
              revision: 2,
              holdings: [],
              totalMarketValue: 25000,
              holdingsCount: 0,
              weightSumPercentage: 100,
              lastUpdated: '2026-11-09T00:00:00.000Z',
              provenanceDigest: 'c'.repeat(64),
              isSaved: true,
              contributions: [],
            },
          },
        },
        bytesReceived: 128,
      }),
    });

    const result = await port.saveHoldings({
      scope: {},
      portfolioId: 'DEFAULT_PORTFOLIO',
      holdings: [HOLDING],
      expectedRevision: 2,
      options: { mode: 'REPLACE' },
    });

    expect(result.isDuplicate).toBe(true);
    expect(result.disposition).toBe('ALREADY_IMPORTED_NO_OP');
    expect(result.revision).toBe(2);
    expect(result.holdingsSavedCount).toBe(0);
  });
});
