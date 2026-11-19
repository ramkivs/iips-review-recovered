/**
 * `prepareFullSnapshotBrokerImport` — the daily full-snapshot preparation path (IPD PR
 * #177/#178). Runs the real BI-03 ingress pipeline with identity resolution relaxed, SOLELY to
 * obtain row-level computed values (market value, weight, lineage digest); it never asserts or
 * transmits identity, and it is never authoritative about whether a row is resolved — only
 * IPD's server-side re-assessment decides that.
 */
import { describe, expect, it } from 'vitest';
import { prepareFullSnapshotBrokerImport } from './brokerFullSnapshotImport';

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

  it('carries the broker-reported daily fields verbatim when present, and omits them when absent', () => {
    const prepared = prepareFullSnapshotBrokerImport(MIXED_CSV, 'dhan.csv', at)!;
    for (const h of prepared.holdings) {
      expect('dpQty' in h).toBe(false);
      expect('availableQty' in h).toBe(false);
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
