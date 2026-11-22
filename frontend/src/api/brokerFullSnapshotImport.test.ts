/**
 * `prepareFullSnapshotBrokerImport` — the daily full-snapshot preparation path (IPD PR
 * #177/#178). Runs the real BI-03 ingress pipeline with identity resolution relaxed, SOLELY to
 * obtain row-level computed values (market value, weight, lineage digest); it never asserts or
 * transmits identity, and it is never authoritative about whether a row is resolved — only
 * IPD's server-side re-assessment decides that.
 */
import { describe, expect, it, vi } from 'vitest';
import { BrokerImportIngressOrchestrator } from '../../.cache/broker-import/frontend/src/features/portfolio/import/broker-import-ingress.js';
import type { BrokerDailyFields } from '../../server/broker-import/brokerPartialAcceptanceContract';
import { validateStage4Request } from '../../server/broker-import/brokerImportStage4';
import { prepareFullSnapshotBrokerImport } from './brokerFullSnapshotImport';

const dailyFields: ReadonlyArray<keyof BrokerDailyFields> = ['dpQty', 'availableQty', 'profitLoss', 'pnlPercentage'];

const at = '2026-11-05T07:50:49.090Z';
// One row with a real ISIN+exchange (will be identity-resolvable by the governed master) and
// one row with only a bare name (will not resolve) — mirrors a realistic mixed daily book.
const MIXED_CSV = 'Trading Symbol,ISIN,Exchange,Total Qty,Average Buy Price,Last Traded Price\n'
  + 'RELIANCE,INE002A01018,NSE,2,100,120\n'
  + 'SOME UNKNOWN COMPANY,,NSE,5,10,12\n';

describe('prepareFullSnapshotBrokerImport', () => {
  it('prepares a complete snapshot body with fullSnapshot:true and no canonical identity claim', () => {
    const prepared = prepareFullSnapshotBrokerImport(MIXED_CSV, 'dhan.csv', at);
    expect(prepared).not.toBeNull();
    expect(prepared!.fullSnapshot).toBe(true);
    expect(prepared!.holdings).toHaveLength(2);
    expect(prepared!.mode).toBe('MERGE');
    // No canonical identity claim ever reaches the wire shape, resolvable or not.
    expect(JSON.stringify(prepared)).not.toMatch(/companyId|identityStatus|resolutionDisposition/);
  });

  it('surfaces a non-authoritative local identity estimate for the operator’s information only', () => {
    const prepared = prepareFullSnapshotBrokerImport(MIXED_CSV, 'dhan.csv', at);
    expect(prepared!.clientIdentityPreview).not.toBeNull();
    expect(prepared!.clientIdentityPreview!.evaluated).toBe(2);
    // At least the unresolved bare-name row is not locally resolved; the exact resolved count
    // depends on the installed governed master and is not asserted here (IPD decides authoritatively).
    expect(prepared!.clientIdentityPreview!.unresolved).toBeGreaterThanOrEqual(1);
  });

  it('omits all four daily fields when the broker did not report them', () => {
    const prepared = prepareFullSnapshotBrokerImport(MIXED_CSV, 'dhan.csv', at);
    expect(prepared).not.toBeNull();
    if (!prepared) throw new Error('synthetic snapshot was not prepared');
    for (const h of prepared.holdings) {
      for (const field of dailyFields) expect(h).not.toHaveProperty(field);
    }
  });

  it('carries broker-reported daily fields, including zero and negative values, into the accepted wire shape', () => {
    const csv = 'Trading Symbol,ISIN,Exchange,Total Qty,Average Buy Price,Last Traded Price,DP Qty,Available Qty,Profit / Loss,P&L %\n'
      + 'RELIANCE,INE002A01018,NSE,2,100,120,1,0,-12.75,-6.5\n';
    const prepared = prepareFullSnapshotBrokerImport(csv, 'synthetic-dhan.csv', at);
    expect(prepared).not.toBeNull();
    if (!prepared) throw new Error('synthetic snapshot was not prepared');
    expect(prepared.holdings).toHaveLength(1);
    expect(prepared.holdings[0]).toMatchObject({
      quantity: 2, dpQty: 1, availableQty: 0, profitLoss: -12.75, pnlPercentage: -6.5,
    });
    const { clientIdentityPreview, ...body } = prepared;
    expect(clientIdentityPreview).not.toBeNull();
    expect(validateStage4Request('SYNTHETIC', { ...body, expectedRevision: 1 })).not.toBeNull();
  });

  it('preserves explicit null daily values, and refuses malformed or non-finite values', () => {
    const executeIngress = BrokerImportIngressOrchestrator.executeIngress;
    for (const value of [null, 'invalid', Number.POSITIVE_INFINITY, Number.NaN]) {
      for (const field of dailyFields) {
        const spy = vi.spyOn(BrokerImportIngressOrchestrator, 'executeIngress').mockImplementation(request => {
          const result = executeIngress(request);
          if (!result.userHoldings[0]) throw new Error('synthetic holding missing');
          Object.defineProperty(result.userHoldings[0], field, { value, enumerable: true, configurable: true });
          return result;
        });
        try {
          const prepared = prepareFullSnapshotBrokerImport(MIXED_CSV, 'synthetic-dhan.csv', at);
          if (value === null) {
            expect(prepared).not.toBeNull();
            expect(prepared?.holdings[0]).toHaveProperty(field, null);
          } else {
            expect(prepared).toBeNull();
          }
        } finally {
          spy.mockRestore();
        }
      }
    }
  });

  it('transmits the exact file name, content digest and observation time without substitution', () => {
    const prepared = prepareFullSnapshotBrokerImport(MIXED_CSV, 'my-daily-book.csv', at)!;
    expect(prepared.fileName).toBe('my-daily-book.csv');
    expect(prepared.importedAt).toBe(at);
    expect(prepared.contentDigest).toMatch(/^[a-f0-9]{64}$/);
  });

  it('refuses preparation entirely on a row-level rejection (not an identity outcome)', () => {
    const withBadRow = MIXED_CSV + 'BROKEN ROW,,NSE,-1,10,12\n';
    expect(prepareFullSnapshotBrokerImport(withBadRow, 'dhan.csv', at)).toBeNull();
  });

  it('refuses preparation on an empty or header-only file', () => {
    expect(prepareFullSnapshotBrokerImport('Trading Symbol,ISIN,Exchange,Total Qty,Average Buy Price,Last Traded Price\n', 'dhan.csv', at)).toBeNull();
  });

  it('refuses an oversized file or an oversized file name before running the pipeline', () => {
    expect(prepareFullSnapshotBrokerImport('x'.repeat(1_048_577), 'dhan.csv', at)).toBeNull();
    expect(prepareFullSnapshotBrokerImport(MIXED_CSV, 'x'.repeat(257), at)).toBeNull();
  });

  it('refuses a malformed observation time', () => {
    expect(prepareFullSnapshotBrokerImport(MIXED_CSV, 'dhan.csv', 'not-a-date')).toBeNull();
  });
});
