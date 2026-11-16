/**
 * Snapshot-to-Live W07 — Financial Limitation Resolution (`L-038`, `L-039`, and `L-040` preservation).
 *
 * Verifies:
 *   1. `L-038` (Marico Limited — consolidated issued/paid-up `PREFERENCE_CAPITAL`):
 *      - FY24–FY26 audited Note 12(a) extracts disclose `₹65 Crore` authorised preference shares and omit any
 *        issued/subscribed/paid-up preference row without an audited nil declaration;
 *      - absence of consolidated disclosure stays `MISSING('NOT_REPORTED')` (`value: null`), never `0`;
 *      - V3 `NilBinding` (`L-035`) refuses standalone-only scope (`STANDALONE_COMPANY`, e.g., Form MGT-7) on a
 *        `CONSOLIDATED` period row without explicit cross-scope `acceptedBy` acknowledgment;
 *   2. `L-039` (KEC International Limited — `CURRENT_INVESTMENTS` zero / source / taxonomy / rounding):
 *      - exact SEBI `in-capmkt` arithmetic reconciliation of `CurrentFinancialAssets` (`193,906,000,000` INR =
 *        `₹19,390.60 cr`) in `march-consolidated-xbrl.gz` against the audited Consolidated Balance Sheet;
 *      - empirical proof from the same filing (`NoncurrentInvestments = 0` at `decimals="-7"` vs audited Note 10
 *        `₹49,000` / `*-`) that XBRL `0` at `decimals="-7"` cannot be consumed as a verified zero;
 *      - net debt and EV-to-equity per-share valuation remain safely withheld while gross debt, EV, and
 *        price-free operating ratios proceed;
 *   3. Narrow W07 IRR XBRL ingestion defect fixes (`W07-D1`..`W07-D5`) in `xbrl.ts` and `builder.ts`:
 *      - `W07-D1`: `xsi:nil="true"` and empty `""` XBRL facts emit `EMPTY_OR_NIL_FACT` and stay `MISSING` (`null`),
 *        never `Number("") === 0`;
 *      - `W07-D2`: `periodStart` disambiguates annual `OneD` (`2025-04-01..2026-03-31`) from Q4 `FourD`
 *        (`2026-01-01..2026-03-31`) on KEC's real NSE `in-capmkt` filing (`march-consolidated-xbrl.gz`);
 *      - `W07-D3`: dimensional `<segment>` / `<scenario>` contexts never overwrite primary statement totals;
 *      - `W07-D4`: `CURRENT_DATASET_SCHEMA` (`V3`) accepts V2 item `INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES`
 *        while `V1` still refuses with `LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2`;
 *      - `W07-D5`: non-INR `unitRef` on an `INSTANT` balance-sheet item emits `UNIT_NOT_INR` and stays `MISSING`;
 *   4. `L-040` (`RESOLVED`) and W05 qualification baselines remain intact, and the published W07 report records
 *      the authoritative dispositions.
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';

import { assessCompany } from '../../src/investment/assessment/engine';
import { CURRENT_DATASET_SCHEMA, LEGACY_DATASET_SCHEMA } from '../../src/investment/contracts/lineItems';
import { checkNilBinding, parseNilDeclaration } from '../../src/investment/contracts/nilBinding';
import { buildDatasetContent } from '../../src/investment/ingestion/builder';
import { parseXml, localName } from '../../src/investment/ingestion/xml';
import { extractPeriodValues, parseXbrlInstance, XBRL_TAG_MAP } from '../../src/investment/ingestion/xbrl';
import { techAssessmentInput, techDataset } from './assessmentFixtures';
import { referenceInputs } from './fixtures';

const ROOT = resolve(__dirname, '..', '..', '..');
const BODHI = 'IN:EQISIN:IN0000000029';
const KEC = 'IN:CIN:L45200MH2005PLC152061';

const sha256 = (buf: Buffer | string): string => createHash('sha256').update(buf).digest('hex');

describe('W07 — L-038 (Marico Limited preference-capital disclosure and representation)', () => {
  test('audited FY24, FY25, and FY26 Note 12(a) extracts disclose ₹65 cr authorised preference shares and no issued preference row or nil prose', () => {
    const fy24 = readFileSync(
      join(ROOT, 'evidence/real-issuer/WI12-L038-PREFERENCE-CAPITAL-2026-11-08/source/fy24-page189-tail-note12a-share-capital.txt'),
      'utf8',
    );
    const fy25 = readFileSync(
      join(ROOT, 'evidence/real-issuer/WI12-L038-PREFERENCE-CAPITAL-2026-11-08/source/fy25-page185-note12a-consolidated-equity-share-capital.txt'),
      'utf8',
    );
    const fy26 = readFileSync(
      join(ROOT, 'evidence/real-issuer/WI12-L038-PREFERENCE-CAPITAL-2026-11-08/source/fy26-page205-note12a-consolidated-equity-share-capital.txt'),
      'utf8',
    );

    for (const [label, text] of [
      ['FY24', fy24],
      ['FY25', fy25],
      ['FY26', fy26],
    ] as const) {
      assert.match(text, /Preference shares of .*10.* each/i, `${label} Note 12(a) must show ₹10 authorised preference shares`);
      assert.match(text, /\b65\b/, `${label} Note 12(a) must show ₹65 Crore authorised preference capital`);
      assert.match(text, /Issued,\s*subscribed and paid[- ]up/i, `${label} Note 12(a) must include the issued/paid-up section`);
      assert.equal(
        /no preference shares have been issued|preference share capital is nil/i.test(text),
        false,
        `${label} Note 12(a) contains no audited prose declaring issued preference capital nil`,
      );
    }
  });

  test('blank PREFERENCE_CAPITAL in periods.csv remains MISSING/NOT_REPORTED (value: null) and V3 refuses unacknowledged standalone nil on consolidated scope', () => {
    const maricoCsv = readFileSync(
      join(ROOT, 'evidence/real-issuer/WI7-L038-DEBT-COMPLETENESS-2026-11-07/ingest-input/periods.csv'),
      'utf8',
    );
    const maricoRoster = JSON.parse(
      readFileSync(
        join(ROOT, 'evidence/real-issuer/WI7-L038-DEBT-COMPLETENESS-2026-11-07/ingest-input/roster.json'),
        'utf8',
      ),
    );
    const built = buildDatasetContent({
      issuers: maricoRoster.issuers,
      securities: maricoRoster.securities ?? [],
      listings: maricoRoster.listings ?? [],
      corporateActions: [],
      prices: [],
      periodCsv: { name: 'periods.csv', text: maricoCsv },
      xbrlFiles: [],
      operatingMetricsCsv: null,
    });
    assert.equal(built.periods.length, 3);
    for (const period of built.periods) {
      assert.equal(period.values.PREFERENCE_CAPITAL?.presence, 'MISSING');
      assert.equal(period.values.PREFERENCE_CAPITAL?.reason, 'NOT_REPORTED');
      assert.equal(period.values.PREFERENCE_CAPITAL?.value, null);
    }

    // Standalone parent nil (e.g. Form MGT-7) cannot silently bind a CONSOLIDATED period row under V3.
    const standaloneDecl = parseNilDeclaration(
      'NIL[section=BS;class=PREFERENCE_SHARE_CAPITAL;scope=STANDALONE_COMPANY]: Standalone parent Form MGT-7 Item IV(i)(b) reports 0 issued preference shares',
    );
    assert.equal(standaloneDecl.isNil, true);
    assert.equal(standaloneDecl.bracketed, true);
    const rejected = checkNilBinding(standaloneDecl, 'PREFERENCE_CAPITAL', 'CONSOLIDATED');
    assert.equal(rejected.acceptable, false);
    assert.equal(rejected.problems.some((p) => p.code === 'NIL_SCOPE_NUANCE_UNACKNOWLEDGED' && p.severity === 'ERROR'), true);

    // Also confirm XBRL_TAG_MAP does not map an unverified balance-sheet tag onto PREFERENCE_CAPITAL.
    assert.equal(Object.values(XBRL_TAG_MAP).includes('PREFERENCE_CAPITAL'), false);
  });
});

describe('W07 — L-039 (KEC International CURRENT_INVESTMENTS reconciliation and decimals="-7" proof)', () => {
  const kecXml = gunzipSync(
    readFileSync(
      join(ROOT, 'evidence/real-issuer/WI12-L039-CURRENT-INVESTMENTS-2026-11-05/source/march-consolidated-xbrl.gz'),
    ),
  ).toString('utf8');
  const kecStandaloneXml = gunzipSync(
    readFileSync(
      join(ROOT, 'evidence/real-issuer/WI12-L039-CURRENT-INVESTMENTS-2026-11-05/source/march-standalone-xbrl.gz'),
    ),
  ).toString('utf8');

  test('march-consolidated-xbrl.gz reconciles CurrentFinancialAssets (₹19,390.60 cr) and proves decimals="-7" masks non-zero sub-rounding balances (NoncurrentInvestments = ₹49,000)', () => {
    assert.equal(
      sha256(Buffer.from(kecXml, 'utf8')),
      '133f0cf14a5bbdecf055affc046e5aa73097f8d9793bf423942933b037f19d21',
    );
    const doc = parseXml(kecXml);
    const root = doc.children[0]!;

    const oneIFacts = new Map<string, { value: string; decimals: string | undefined }>();
    const otherCurrentBreakdown: Array<{ ctx: string; desc?: string; amount?: number }> = [];
    const byCtx = new Map<string, { desc?: string; amount?: number }>();

    for (const child of root.children) {
      const ctx = child.attributes.contextRef;
      const ln = localName(child.name);
      if (ctx === 'OneI') {
        oneIFacts.set(ln, { value: child.text.trim(), decimals: child.attributes.decimals });
      }
      if (ctx === 'I_OtherCurrentFinancialAssets1' || ctx === 'I_OtherCurrentFinancialAssets2') {
        const entry = byCtx.get(ctx) ?? {};
        if (ln === 'DescriptionOfOtherCurrentFinancialAssets') entry.desc = child.text.trim();
        if (ln === 'OtherCurrentFinancialAssets') entry.amount = Number(child.text.trim());
        byCtx.set(ctx, entry);
      }
    }
    for (const [ctx, entry] of byCtx.entries()) otherCurrentBreakdown.push({ ctx, ...entry });

    // Exact SEBI in-capmkt calculation-linkbase children of CurrentFinancialAssets:
    const currentInvestments = Number(oneIFacts.get('CurrentInvestments')?.value);
    const tradeReceivables = Number(oneIFacts.get('TradeReceivablesCurrent')?.value);
    const cash = Number(oneIFacts.get('CashAndCashEquivalents')?.value);
    const otherBank = Number(oneIFacts.get('BankBalanceOtherThanCashAndCashEquivalents')?.value);
    const loansCurrent = Number(oneIFacts.get('LoansCurrent')?.value);
    const otherCurrentFin = Number(oneIFacts.get('OtherCurrentFinancialAssets')?.value);
    const totalCurrentFin = Number(oneIFacts.get('CurrentFinancialAssets')?.value);

    assert.equal(currentInvestments, 0);
    assert.equal(oneIFacts.get('CurrentInvestments')?.decimals, '-7');
    assert.equal(tradeReceivables, 64_742_100_000); // ₹6,474.21 cr
    assert.equal(cash, 4_112_600_000); // ₹411.26 cr
    assert.equal(otherBank, 1_006_700_000); // ₹100.67 cr
    assert.equal(loansCurrent, 0);
    assert.equal(otherCurrentFin, 124_044_600_000); // ₹12,404.46 cr = ₹276.90 cr + ₹12,127.56 cr
    assert.equal(totalCurrentFin, 193_906_000_000); // ₹19,390.60 cr
    assert.equal(
      currentInvestments + tradeReceivables + cash + otherBank + loansCurrent + otherCurrentFin,
      totalCurrentFin,
    );

    // Dimensional contexts prove OtherCurrentFinancialAssets = Note 19 (₹276.90 cr) + Note 20 Contract assets (₹12,127.56 cr):
    assert.deepEqual(otherCurrentBreakdown, [
      { ctx: 'I_OtherCurrentFinancialAssets1', desc: 'Other financial assets', amount: 2_769_000_000 },
      { ctx: 'I_OtherCurrentFinancialAssets2', desc: 'Contract assets', amount: 121_275_600_000 },
    ]);

    // Decisive proof: NoncurrentInvestments in the SAME OneI context is ALSO `0` with `decimals="-7"`,
    // whereas audited Note 10 proves actual carrying amount = ₹49,000 (4,900 shares of ₹10 each, printed as `*-`).
    assert.equal(oneIFacts.get('NoncurrentInvestments')?.value, '0');
    assert.equal(oneIFacts.get('NoncurrentInvestments')?.decimals, '-7');
    const note10 = readFileSync(
      join(ROOT, 'evidence/real-issuer/WI8-L039-CASH-SIDE-2026-11-07/source/fy26-notes-09-to-10-intangible-assets-and-investments-pdf-page129.txt'),
      'utf8',
    );
    assert.match(note10, /4,?900\s+Fully paid Equity Shares of .*10 each/i);
    assert.match(note10, /less than rounding off norms adopted by the Group/i);

    // Meanwhile standalone FY26 reports NoncurrentInvestments = 14,226,900,000 at decimals="-5" and CurrentInvestments = 0 at decimals="-7".
    const standaloneDoc = parseXml(kecStandaloneXml);
    const standaloneNoncurrent = standaloneDoc.children[0]!.children.find(
      (c) => localName(c.name) === 'NoncurrentInvestments' && c.attributes.contextRef === 'OneI',
    );
    assert.equal(standaloneNoncurrent?.text.trim(), '14226900000');
    assert.equal(standaloneNoncurrent?.attributes.decimals, '-5');
  });

  test('extractPeriodValues extracts exact annual OneD figures from march-consolidated-xbrl.gz without Q4 FourD shadowing and keeps CURRENT_INVESTMENTS MISSING', () => {
    const instance = parseXbrlInstance(kecXml);
    const extracted = extractPeriodValues(instance, {
      issuerId: KEC,
      periodStart: '2025-04-01',
      periodEnd: '2026-03-31',
      statementScope: 'CONSOLIDATED',
      filingRef: 'NSE-KEC-IFINDAS-FY26',
      filedAt: '2026-05-16',
      datasetSchema: CURRENT_DATASET_SCHEMA,
    });

    assert.equal(extracted.issues.length, 0, 'no false DUPLICATE_FACT warnings when periodStart disambiguates OneD from FourD');
    assert.equal(extracted.values.REVENUE_FROM_OPERATIONS?.value, 235_055_400_000); // ₹23,505.54 cr (annual OneD, not Q4 ₹6,389.75 cr)
    assert.equal(extracted.values.OTHER_INCOME?.value, 503_300_000); // ₹50.33 cr
    assert.equal(extracted.values.FINANCE_COSTS?.value, 6_636_000_000); // ₹663.60 cr
    assert.equal(extracted.values.PROFIT_BEFORE_TAX?.value, 7_891_400_000); // ₹789.14 cr
    assert.equal(extracted.values.TAX_EXPENSE?.value, 1_835_500_000); // ₹183.55 cr
    assert.equal(extracted.values.NET_PROFIT?.value, 6_055_900_000); // ₹605.59 cr
    assert.equal(extracted.values.EPS_BASIC?.value, 22.75);
    assert.equal(extracted.values.EPS_DILUTED?.value, 22.75);
    assert.equal(extracted.values.CASH_AND_CASH_EQUIVALENTS?.value, 4_112_600_000); // ₹411.26 cr
    assert.equal(extracted.values.LONG_TERM_BORROWINGS?.value, 6_613_700_000); // ₹661.37 cr
    assert.equal(extracted.values.SHORT_TERM_BORROWINGS?.value, 44_418_600_000); // ₹4,441.86 cr
    assert.equal(extracted.values.OPERATING_CASH_FLOW?.value, -4_141_400_000); // -₹414.14 cr
    assert.equal(extracted.values.CAPITAL_EXPENDITURE?.value, 3_286_800_000); // ₹328.68 cr

    // CURRENT_INVESTMENTS must remain MISSING (null), never coerced to 0 from decimals="-7":
    assert.equal(extracted.values.CURRENT_INVESTMENTS?.presence, 'MISSING');
    assert.equal(extracted.values.CURRENT_INVESTMENTS?.value, null);
    // V3 schema slot for V2 item is present as MISSING:
    assert.equal(extracted.values.INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES?.presence, 'MISSING');
    assert.equal(extracted.values.INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES?.value, null);
  });
});

describe('W07 — Narrow IRR XBRL ingestion defect fixes (W07-D1..W07-D5)', () => {
  test('W07-D1: xsi:nil="true" and empty XBRL fact values emit EMPTY_OR_NIL_FACT and stay MISSING (never Number("") === 0)', () => {
    const xml = `<?xml version="1.0"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <xbrli:context id="I-2026">
    <xbrli:entity><xbrli:identifier scheme="IN">${BODHI}</xbrli:identifier></xbrli:entity>
    <xbrli:period><xbrli:instant>2026-03-31</xbrli:instant></xbrli:period>
  </xbrli:context>
  <xbrli:unit id="INR"><xbrli:measure>iso4217:INR</xbrli:measure></xbrli:unit>
  <CashAndCashEquivalents contextRef="I-2026" unitRef="INR" xsi:nil="true"/>
  <BorrowingsNoncurrent contextRef="I-2026" unitRef="INR">   </BorrowingsNoncurrent>
</xbrli:xbrl>`;
    const extracted = extractPeriodValues(parseXbrlInstance(xml), {
      issuerId: BODHI,
      periodEnd: '2026-03-31',
      statementScope: 'CONSOLIDATED',
      filingRef: 'FIL-NIL-TEST',
      filedAt: '2026-05-16',
    });

    assert.equal(extracted.values.CASH_AND_CASH_EQUIVALENTS?.presence, 'MISSING');
    assert.equal(extracted.values.CASH_AND_CASH_EQUIVALENTS?.value, null);
    assert.notEqual(extracted.values.CASH_AND_CASH_EQUIVALENTS?.value, 0);
    assert.equal(extracted.values.LONG_TERM_BORROWINGS?.presence, 'MISSING');
    assert.equal(extracted.values.LONG_TERM_BORROWINGS?.value, null);
    assert.equal(extracted.issues.filter((i) => i.code === 'EMPTY_OR_NIL_FACT').length, 2);
  });

  test('W07-D2 & W07-D3: buildDatasetContent disambiguates annual startDate from Q4 and ignores dimensional scenario/segment contexts', () => {
    const xml = `<?xml version="1.0"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:xbrldi="http://xbrl.org/2006/xbrldi">
  <xbrli:context id="FourD">
    <xbrli:entity><xbrli:identifier scheme="IN">${BODHI}</xbrli:identifier></xbrli:entity>
    <xbrli:period><xbrli:startDate>2026-01-01</xbrli:startDate><xbrli:endDate>2026-03-31</xbrli:endDate></xbrli:period>
  </xbrli:context>
  <xbrli:context id="OneD_Dim">
    <xbrli:entity><xbrli:identifier scheme="IN">${BODHI}</xbrli:identifier></xbrli:entity>
    <xbrli:period><xbrli:startDate>2025-04-01</xbrli:startDate><xbrli:endDate>2026-03-31</xbrli:endDate></xbrli:period>
    <xbrli:scenario><xbrldi:explicitMember dimension="Axis">SegmentA</xbrldi:explicitMember></xbrli:scenario>
  </xbrli:context>
  <xbrli:context id="OneD">
    <xbrli:entity><xbrli:identifier scheme="IN">${BODHI}</xbrli:identifier></xbrli:entity>
    <xbrli:period><xbrli:startDate>2025-04-01</xbrli:startDate><xbrli:endDate>2026-03-31</xbrli:endDate></xbrli:period>
  </xbrli:context>
  <xbrli:context id="OneI_Seg">
    <xbrli:entity>
      <xbrli:identifier scheme="IN">${BODHI}</xbrli:identifier>
      <xbrli:segment><xbrldi:typedMember dimension="Breakdown"><Domain>1</Domain></xbrldi:typedMember></xbrli:segment>
    </xbrli:entity>
    <xbrli:period><xbrli:instant>2026-03-31</xbrli:instant></xbrli:period>
  </xbrli:context>
  <xbrli:context id="OneI">
    <xbrli:entity><xbrli:identifier scheme="IN">${BODHI}</xbrli:identifier></xbrli:entity>
    <xbrli:period><xbrli:instant>2026-03-31</xbrli:instant></xbrli:period>
  </xbrli:context>
  <xbrli:unit id="INR"><xbrli:measure>iso4217:INR</xbrli:measure></xbrli:unit>
  <RevenueFromOperations contextRef="FourD" unitRef="INR">12000000000</RevenueFromOperations>
  <RevenueFromOperations contextRef="OneD_Dim" unitRef="INR">9000000000</RevenueFromOperations>
  <RevenueFromOperations contextRef="OneD" unitRef="INR">48000000000</RevenueFromOperations>
  <CashAndCashEquivalents contextRef="OneI_Seg" unitRef="INR">100000000</CashAndCashEquivalents>
  <CashAndCashEquivalents contextRef="OneI" unitRef="INR">7400000000</CashAndCashEquivalents>
</xbrli:xbrl>`;

    const content = buildDatasetContent(
      referenceInputs({
        xbrlFiles: [
          {
            issuerId: BODHI,
            periodEnd: '2026-03-31',
            statementScope: 'CONSOLIDATED',
            filingRef: 'FIL-BODHI-MULTI-CTX',
            filedAt: '2026-05-16',
            name: 'BODHI-MULTI.xml',
            text: xml,
          },
        ],
      }),
    );
    const bodhi = content.periods.find((p) => p.issuerId === BODHI)!;
    assert.equal(bodhi.values.REVENUE_FROM_OPERATIONS?.value, 48_000_000_000);
    assert.equal(bodhi.values.CASH_AND_CASH_EQUIVALENTS?.value, 7_400_000_000);
    assert.equal(content.issues.some((i) => i.code === 'DUPLICATE_FACT'), false);
  });

  test('W07-D4 & W07-D5: V3 schema accepts associates/JV components while V1 refuses, and non-INR instant balance-sheet facts emit UNIT_NOT_INR', () => {
    const xml = `<?xml version="1.0"?>
<xbrli:xbrl xmlns:xbrli="http://www.xbrl.org/2003/instance">
  <xbrli:context id="I-2026">
    <xbrli:entity><xbrli:identifier scheme="IN">${BODHI}</xbrli:identifier></xbrli:entity>
    <xbrli:period><xbrli:instant>2026-03-31</xbrli:instant></xbrli:period>
  </xbrli:context>
  <xbrli:unit id="INR"><xbrli:measure>iso4217:INR</xbrli:measure></xbrli:unit>
  <xbrli:unit id="USD"><xbrli:measure>iso4217:USD</xbrli:measure></xbrli:unit>
  <InvestmentsInAssociates contextRef="I-2026" unitRef="INR">5000000000</InvestmentsInAssociates>
  <InvestmentsInJointVentures contextRef="I-2026" unitRef="INR">3000000000</InvestmentsInJointVentures>
  <CashAndCashEquivalents contextRef="I-2026" unitRef="USD">1000000</CashAndCashEquivalents>
</xbrli:xbrl>`;
    const instance = parseXbrlInstance(xml);

    const v3 = extractPeriodValues(instance, {
      issuerId: BODHI,
      periodEnd: '2026-03-31',
      statementScope: 'CONSOLIDATED',
      filingRef: 'FIL-V3-TEST',
      filedAt: '2026-05-16',
      datasetSchema: CURRENT_DATASET_SCHEMA,
    });
    assert.equal(v3.values.INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES?.presence, 'PRESENT');
    assert.equal(v3.values.INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES?.value, 8_000_000_000);
    assert.equal(v3.values.CASH_AND_CASH_EQUIVALENTS?.presence, 'MISSING');
    assert.equal(v3.values.CASH_AND_CASH_EQUIVALENTS?.value, null);
    assert.equal(v3.issues.some((i) => i.code === 'UNIT_NOT_INR'), true);

    const v1 = extractPeriodValues(instance, {
      issuerId: BODHI,
      periodEnd: '2026-03-31',
      statementScope: 'CONSOLIDATED',
      filingRef: 'FIL-V1-TEST',
      filedAt: '2026-05-16',
      datasetSchema: LEGACY_DATASET_SCHEMA,
    });
    assert.equal(v1.values.INVESTMENTS_IN_ASSOCIATES_AND_JOINT_VENTURES, undefined);
    assert.equal(v1.issues.some((i) => i.code === 'LINE_ITEM_REQUIRES_DATASET_SCHEMA_V2' && i.severity === 'ERROR'), true);
  });
});

describe('W07 — L-040 preservation and published W07 report verification', () => {
  test('L-040 remains RESOLVED: missing CURRENT_INVESTMENTS or PREFERENCE_CAPITAL withholds per-share intrinsic value rather than substituting zero', () => {
    for (const missingItem of ['CURRENT_INVESTMENTS', 'PREFERENCE_CAPITAL'] as const) {
      const base = techDataset();
      const dataset = {
        ...base,
        periods: base.periods.map((period) => {
          const values = { ...period.values } as Record<string, unknown>;
          delete values[missingItem];
          return { ...period, values } as typeof period;
        }),
      };
      const { payload } = assessCompany(techAssessmentInput({ dataset }));
      const dcf = payload.valuation.methods.find((m) => m.methodId === 'DCF_FCFF')!;
      assert.equal(dcf.output!.perShareMid.presence, 'NOT_COMPUTABLE');
      assert.equal(payload.valuation.intrinsic, null);
      const grid = payload.valuation.sensitivity[0]!;
      assert.equal(grid.withheld?.presence, 'NOT_COMPUTABLE');
      assert.equal(grid.points.every((point) => point.value === null), true);
    }

    // Committed KEC L-040 corrected payload digest remains unchanged:
    const kecCorrectedPayload = readFileSync(
      join(ROOT, 'evidence/real-issuer/WI8-INDUSTRIALS-KEC-2026-11-07/artifact/assessment-payload-kec-wi8-l040-corrected.json'),
    );
    assert.equal(sha256(kecCorrectedPayload), 'fc50c53e08814d7851d7b9bb569ddf1eb4eec19ad7508c3c16db9b13a943f370');
  });

  test('published W07 report records authoritative dispositions and preserves W05 and L-040', () => {
    const report = readFileSync(
      join(ROOT, 'docs/integration/W07-FINANCIAL-LIMITATION-RESOLUTION-2026-11-12.md'),
      'utf8',
    );
    assert.match(report, /\*\*`L-038`\*\*[^\n]*\*\*`UNRESOLVED_PENDING_EXTERNAL_EVIDENCE`\*\*/);
    assert.match(report, /\*\*`L-039`\*\*[^\n]*\*\*`UNRESOLVED_PENDING_EXTERNAL_EVIDENCE`\*\*/);
    assert.match(report, /\*\*`L-040`\*\*[^\n]*\*\*`RESOLVED`\*\*/);
    assert.match(report, /W05-ACTUAL-FINANCIAL-DATASET-QUALIFICATION-2026-11-12\.md/);
    assert.match(report, /Draft_MGT-7_-_FY25\.pdf/);
    assert.match(report, /in-capmkt-ent-2026-01-31\.xsd/);
  });
});
