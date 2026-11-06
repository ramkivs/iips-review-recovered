/**
 * IID-3 — the thin assessment view.
 *
 * What these tests are for: the view must show what qualifies an assessment, and must not offer anything that
 * looks like a decision. So they assert both presence (identity, adequacy, missing-value reasons, withheld
 * methods, evidence, version history, limitation disclosures) and ABSENCE (no order, trade, disposition or
 * change-intelligence affordance; no server prose on failure).
 */
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import CompanyAssessmentPage from './CompanyAssessmentPage';
import { ASSESSMENT_UNAVAILABLE_COPY } from '../../api/investment';

const ISSUER = 'IN:EQISIN:IN0000000201';

function observation(value: number | null, reason?: string) {
  return value === null
    ? { value: null, presence: 'MISSING' as const, reason }
    : { value, presence: 'PRESENT' as const };
}

function version(reportId: string, artifactVersion: number) {
  return {
    reportId,
    artifactVersion,
    supersedesReportId: artifactVersion === 1 ? null : 'r-1',
    generatedAt: `2026-11-0${artifactVersion}T00:00:00.000Z`,
    reportKey: 'a'.repeat(64),
    payloadDigest: `${artifactVersion}`.repeat(64).slice(0, 64),
    inputDigest: `sha256:${'b'.repeat(64)}`,
    dataAsOf: '2026-06-30',
    knownAsOf: '2026-07-23T17:44:46Z',
    datasetVersion: 'sha256:' + 'c'.repeat(64),
    contentDigest: 'sha256:' + 'd'.repeat(64),
    modelVersion: 'assessment-engine-1.0.0',
    policyVersion: 'valuation-policy-1.0.0',
    adequacy: 'PARTIAL',
    qualityVerdict: 'MINOR_CONCERNS',
    confidence: 0.5609,
    evidenceCount: 2,
    limitationCount: 1,
    datasetClass: 'SYNTHETIC_REFERENCE',
  };
}

const ENVELOPE = {
  status: 'OK',
  reportType: 'investment.company-assessment',
  scope: { scopeToken: `co:${ISSUER}`, reportKey: 'a'.repeat(64), chainRootReportId: 'r-1', versionCount: 2 },
  version: version('r-2', 2),
  versions: [version('r-1', 1), version('r-2', 2)],
  assessment: {
    schemaVersion: 1,
    artifact: {
      kind: 'CompanyAssessment',
      subjectScope: `hc:${ISSUER}`,
      modelVersion: 'assessment-engine-1.0.0',
      policyVersion: 'valuation-policy-1.0.0',
      generatedAt: '2026-11-06T00:00:00.000Z',
    },
    subject: {
      issuerId: ISSUER,
      legalName: 'Chandra Meridian Bank Limited (synthetic)',
      sector: 'Banking',
      sectorSubsegment: 'Private bank',
      reportingCurrency: 'INR',
      fiscalYearEnd: '03-31',
      identity: {
        bindingRef: 'binding-1',
        rosterVersion: 'sha256:aaaa1111bbbb2222',
        listingMapVersion: 'sha256:cccc3333dddd4444',
        corporateActionTableVersion: 'sha256:eeee5555ffff6666',
      },
    },
    asOf: {
      generatedAt: '2026-11-06T00:00:00.000Z',
      dataAsOf: '2026-06-30',
      knownAsOf: '2026-07-23T17:44:46Z',
      stalenessDays: 104,
      staleBeyondPolicy: true,
    },
    data: {
      datasetVersion: 'sha256:' + 'c'.repeat(64),
      contentDigest: 'sha256:' + 'd'.repeat(64),
      provider: 'iid3-m1-synthetic-reference',
      series: { statementScope: 'CONSOLIDATED', annualPeriods: 5 },
    },
    completeness: {
      requiredFieldCoveragePct: 82.5,
      adequacy: 'PARTIAL',
      adequacyBasis: ['cash-flow coverage below the required threshold'],
      missingFields: [
        { field: 'CASH_FROM_OPERATIONS', reason: 'NOT_REPORTED', periodEnd: '2026-03-31' },
        { field: 'RESTRICTED_CASH', reason: 'NOT_COMPUTABLE', periodEnd: '2026-03-31' },
      ],
    },
    quality: {
      verdict: 'MINOR_CONCERNS',
      flags: [{ code: 'OPERATING_METRIC_UNVALIDATED', detail: 'NIM not corroborated' }],
    },
    valuation: {
      methodSelection: {
        sector: 'Banking',
        considered: [{ methodId: 'DCF_FCFF', role: 'NOT_APPLICABLE', reason: 'banking sector excludes FCFF' }],
      },
      methods: [
        { methodId: 'JUSTIFIED_PB', role: 'PRIMARY', applicable: true, notApplicableReason: null, output: { perShare: 74.29 } },
        {
          methodId: 'DIVIDEND_DISCOUNT',
          role: 'SECONDARY',
          applicable: true,
          notApplicableReason: 'NET_DEBT_TO_EBITDA_UNAVAILABLE',
          output: null,
        },
      ],
      intrinsic: {
        currency: 'INR',
        perShare: { low: observation(63.14), mid: observation(74.29), high: observation(85.43) },
        spreadPct: observation(18.4),
        withheld: null,
      },
      marginOfSafety: {
        price: observation(70.1),
        priceAsOf: '2026-07-23',
        mosVsMid: observation(5.6),
        mosVsLow: observation(9.9),
        band: 'FAIR',
        refusal: null,
      },
      sensitivity: [
        {
          methodId: 'JUSTIFIED_PB',
          baseWaccBps: 1200,
          baseGrowthBps: 500,
          points: [
            { waccBps: 1100, growthBps: 500, value: observation(80.1) },
            { waccBps: 1200, growthBps: 500, value: observation(74.29) },
          ],
        },
      ],
    },
    risk: {
      factors: [
        {
          riskId: 'RISK-1',
          category: 'EARNINGS_QUALITY',
          severity: 3,
          likelihood: 2,
          status: 'ONGOING',
          statement: 'Provision coverage below peer median',
        },
      ],
      aggregate: observation(3.1),
    },
    dividends: {
      verdict: 'INSUFFICIENT_EVIDENCE',
      payoutRatio: observation(22.4),
      fcfCoverage: observation(null, 'NOT_COMPUTABLE'),
      netDebtToEbitda: observation(null, 'NOT_APPLICABLE'),
      consecutiveYearsPaid: 4,
      conflict: null,
      withheld: { unmetInputs: ['NET_DEBT_TO_EBITDA'] },
    },
    moat: {
      classification: 'NARROW',
      roicWaccSpread: { spread: observation(4.2), consecutiveYearsPositive: 3 },
      withheld: null,
    },
    confidence: { dataConfidence: 0.71, modelConfidence: 0.45, combined: 0.5609 },
    assumptions: {
      discountRate: { value: 0.12, basis: 'WACC_DERIVED' },
      terminalGrowth: 0.05,
      forecastHorizonYears: 5,
      policyVersion: 'valuation-policy-1.0.0',
    },
    sectorReferenceView: {
      evidenceClass: 'SECTOR_REFERENCE',
      sectorRefId: 'Banking-H1',
      engineVerdict: 'NEUTRAL',
      composite: 52.3,
      note: 'sector context only; it cannot drive the figures above',
    },
    evidence: [
      {
        evidenceId: 'EV-1',
        claim: 'Net interest margin 3.4%',
        supports: ['fundamentals.annual.0'],
        source: { kind: 'FILING', ref: 'filing-1', filedAt: '2026-05-10T18:00:00Z' },
        observationRefs: ['obs-1'],
      },
    ],
    limitations: ['Bank-specific dividend policy is not yet defined (L-005).'],
    disclosure: { decisionSupportOnly: true, noTradeExecution: true, nonProduction: true },
  },
  disclosures: {
    decisionSupportOnly: true,
    noTradeExecution: true,
    nonProduction: true,
    datasetNotice: 'Assessment inputs are operator-supplied.',
  },
  limitations: [
    'L-001',
    'L-002',
    'L-003',
    'L-004',
    'L-005',
    'L-006',
    'L-007',
    'L-008',
    'L-009',
    'L-010',
    'L-011',
    'L-012',
    'L-013',
  ],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={[`/investment/company/${encodeURIComponent(ISSUER)}`]}>
      <Routes>
        <Route path="/investment/company/:issuerId" element={<CompanyAssessmentPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function stubFetch(handler: (url: string) => Response): ReturnType<typeof vi.fn> {
  const mock = vi.fn(async (url: string) => handler(url));
  vi.stubGlobal('fetch', mock);
  return mock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the view shows what qualifies an assessment', () => {
  it('renders identity, adequacy, provenance and both dataset clocks', async () => {
    stubFetch(() => new Response(JSON.stringify(ENVELOPE), { status: 200 }));
    renderPage();

    expect(await screen.findByRole('heading', { name: /Chandra Meridian Bank/i })).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(ISSUER)).length).toBeGreaterThan(0);
    expect(screen.getByText(/adequacy PARTIAL/)).toBeInTheDocument();
    expect(screen.getByText(/data quality MINOR_CONCERNS/)).toBeInTheDocument();
    expect(screen.getByText(/confidence 0\.5609/)).toBeInTheDocument();
    // `dataAsOf` appears on the header and in the version line; both are the same stored value.
    expect(screen.getAllByText(/dataAsOf 2026-06-30/).length).toBeGreaterThan(0);
    expect(screen.getByText(/knownAsOf 2026-07-23T17:44:46Z/)).toBeInTheDocument();
    expect(screen.getByText(/assessment-engine-1\.0\.0/)).toBeInTheDocument();
    expect(screen.getByText(/SYNTHETIC_REFERENCE/)).toBeInTheDocument();
  });

  it('shows every missing value with its reason, and every withheld method with its reason', async () => {
    stubFetch(() => new Response(JSON.stringify(ENVELOPE), { status: 200 }));
    renderPage();

    await screen.findByRole('heading', { name: /Chandra Meridian Bank/i });
    expect(screen.getByText('CASH_FROM_OPERATIONS')).toBeInTheDocument();
    expect(screen.getByText('NOT_REPORTED')).toBeInTheDocument();
    expect(screen.getByText('RESTRICTED_CASH')).toBeInTheDocument();
    expect(screen.getByText('NOT_COMPUTABLE')).toBeInTheDocument();
    expect(screen.getByText(/withheld: NET_DEBT_TO_EBITDA_UNAVAILABLE/)).toBeInTheDocument();
    // A missing dividend input is never rendered as a zero.
    expect(screen.getAllByText(/NOT_COMPUTABLE/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/fcf coverage 0\b/)).toBeNull();
  });

  it('shows the valuation, sensitivity, risk, dividend and moat blocks and the evidence list', async () => {
    stubFetch(() => new Response(JSON.stringify(ENVELOPE), { status: 200 }));
    renderPage();

    await screen.findByRole('heading', { name: /Chandra Meridian Bank/i });
    expect(screen.getByText(/intrinsic per share \(INR\) low 63\.14/)).toBeInTheDocument();
    expect(screen.getByText(/band FAIR/)).toBeInTheDocument();
    expect(screen.getByText(/JUSTIFIED_PB · base WACC 1200bps/)).toBeInTheDocument();
    expect(screen.getByText(/severity 3/)).toBeInTheDocument();
    expect(screen.getByText(/verdict INSUFFICIENT_EVIDENCE/)).toBeInTheDocument();
    expect(screen.getByText(/classification NARROW/)).toBeInTheDocument();
    expect(screen.getByText(/EV-1/)).toBeInTheDocument();
    expect(screen.getByText(/Net interest margin 3\.4%/)).toBeInTheDocument();
    expect(screen.getByText(/Banking-H1/)).toBeInTheDocument();
  });

  it('discloses the limitations, including the carried-forward IID-0/IID-2 ones', async () => {
    stubFetch(() => new Response(JSON.stringify(ENVELOPE), { status: 200 }));
    renderPage();

    await screen.findByRole('heading', { name: /Chandra Meridian Bank/i });
    expect(screen.getByText(/3 of 13 sectors/)).toBeInTheDocument();
    expect(screen.getByText(/No real issuer has been assessed/)).toBeInTheDocument();
    expect(screen.getByText(/SOTP is not implemented/)).toBeInTheDocument();
    expect(screen.getAllByText(/NET_DEBT_TO_EBITDA_UNAVAILABLE/).length).toBeGreaterThan(0);
  });

  it('lets the reader switch to a stored version and reads exactly that version', async () => {
    const fetchMock = stubFetch(() => new Response(JSON.stringify(ENVELOPE), { status: 200 }));
    renderPage();

    await screen.findByRole('heading', { name: /Chandra Meridian Bank/i });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`/api/investment/company/${encodeURIComponent(ISSUER)}`);

    await userEvent.click(screen.getByRole('button', { name: 'v1' }));
    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/versions/r-1'))).toBe(true);
    });
  });
});

describe('the view offers no decision affordance', () => {
  /**
   * IID-6 CHANGED WHAT THIS TEST MAY ASSERT, AND THIS IS THE HONEST VERSION OF IT. The surface now legitimately
   * renders a disposition panel and a change timeline — the phase exists to put them together — so banning the
   * substring "dispos" would ban the requirement. What must never appear is a WRITE affordance or an execution
   * instruction: no form control, no button that could persist anything, and no buy/sell/order-ticket language.
   * "no order, quantity or price is published here" is a disclosure, not an affordance, and is asserted as present.
   */
  it('renders no write control and no execution language, only read selectors', async () => {
    stubFetch(() => new Response(JSON.stringify(ENVELOPE), { status: 200 }));
    const { container } = renderPage();
    await screen.findByRole('heading', { name: /Chandra Meridian Bank/i });

    // The only buttons are the version selector: the timeline could not be read here, so it adds none.
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual(['v1', 'v2']);
    expect(container.querySelectorAll('input, select, textarea, form')).toHaveLength(0);
    const text = (container.textContent ?? '').toLowerCase();
    for (const forbidden of ['buy', 'sell', 'place order', 'trade now', 'recommend', 'add to portfolio']) {
      expect(text).not.toContain(forbidden);
    }
    expect(text).toContain('no order, quantity or price is published here');
    expect(screen.queryByRole('link', { name: /generate|create|append|publish|save|record|submit/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /generate|create|append|publish|save|record|submit/i })).toBeNull();
  });
});

describe('failures are explained without leaking', () => {
  it('shows fixed copy for an unavailable boundary, and none of the server body', async () => {
    stubFetch(
      () =>
        new Response(
          JSON.stringify({
            error: 'investment-persistence-unavailable',
            detail: { reason: '/srv/data/investment.db SELECT * FROM governed_artifacts' },
          }),
          { status: 503 },
        ),
    );
    const { container } = renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(ASSESSMENT_UNAVAILABLE_COPY['persistence-unavailable']);
    expect(container.textContent).not.toContain('/srv');
    expect(container.textContent).not.toContain('SELECT');
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('shows fixed copy for an integrity failure rather than an empty assessment', async () => {
    stubFetch(() => new Response(JSON.stringify({ error: 'investment-artifact-integrity-failure' }), { status: 503 }));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(ASSESSMENT_UNAVAILABLE_COPY['integrity-failure']);
    expect(screen.queryByRole('heading', { name: /assessment adequacy/i })).toBeNull();
  });
});
