import { describe, it, vi } from 'vitest';
import assert from 'node:assert/strict';
import { previewBrokerHoldings } from './brokerHoldingsPreview';

const at = '2026-10-16T00:00:00.000Z';
const detailed = 'Trading Symbol,ISIN,Exchange,Total Qty,Average Buy Price,Last Traded Price\nRELIANCE,INE002A01018,NSE,2,100,120';
const summary = 'Name,Quantity,Avg Price,Last Traded,Investment,Current Value,P&L,P&L %\nRELIANCE,2,100,120,200,240,40,20';

describe('Broker preview public boundary — native evidence, never a save', () => {
  for (const [variant, csv] of [['DHAN_DETAILED_HOLDINGS_V1', detailed], ['DHAN_WEB_UI_SUMMARY_V1', summary]]) {
    it(`reuses ${variant} without manufacturing canonical identity`, () => {
      const p = previewBrokerHoldings(csv, 'dhan.csv', at);
      assert.equal(p.broker, 'DHAN');
      assert.equal(p.variant, variant);
      assert.equal(p.status, 'PARSED_UNRESOLVED');
      assert.equal(p.persisted, false);
      assert.equal(p.canSave, false);
      assert.equal(p.holdings[0].quantity, 2);
      assert.equal(p.holdings[0].identityStatus, 'UNRESOLVED');
      assert.equal('companyId' in p.holdings[0], false);
      assert.equal('raw' in p.holdings[0], false);
      assert.ok(p.rejections.some(r => r.reason === 'UNMAPPED_IDENTITY'));
      assert.deepEqual(previewBrokerHoldings(csv, 'dhan.csv', at), p);
    });
  }
  it('reuses Zerodha and Groww parsers without adding identity', () => {
    const zerodha = 'Instrument,Qty.,Avg. cost,LTP,Cur. val,P&L,Net chg.,Day chg.\nINFY,2,100,120,240,40,20,1';
    const groww = 'Stock Name,Symbol,ISIN,Shares,Average Price,Current Value,Total Returns,Total Returns %,XIRR\nInfosys,INFY,INE009A01021,2,100,240,40,20,10';
    assert.equal(previewBrokerHoldings(zerodha, 'kite.csv', at).broker, 'ZERODHA');
    assert.equal(previewBrokerHoldings(groww, 'groww.csv', at).broker, 'GROWW');
    for (const csv of [zerodha, groww]) {
      const p = previewBrokerHoldings(csv, 'holdings.csv', at);
      assert.equal(p.status, 'PARSED_UNRESOLVED');
      assert.equal(p.holdings[0].identityStatus, 'UNRESOLVED');
    }
  });
  it('executes without Node Buffer in the browser', () => {
    vi.stubGlobal('Buffer', undefined);
    try { assert.equal(previewBrokerHoldings(summary, 'dhan.csv', at).status, 'PARSED_UNRESOLVED'); }
    finally { vi.unstubAllGlobals(); }
  });
  it('does not accept canonical identity embedded in a CSV column', () => {
    const p = previewBrokerHoldings(summary.replace('P&L %', 'P&L %,companyId').replace('40,20', '40,20,FAKE_COMPANY'), 'dhan.csv', at);
    assert.equal(p.canSave, false);
    assert.equal('companyId' in p.holdings[0], false);
    assert.equal(p.holdings[0].identityStatus, 'UNRESOLVED');
  });
  it('preserves unknown securities as unresolved native evidence', () => {
    const p = previewBrokerHoldings(summary.replace('RELIANCE', 'UNKNOWN_SECURITY'), 'dhan.csv', at);
    assert.equal(p.holdings[0].symbol, 'UNKNOWN_SECURITY');
    assert.equal(p.holdings[0].identityStatus, 'UNRESOLVED');
  });
  it('rejects empty and unknown formats, blocks XLSX rather than faking success', () => {
    assert.equal(previewBrokerHoldings('', 'empty.csv', at).status, 'REJECTED');
    assert.equal(previewBrokerHoldings('x,y\n1,2', 'unknown.csv', at).status, 'REJECTED');
    assert.equal(previewBrokerHoldings('PK archive', 'dhan.xlsx', at).status, 'BLOCKED');
  });
  it('bounds inputs before processing', () => {
    assert.throws(() => previewBrokerHoldings('x'.repeat(1_048_577), 'dhan.csv', at));
    assert.throws(() => previewBrokerHoldings(summary, 'x'.repeat(257), at));
  });
  it('requires an explicit valid observation timestamp', () => {
    assert.throws(() => previewBrokerHoldings(summary, 'dhan.csv', 'bad'));
  });
  it('raw content digest changes with the bytes, not the filename', () => {
    const p = previewBrokerHoldings(summary, 'dhan.csv', at);
    assert.equal(p.contentDigest, previewBrokerHoldings(summary, 'other.csv', at).contentDigest);
    assert.notEqual(p.contentDigest, previewBrokerHoldings(summary + '\n', 'dhan.csv', at).contentDigest);
  });
});
