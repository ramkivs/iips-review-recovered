import { describe, it, vi } from 'vitest';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { previewBrokerHoldings } from './brokerHoldingsPreview';

const at = '2026-11-05T07:50:49.090Z';
const detailed = 'Trading Symbol,ISIN,Exchange,Total Qty,Average Buy Price,Last Traded Price\nRELIANCE,INE002A01018,NSE,2,100,120';
const summary = 'Name,Quantity,Avg Price,Last Traded,Investment,Current Value,P&L,P&L %\nRELIANCE,2,100,120,200,240,40,20';

/** The 68-row Dhan Web UI summary surface (WS-A). Names verbatim; ISIN and exchange absent. */
const DHAN_68_CSV = `Name,Quantity,Avg Price,Last Traded,Investment,Current Value,P&L,P&L %
AGI GREENPAC,25,89.65,631.65,2241.25,15791.25,13550.00,604.57
ASK AUTOMOTIVE,7,431.29,592.95,3019.03,4150.65,1131.62,37.48
AJAX ENGINEERING,10,467.05,550.10,4670.50,5501.00,830.50,17.78
ARIHANT CAPITAL MARKETS,50,67.92,86.23,3396.00,4311.50,915.50,26.96
ARKADE DEVELOPERS,30,115.71,106.21,3471.30,3186.30,-285.00,-8.21
ARROW GREENTECH,12,388.02,715.00,4656.24,8580.00,3923.76,84.27
ASHOKA BUILDCON,100,126.08,100.45,12608.00,10045.00,-2563.00,-20.33
BANK OF BARODA,100,259.03,243.30,25903.00,24330.00,-1573.00,-6.07
BHARAT COKING COAL,300,36.45,30.35,10935.00,9105.00,-1830.00,-16.74
BLUE JET HEALTHCARE,15,411.83,496.40,6177.45,7446.00,1268.55,20.54
CANARA ROBECO ASSET MANAGEMENT COMPANY,55,252.83,217.36,13905.65,11954.80,-1950.85,-14.03
CREDO BRANDS MARKETING (MUFTI),30,96.83,75.96,2904.90,2278.80,-626.10,-21.55
DAM CAPITAL ADVISORS,150,149.30,133.43,22395.00,20014.50,-2380.50,-10.63
ECOS MOBILITY & HOSPITALITY,100,126.42,111.07,12642.00,11107.00,-1535.00,-12.14
EMS,15,312.52,289.15,4687.80,4337.25,-350.55,-7.48
EPACK PREFAB TECHNOLOGIES,10,192.75,201.51,1927.50,2015.10,87.60,4.54
ELECON ENGINEERING COMPANY,22,426.02,427.95,9372.44,9414.90,42.46,0.45
EMAMI,25,404.23,382.00,10105.75,9550.00,-555.75,-5.50
ENGINEERS INDIA,10,168.00,289.25,1680.00,2892.50,1212.50,72.17
FINEOTEX CHEMICAL,100,22.03,49.15,2203.00,4915.00,2712.00,123.10
GHCL,27,450.31,403.00,12158.37,10881.00,-1277.37,-10.51
GMR POWER & URBAN INFRA,110,98.97,91.77,10886.70,10094.70,-792.00,-7.27
GATEWAY DISTRIPARKS,90,56.04,46.39,5043.60,4175.10,-868.50,-17.22
GEEKAY WIRES,160,22.93,26.91,3668.80,4305.60,636.80,17.36
GENUS POWER INFRASTRUCTURES,10,305.00,270.90,3050.00,2709.00,-341.00,-11.18
GRAUER & WEIL,50,67.79,74.16,3389.50,3708.00,318.50,9.40
GUJARAT PIPAVAV PORT,160,150.65,163.33,24104.00,26132.80,2028.80,8.42
HIMADRI SPECIALITY CHEMICAL,15,443.17,529.00,6647.55,7935.00,1287.45,19.37
IDFC FIRST BANK,50,64.33,73.20,3216.50,3660.00,443.50,13.79
IIFL CAPITAL SERVICES,15,314.40,347.95,4716.00,5219.25,503.25,10.67
INDRAPRASTHA MEDICAL CORPORATION,40,368.99,318.40,14759.60,12736.00,-2023.60,-13.71
INTERNATIONAL CONVEYORS,100,78.07,75.17,7807.00,7517.00,-290.00,-3.71
INTERNATIONAL GEMOLOGICAL INSTITUTE,15,314.67,407.85,4720.05,6117.75,1397.70,29.61
J KUMAR INFRAPROJECTS,20,448.50,405.85,8970.00,8117.00,-853.00,-9.51
JAI BALAJI INDUSTRIES,110,67.84,69.70,7462.40,7667.00,204.60,2.74
JAMNA AUTO INDUSTRIES,33,111.61,122.98,3683.13,4058.34,375.21,10.19
JIO PLATFORMS,12,1119.00,1437.40,13428.00,17248.80,3820.80,28.45
KM SUGAR MILLS,14,227.33,32.23,3182.62,451.22,-2731.40,-85.82
KP ENERGY,40,325.12,159.38,13004.80,6375.20,-6629.60,-50.98
KROSS,5,161.00,272.20,805.00,1361.00,556.00,69.07
LANDMARK CARS,20,386.15,456.05,7723.00,9121.00,1398.00,18.10
MATRIMONY.COM,20,403.08,550.00,8061.60,11000.00,2938.40,36.45
MONARCH NETWORTH CAPITAL,10,272.50,345.70,2725.00,3457.00,732.00,26.86
NATIONAL STOCK EXCHANGE OF INDIA,8,1785.00,1803.80,14280.00,14430.40,150.40,1.05
OSWAL PUMPS,35,373.99,209.54,13089.65,7333.90,-5755.75,-43.97
PANAMA PETROCHEM,10,295.00,465.85,2950.00,4658.50,1708.50,57.92
PARADEEP PHOSPHATES,20,109.00,133.85,2180.00,2677.00,497.00,22.80
PRECISION WIRES INDIA,5,214.00,403.60,1070.00,2018.00,948.00,88.60
PREMIER POLYFILM,10,50.60,90.91,506.00,909.10,403.10,79.66
PUDUMJEE PAPER PRODUCTS,50,82.99,87.28,4149.50,4364.00,214.50,5.17
RADHIKA JEWELTECH,100,56.90,61.87,5690.00,6187.00,497.00,8.73
RAJOO ENGINEERS,200,52.60,55.48,10520.00,11096.00,576.00,5.48
RATEGAIN TRAVEL,10,522.50,820.25,5225.00,8202.50,2977.50,56.99
SALASAR TECHNO ENGINEERING,33,67.11,4.10,2214.63,135.30,-2079.33,-93.89
SHAKTI PUMPS,7,483.79,357.00,3386.53,2499.00,-887.53,-26.21
SHARDA MOTOR,10,822.60,856.40,8226.00,8564.00,338.00,4.11
SIGMA SOLVE,70,46.94,43.03,3285.80,3012.10,-273.70,-8.33
SIYARAM SILK MILLS,10,526.40,473.40,5264.00,4734.00,-530.00,-10.07
STEELCAST,10,183.50,369.15,1835.00,3691.50,1856.50,101.17
SUZLON ENERGY,70,43.54,35.75,3047.80,2502.50,-545.30,-17.89
THYROCARE TECHNOLOGIES,13,440.89,482.90,5731.57,6277.70,546.13,9.53
TITAGARH RAIL SYSTEMS,4,741.88,683.75,2967.52,2735.00,-232.52,-7.84
UNIVASTU,20,76.80,129.14,1536.00,2582.80,1046.80,68.15
VARDHMAN SPECIAL STEELS,15,274.30,350.05,4114.50,5250.75,1136.25,27.62
VISHAL MEGA MART,100,110.30,90.70,11030.00,9070.00,-1960.00,-17.77
VISHNU CHEMICALS,15,504.13,519.05,7561.95,7785.75,223.80,2.96
WAAREE RENEWABLE TECHNOLOGIES,20,951.40,697.50,19028.00,13950.00,-5078.00,-26.69
WEBSOL ENERGY SYSTEM,100,107.09,67.15,10709.00,6715.00,-3994.00,-37.30
`;

const NATIVE_NAMES = DHAN_68_CSV.trim().split('\n').slice(1).map((line) => line.split(',')[0]);

describe('Broker preview public boundary — native evidence, never a save', () => {
  for (const [variant, csv] of [['DHAN_DETAILED_HOLDINGS_V1', detailed], ['DHAN_WEB_UI_SUMMARY_V1', summary]] as const) {
    it(`reuses ${variant} without manufacturing canonical identity`, () => {
      const p = previewBrokerHoldings(csv, 'dhan.csv', at);
      assert.equal(p.broker, 'DHAN');
      assert.equal(p.variant, variant);
      assert.equal(p.persisted, false);
      assert.equal(p.canSave, false);
      assert.equal(p.holdings[0].quantity, 2);
      assert.equal('companyId' in p.holdings[0], false);
      assert.equal('raw' in p.holdings[0], false);
      assert.deepEqual(previewBrokerHoldings(csv, 'dhan.csv', at), p);
    });
  }

  it('resolves identity only through IPD-owned authority and never labels an unassessed row resolved', () => {
    // RELIANCE is in the governed master: the identity authority resolves it, and the preview
    // reports the resolution as the pipeline's result (never as an IRR claim).
    const p = previewBrokerHoldings(summary, 'dhan.csv', at);
    assert.equal(p.status, 'PARSED_IDENTITIES_RESOLVED');
    assert.equal(p.holdings[0].identityStatus, 'RESOLVED');
    assert.equal(p.holdings[0].identityBasis, 'PIPELINE_RESOLVED');
    assert.equal(p.counts.identityResolvedRows, 1);
    assert.equal(p.counts.savedRows, 0);
    assert.equal(p.canSave, false);
    // The governed D05 master is IPD's authenticated universe (2,390 records) from IPD PR #145
    // (`AUTH-D05-REPLACEMENT-AUTHENTICATED-UNIVERSE-ACT-2026-11-08-001`). IRR reports the count
    // IPD's own master publishes; it does not hold its own copy of the corpus.
    assert.deepEqual(p.identityAuthority, { source: 'IPD_GOVERNED_D05_SECURITY_MASTER', entities: 2390 });
  });

  it('reuses Zerodha and Groww parsers', () => {
    const zerodha = 'Instrument,Qty.,Avg. cost,LTP,Cur. val,P&L,Net chg.,Day chg.\nINFY,2,100,120,240,40,20,1';
    const groww = 'Stock Name,Symbol,ISIN,Shares,Average Price,Current Value,Total Returns,Total Returns %,XIRR\nInfosys,INFY,INE009A01021,2,100,240,40,20,10';
    assert.equal(previewBrokerHoldings(zerodha, 'kite.csv', at).broker, 'ZERODHA');
    assert.equal(previewBrokerHoldings(groww, 'groww.csv', at).broker, 'GROWW');
    for (const csv of [zerodha, groww]) {
      const p = previewBrokerHoldings(csv, 'holdings.csv', at);
      assert.equal(p.counts.nativeRows, 1);
      assert.equal(p.counts.savedRows, 0);
    }
  });

  it('executes without Node Buffer in the browser', () => {
    vi.stubGlobal('Buffer', undefined);
    try { assert.equal(previewBrokerHoldings(summary, 'dhan.csv', at).status, 'PARSED_IDENTITIES_RESOLVED'); }
    finally { vi.unstubAllGlobals(); }
  });

  it('does not accept canonical identity embedded in a CSV column', () => {
    const p = previewBrokerHoldings(summary.replace('P&L %', 'P&L %,companyId').replace('40,20', '40,20,FAKE_COMPANY'), 'dhan.csv', at);
    assert.equal(p.canSave, false);
    assert.equal('companyId' in p.holdings[0], false);
  });

  it('preserves unknown securities as unresolved native evidence with an honest identity basis', () => {
    const p = previewBrokerHoldings(summary.replace('RELIANCE', 'UNKNOWN_SECURITY'), 'dhan.csv', at);
    assert.equal(p.holdings[0].symbol, 'UNKNOWN_SECURITY');
    assert.equal(p.holdings[0].identityStatus, 'UNRESOLVED');
    // The pinned pipeline publishes an INDIVIDUAL outcome for this row, so the basis is the
    // per-row assessment, not a file-level refusal standing in for a result that was not obtained.
    assert.equal(p.holdings[0].identityBasis, 'PIPELINE_ASSESSED_UNRESOLVED');
    assert.equal(p.holdings[0].pipelineIdentityStatus, 'UNRESOLVED');
    assert.equal(p.holdings[0].identityRefusalCode, 'NO_AUTHORITATIVE_IDENTIFIER_MATCH');
    assert.equal(p.counts.identityAssessedRows, 1);
    assert.equal(p.status, 'PARSED_UNRESOLVED');
    assert.ok(p.rejections.some((r) => r.reason === 'UNMAPPED_IDENTITY'));
  });

  it('keeps an exchange-scoped row inside its declared exchange namespace', () => {
    // A BSE row must never be resolved (or reported) through the NSE namespace, and vice versa.
    const bse = 'Trading Symbol,ISIN,Exchange,Total Qty,Average Buy Price,Last Traded Price\nUNKNOWN BSE ROW,,BSE,2,100,120';
    const nse = 'Trading Symbol,ISIN,Exchange,Total Qty,Average Buy Price,Last Traded Price\nUNKNOWN NSE ROW,,NSE,2,100,120';
    const bsePreview = previewBrokerHoldings(bse, 'dhan-detailed.csv', at);
    assert.equal(bsePreview.holdings[0].identifierClass, 'EXCHANGE_SCOPED_SYMBOL');
    assert.deepEqual(bsePreview.holdings[0].lookups.map((l) => l.identifierType), ['BSE_SYMBOL']);
    assert.equal(bsePreview.holdings[0].identityRefusalCode, 'UNMAPPED_IDENTIFIER');
    const nsePreview = previewBrokerHoldings(nse, 'dhan-detailed.csv', at);
    assert.deepEqual(nsePreview.holdings[0].lookups.map((l) => l.identifierType), ['NSE_SYMBOL']);
    // An ISIN row queries the ISIN namespace alone.
    const isinOnly = 'Trading Symbol,ISIN,Exchange,Total Qty,Average Buy Price,Last Traded Price\nSOME ROW,INE999Z99999,NSE,2,100,120';
    const isinPreview = previewBrokerHoldings(isinOnly, 'dhan-detailed.csv', at);
    assert.equal(isinPreview.holdings[0].identifierClass, 'ISIN');
    assert.deepEqual(isinPreview.holdings[0].lookups.map((l) => l.identifierType), ['ISIN']);
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
    assert.notEqual(p.contentDigest, previewBrokerHoldings(`${summary}\n`, 'dhan.csv', at).contentDigest);
    assert.equal(p.contentDigest, createHash('sha256').update(summary, 'utf8').digest('hex'));
  });

  /* ------------------------------------------------------------------ *
   * WS-A: the 68-row Dhan surface
   * ------------------------------------------------------------------ */

  describe('WS-A 68-row Dhan Web UI summary surface', () => {
    const p = previewBrokerHoldings(DHAN_68_CSV, 'Portfolio(2).csv', at);

    it('keeps all 68 native rows in order without loss or duplication', () => {
      assert.equal(p.broker, 'DHAN');
      assert.equal(p.variant, 'DHAN_WEB_UI_SUMMARY_V1');
      assert.equal(p.counts.nativeRows, 68);
      assert.equal(p.holdings.length, 68);
      assert.equal(new Set(p.holdings.map((h) => h.symbol)).size, 68);
      assert.deepEqual(p.holdings.map((h) => h.symbol), NATIVE_NAMES);
      assert.equal(NATIVE_NAMES[0], 'AGI GREENPAC');
      assert.equal(NATIVE_NAMES[67], 'WEBSOL ENERGY SYSTEM');
    });

    it('preserves the observed native values of every row', () => {
      const first = p.holdings[0];
      assert.deepEqual(
        { symbol: first.symbol, quantity: first.quantity, averagePrice: first.averagePrice, currentPrice: first.currentPrice },
        { symbol: 'AGI GREENPAC', quantity: 25, averagePrice: 89.65, currentPrice: 631.65 },
      );
      const last = p.holdings[67];
      assert.deepEqual(
        { symbol: last.symbol, quantity: last.quantity, averagePrice: last.averagePrice, currentPrice: last.currentPrice },
        { symbol: 'WEBSOL ENERGY SYSTEM', quantity: 100, averagePrice: 107.09, currentPrice: 67.15 },
      );
    });

    it('keeps ISIN and exchange explicitly absent instead of inventing them', () => {
      assert.equal(p.holdings.every((h) => h.isin === null), true);
      assert.equal(p.holdings.every((h) => h.exchange === null), true);
    });

    it('individually assesses all 68 rows before the single whole-import refusal', () => {
      assert.equal(p.status, 'PARSED_UNRESOLVED');
      assert.equal(p.perRowIdentityEvidencePublished, true);
      assert.equal(p.counts.nativeRows, 68);
      assert.equal(p.counts.identityAssessedRows, 68, 'every native row must carry an individual outcome');
      // IPD's D05 AUTHENTICATED universe (2,390 records, IPD PR #145) resolves AGI GREENPAC
      // (governed alias), GHCL and KROSS; the other 65 rows stay UNRESOLVED. These counts are
      // IPD's, published verbatim: IRR neither recomputes nor overrides them.
      //
      // This is the NAME-ONLY result for this surface (the CSV carries no ISIN and
      // no exchange). It is NOT the separate §9-A ISIN-scoped reassessment, which
      // resolves 65/3 using the B-04 companion export's ISINs and is not an
      // outcome of this CSV. See
      // docs/integration/WS-A-68-ROW-IDENTITY-ASSESSMENT-RECONCILIATION-2026-11-09.md
      assert.equal(p.counts.identityResolvedRows, 3);
      assert.equal(p.counts.identityUnresolvedRows, 65);
      assert.equal(p.counts.savedRows, 0);
      assert.equal(p.holdings.every((h) => h.pipelineIdentityStatus !== null), true);
      assert.equal(p.holdings.filter((h) => h.identityStatus === 'RESOLVED').length, 3);
      assert.equal(p.holdings.filter((h) => h.identityStatus === 'UNRESOLVED').length, 65);
      // The pipeline's own aggregate is passed through, never recomputed by IRR.
      assert.deepEqual(
        { e: p.identitySummary?.evaluated, r: p.identitySummary?.resolved, u: p.identitySummary?.unresolved,
          a: p.identitySummary?.ambiguous, n: p.identitySummary?.notEvaluated, x: p.identitySummary?.excluded },
        { e: 68, r: 3, u: 65, a: 0, n: 0, x: 0 },
      );
      assert.equal(p.identitySummary?.identitySource, 'GOVERNED_SECURITY_MASTER');
      assert.equal(p.identitySummary?.masterRevision,
        'BATCH-D05-REPLACEMENT-AUTHENTICATED-UNIVERSE-2026-11-08-001:b555fd28589a03ea5cbb11c92f880468bcc4b63f449b853a18542aca5817d4c4');
    });

    it('resolves AGI GREENPAC through its governed alias and stops querying weaker namespaces', () => {
      const row = p.holdings[0];
      assert.equal(row.symbol, 'AGI GREENPAC');
      assert.equal(row.identityStatus, 'RESOLVED');
      assert.equal(row.identityBasis, 'PIPELINE_RESOLVED');
      assert.equal(row.pipelineIdentityStatus, 'RESOLVED');
      assert.equal(row.identityRefusalCode, null);
      assert.equal(row.identifierClass, 'UNSCOPED_NAME_OR_SYMBOL');
      assert.equal(row.quarantineIds.length, 0);
      assert.deepEqual(row.lookups.map((l) => [l.identifierType, l.identifierValue, l.outcome]), [
        ['NSE_SYMBOL', 'AGI GREENPAC', 'RESOLVED'],
        ['BSE_SYMBOL', 'AGI GREENPAC', 'UNMAPPED_IDENTIFIER'],
      ]);
      assert.match(row.lookups[1].details ?? '', /Not queried: the row was already resolved by NSE_SYMBOL/);
    });

    it('resolves GHCL and KROSS natively under IPD\'s authenticated universe', () => {
      // IPD's D05 authenticated universe (2,390 records) natively carries GHCL and KROSS, which
      // the legacy Wave-1 corpus could not resolve. IRR reports IPD's verdict verbatim.
      for (const symbol of ['GHCL', 'KROSS']) {
        const row = p.holdings.find((h) => h.symbol === symbol);
        assert.ok(row, `the 68-row surface must carry ${symbol}`);
        assert.equal(row.identityStatus, 'RESOLVED');
        assert.equal(row.identityBasis, 'PIPELINE_RESOLVED');
        assert.equal(row.pipelineIdentityStatus, 'RESOLVED');
        assert.equal(row.identityRefusalCode, null);
        assert.equal(row.quarantineIds.length, 0);
        assert.deepEqual(row.lookups.map((l) => [l.identifierType, l.identifierValue, l.outcome]), [
          ['NSE_SYMBOL', symbol, 'RESOLVED'],
          ['BSE_SYMBOL', symbol, 'UNMAPPED_IDENTIFIER'],
        ]);
        assert.match(row.lookups[1].details ?? '', /Not queried: the row was already resolved by NSE_SYMBOL/);
      }
    });

    it('keeps the other 65 rows at NO_AUTHORITATIVE_IDENTIFIER_MATCH with their full lookup evidence', () => {
      // AGI GREENPAC (row 0), GHCL and KROSS now resolve under IPD's authenticated universe;
      // every other row must still carry the full per-row lookup evidence and the P04 refusal.
      const unresolved = p.holdings.filter((h) => h.identityStatus !== 'RESOLVED');
      assert.equal(unresolved.length, 65);
      assert.equal(unresolved.every((h) => h.identityStatus === 'UNRESOLVED'), true);
      assert.equal(unresolved.every((h) => h.identityBasis === 'PIPELINE_ASSESSED_UNRESOLVED'), true);
      assert.equal(unresolved.every((h) => h.pipelineIdentityStatus === 'UNRESOLVED'), true);
      assert.equal(unresolved.every((h) => h.identityRefusalCode === 'NO_AUTHORITATIVE_IDENTIFIER_MATCH'), true);
      assert.equal(unresolved.every((h) => h.identifierClass === 'UNSCOPED_NAME_OR_SYMBOL'), true);
      assert.deepEqual(p.identitySummary?.refusalCodes, { NO_AUTHORITATIVE_IDENTIFIER_MATCH: 65 });
      // The surface supplies no ISIN and no exchange, so BOTH symbol namespaces were queried
      // verbatim in order, each producing its own P04 quarantine record.
      for (const row of unresolved) {
        assert.deepEqual(row.lookups.map((l) => [l.identifierType, l.identifierValue, l.outcome]), [
          ['NSE_SYMBOL', row.symbol, 'UNMAPPED_IDENTIFIER'],
          ['BSE_SYMBOL', row.symbol, 'UNMAPPED_IDENTIFIER'],
        ]);
        assert.equal(row.lookups.every((l) => l.identifierValue === row.symbol), true,
          'the identifier value must be used verbatim, never rewritten or guessed');
        assert.equal(row.quarantineIds.length, 2);
        assert.equal(typeof row.missingEvidence, 'string');
        assert.match(row.missingEvidence ?? '', /ISIN \(preferred\) or an exchange-scoped trading symbol/);
      }
    });

    it('does not let the file-level refusal mask the per-row results, and keeps the refusal in force', () => {
      // The whole-import P04 refusal (DP-2 Option 2F) is raised once and names only the LAST
      // authoritative lookup of the FIRST refused row. The complete per-row evidence is published
      // alongside it, so the refusal text can never be read as the run's identity outcome.
      assert.equal(p.rejections.length, 1);
      assert.equal(p.rejections[0].stage, 'NORMALIZE');
      assert.equal(p.rejections[0].reason, 'UNMAPPED_IDENTITY');
      assert.match(p.rejections[0].details, /ASK AUTOMOTIVE/);
      assert.match(p.rejections[0].details, /BSE_SYMBOL:ASK AUTOMOTIVE/);
      // Row 2 is the first genuinely unmapped row: proof the governed master, not an empty master,
      // resolved row 1, and proof the refusal is not the whole story.
      assert.equal(p.holdings[1].symbol, 'ASK AUTOMOTIVE');
      assert.equal(p.holdings[1].identityRefusalCode, 'NO_AUTHORITATIVE_IDENTIFIER_MATCH');
      assert.equal(p.holdings[0].identityStatus, 'RESOLVED');
      // Gate E W-1 / P04 whole-import condition: not saveable while any row is unresolved.
      assert.equal(p.identitySummary?.saveable, false);
      assert.equal(p.canSave, false);
      assert.equal(p.persisted, false);
    });

    it('does not claim the observed digest of a file it does not have', () => {
      const observed = '468441dfd0264fddc1e8a7160ebc7c3e5239fa97d13c7545743d1500eb6264b1';
      assert.notEqual(p.contentDigest, observed);
      assert.equal(p.contentDigest, createHash('sha256').update(DHAN_68_CSV, 'utf8').digest('hex'));
      assert.equal(previewBrokerHoldings(DHAN_68_CSV, 'Portfolio(2).csv', at).contentDigest, p.contentDigest);
      assert.notEqual(previewBrokerHoldings(DHAN_68_CSV.replace('AGI GREENPAC,25,', 'AGI GREENPAC,26,'), 'Portfolio(2).csv', at).contentDigest, p.contentDigest);
    });

    it('never asserts validation, authorization or persistence', () => {
      assert.equal(p.persisted, false);
      assert.equal(p.canSave, false);
      assert.deepEqual(
        { v: p.notPerformed.validation, a: p.notPerformed.saveAuthorization, s: p.notPerformed.persistence },
        { v: 'NOT_PERFORMED', a: 'NOT_PERFORMED', s: 'NOT_PERFORMED' },
      );
      assert.equal(p.counts.savedRows, 0);
    });
  });
});
