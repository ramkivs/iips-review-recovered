/**
 * IID-6 — the company assessment surface, extended (AC-6.2, AC-6.3, AC-6.4, AC-6.5).
 *
 * These tests exist because the surface makes three claims that are easy to break silently:
 *
 *   1 an absent value is rendered with its reason and never as `0`, a blank or a dash (AC-6.3);
 *   2 sector reference intelligence is visually and structurally separate from issuer assessment, and links out
 *     (AC-6.4);
 *   3 the values a reader sees are the stored values — the page formats, and never computes (AC-6.2).
 *
 * A fourth claim is negative and equally important: the page has no control that could change what is stored.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { AssessmentEnvelope } from '../../api/investment';
import CompanyAssessmentPage from './CompanyAssessmentPage';
import { ASSESSMENT_ENVELOPE, ISSUER } from './iid6Fixtures';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/investment/company/:issuerId" element={<CompanyAssessmentPage />} />
        <Route path="/investment/candidate/:securityId" element={<p>candidate route</p>} />
        <Route path="/user-portfolios" element={<p>portfolios route</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function stub(handler: (url: string) => Response) {
  const mock = vi.fn(async (url: string) => handler(String(url)));
  vi.stubGlobal('fetch', mock);
  return mock;
}

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fundamentals are read from the stored payload, not reconstructed', () => {
  it('renders each reported and derived value with its period', async () => {
    stub(() => jsonOk(ASSESSMENT_ENVELOPE));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    expect(await screen.findByRole('heading', { name: /Aarav Systems Limited/ })).toBeInTheDocument();
    const section = document.getElementById('fundamentals') as HTMLElement;
    expect(within(section).getByText(/Period ending 2026-03-31/)).toBeInTheDocument();
    expect(within(section).getByText('REVENUE_FROM_OPERATIONS')).toBeInTheDocument();
    // `formatNumber` uses en-IN grouping; the value itself is exactly the stored one.
    expect(within(section).getAllByText(/6,12,00,00,000/).length).toBeGreaterThan(0);
    expect(within(section).getByText('EBIT')).toBeInTheDocument();
    expect(within(section).getByText(/revenueCagr3y/)).toBeInTheDocument();
  });

  it('prints every absent value as `not available — <reason>` and never as a zero', async () => {
    stub(() => jsonOk(ASSESSMENT_ENVELOPE));
    const { container } = renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const text = container.textContent ?? '';
    // The payload's own reason reaches the reader.
    expect(text).toContain('not available — NOT_REPORTED');
    expect(text).toContain('not available — NOT_COMPUTABLE');
    expect(text).toContain('not available — NOT_APPLICABLE');
    // A missing cash-flow line is not turned into a zero.
    expect(text).not.toMatch(/CASH_FROM_OPERATIONS\s*0\b/);
    // No cell in the fundamentals table is a bare dash.
    const fundamentals = document.getElementById('fundamentals') as HTMLElement;
    for (const cell of [...fundamentals.querySelectorAll('td')]) {
      expect((cell.textContent ?? '').trim()).not.toBe('—');
      expect((cell.textContent ?? '').trim()).not.toBe('-');
    }
  });

  it('reports an absent fundamentals block as absent, rather than as empty periods', async () => {
    const withoutFundamentals = JSON.parse(JSON.stringify(ASSESSMENT_ENVELOPE)) as Record<string, unknown>;
    delete (withoutFundamentals.assessment as Record<string, unknown>).fundamentals;
    stub(() => jsonOk(withoutFundamentals));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const section = document.getElementById('fundamentals') as HTMLElement;
    expect(within(section).getByText(/not available — this stored version carries no fundamental period block/)).toBeInTheDocument();
  });
});

describe('confidence, assumptions and risk are shown with their qualifiers', () => {
  it('shows the components, every applied cap and the formula in force', async () => {
    stub(() => jsonOk(ASSESSMENT_ENVELOPE));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const section = document.getElementById('confidence') as HTMLElement;
    expect(within(section).getByText('Data confidence')).toBeInTheDocument();
    expect(within(section).getByText('0.8500')).toBeInTheDocument();
    expect(within(section).getByText('STALE_DATA')).toBeInTheDocument();
    expect(within(section).getByText('DILUTION_PROXY')).toBeInTheDocument();
    expect(within(section).getByText(/combined = 0.6/)).toBeInTheDocument();
  });

  it('shows the discount-rate components and the method-specific assumptions verbatim', async () => {
    stub(() => jsonOk(ASSESSMENT_ENVELOPE));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const section = document.getElementById('assumptions') as HTMLElement;
    expect(within(section).getByText('riskFree')).toBeInTheDocument();
    expect(within(section).getByText(/DCF_FCFF assumptions/)).toBeInTheDocument();
    expect(within(section).getByText('valuation-policy/1.0.0')).toBeInTheDocument();
  });

  it('D-3: shows evaluation completeness separately from the disposition, and names a blocked dimension', async () => {
    const base = structuredClone(ASSESSMENT_ENVELOPE) as AssessmentEnvelope;
    const withEvaluation: AssessmentEnvelope = {
      ...base,
      assessment: {
        ...base.assessment,
        risk: {
          factors: [],
          aggregate: { value: null, presence: 'NOT_COMPUTABLE', reason: 'RISK_EVALUATION_PARTIAL' },
          evaluation: {
            dimensions: [
              {
                dimensionId: 'FINANCIAL_LEVERAGE',
                category: 'FINANCIAL',
                status: 'NOT_EVALUABLE',
                measurement: { value: null, presence: 'NOT_COMPUTABLE', reason: 'NOT_REPORTED' },
                threshold: 'concern at net debt / EBITDA ≥ 3.00×',
                factorId: null,
                unavailableInputs: ['fundamentals.capitalStructure.netDebt'],
                statement: 'Not evaluated: NOT_REPORTED for fundamentals.capitalStructure.netDebt.',
              },
              {
                dimensionId: 'EARNINGS_QUALITY_CASH_CONVERSION',
                category: 'EARNINGS_QUALITY',
                status: 'PASSED',
                measurement: { value: 0.961, presence: 'PRESENT' },
                threshold: 'concern below 80% operating cash flow / net profit (severity 4 below 50%)',
                factorId: null,
                unavailableInputs: [],
                statement: 'Operating cash flow covers 96% of reported profit, at or above the 80% policy floor.',
              },
            ],
            counts: { applicable: 3, evaluated: 2, passed: 2, concerns: 0, notEvaluable: 1, notApplicable: 2 },
            completeness: 'PARTIAL',
            disposition: 'INDETERMINATE',
            note: '2 of 3 applicable risk dimensions were evaluated and 1 could not be.',
          },
        },
      },
    };
    stub(() => jsonOk(withEvaluation));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const section = document.getElementById('risk') as HTMLElement;
    // Completeness and disposition are two separate statements, never one word standing for both.
    expect(within(section).getByText('PARTIAL')).toBeInTheDocument();
    expect(within(section).getByText('INDETERMINATE')).toBeInTheDocument();
    // A blocked dimension keeps its own reason and names the input that blocked it...
    expect(within(section).getByText('NOT_EVALUABLE')).toBeInTheDocument();
    expect(within(section).getByText(/not available — NOT_REPORTED/)).toBeInTheDocument();
    expect(within(section).getByText(/blocked by fundamentals.capitalStructure.netDebt/)).toBeInTheDocument();
    // ...and a dimension that passed is still visibly a pass, with its measurement.
    expect(within(section).getByText('PASSED')).toBeInTheDocument();
    expect(within(section).getByText('0.961')).toBeInTheDocument();
  });

  it('D-3: a version stored before per-dimension reporting says so instead of implying a pass', async () => {
    stub(() => jsonOk(ASSESSMENT_ENVELOPE));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const section = document.getElementById('risk') as HTMLElement;
    expect(within(section).getByText(/produced before per-dimension risk reporting existed/)).toBeInTheDocument();
    expect(within(section).getByText(/not available — not published in this version/)).toBeInTheDocument();
  });

  it('groups risk factors by their declared category and keeps the summary counts', async () => {
    stub(() => jsonOk(ASSESSMENT_ENVELOPE));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const section = document.getElementById('risk') as HTMLElement;
    expect(within(section).getByText('EARNINGS_QUALITY')).toBeInTheDocument();
    expect(within(section).getByText(/Receivables growth outpaced revenue growth/)).toBeInTheDocument();
    expect(within(section).getByText(/aggregate risk 3.1/)).toBeInTheDocument();
  });
});

describe('sector reference intelligence is contained (C-2, AC-6.4)', () => {
  it('renders in its own labelled aside, outside the assessment sections, with a link out', async () => {
    stub(() => jsonOk(ASSESSMENT_ENVELOPE));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const aside = document.querySelector('aside[data-disclosure="sector-reference"]') as HTMLElement;
    expect(aside).not.toBeNull();
    expect(within(aside).getByRole('heading', { name: /Sector-level reference intelligence/i })).toBeInTheDocument();
    expect(within(aside).getByText(/not company-specific analysis of this issuer/)).toBeInTheDocument();
    expect(within(aside).getByText(/not an input to any disposition/)).toBeInTheDocument();

    // It links to the existing sector view, using the sector name, not an issuer-specific hierarchy.
    const link = within(aside).getByRole('link', { name: /Open the Technology sector reference view/i });
    expect(link).toHaveAttribute('href', '/research/company/Technology');

    // The sector composite value appears ONLY inside the disclosure: it is not blended into the assessment.
    const composite = '61.4';
    const occurrences = [...document.querySelectorAll('body *')].filter(
      (element) => element.children.length === 0 && (element.textContent ?? '').includes(composite),
    );
    expect(occurrences.length).toBeGreaterThan(0);
    for (const element of occurrences) {
      expect(aside.contains(element)).toBe(true);
    }
  });

  it('renders no sector block at all when the payload carries none', async () => {
    const withoutSector = JSON.parse(JSON.stringify(ASSESSMENT_ENVELOPE)) as Record<string, unknown>;
    (withoutSector.assessment as Record<string, unknown>).sectorReferenceView = null;
    stub(() => jsonOk(withoutSector));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    expect(document.querySelector('aside[data-disclosure="sector-reference"]')).toBeNull();
  });
});

describe('the version selector changes which stored version is read', () => {
  it('requests exactly the selected version and re-renders it', async () => {
    const v1Envelope = JSON.parse(JSON.stringify(ASSESSMENT_ENVELOPE)) as typeof ASSESSMENT_ENVELOPE;
    v1Envelope.version = { ...v1Envelope.version, reportId: 'r-1', artifactVersion: 1 };
    const fetchMock = stub((url) => jsonOk(url.includes('/versions/r-1') ? v1Envelope : ASSESSMENT_ENVELOPE));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`/api/investment/company/${encodeURIComponent(ISSUER)}`);
    expect(screen.getByRole('button', { name: 'v2' })).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'v1' }));
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/versions/r-1'))).toBe(true);
    // The selector reflects the version actually read, not the one clicked.
    expect(await screen.findByRole('button', { name: 'v1' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Viewing v1/)).toBeInTheDocument();
  });
});

describe('degraded states are sanitized and substitute nothing', () => {
  it('renders fixed copy for a 404 and no assessment sections', async () => {
    stub(() => new Response(JSON.stringify({ error: 'investment-assessment-missing' }), { status: 404 }));
    const { container } = renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    expect(await screen.findByRole('alert')).toHaveTextContent(/No stored assessment exists/);
    expect(container.querySelectorAll('table')).toHaveLength(0);
    expect(container.textContent).toContain('no cached assessment');
  });

  it('never echoes a server body or a filesystem path into the DOM', async () => {
    stub(
      () =>
        new Response(
          JSON.stringify({ error: 'investment-persistence-unavailable', detail: '/srv/data/investment.db SELECT 1' }),
          { status: 503 },
        ),
    );
    const { container } = renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('alert');
    expect(container.textContent).not.toContain('/srv');
    expect(container.textContent).not.toContain('SELECT');
  });

  it('refuses a payload that does not carry the assessment sections', async () => {
    stub(() => jsonOk({ status: 'OK', scope: {}, version: {}, versions: [] }));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not be read because the response was not recognised/);
  });
});

describe('the only controls are read selectors', () => {
  it('offers no form control and no write affordance anywhere on the page', async () => {
    stub(() => jsonOk(ASSESSMENT_ENVELOPE));
    const { container } = renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    expect(container.querySelectorAll('input, select, textarea, form, [contenteditable="true"]')).toHaveLength(0);
    for (const button of screen.getAllByRole('button')) {
      expect(button.textContent).toMatch(/^v\d+$/);
    }
  });

  it('explains why no disposition is shown when no portfolio context was supplied', async () => {
    stub(() => jsonOk(ASSESSMENT_ENVELOPE));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const section = document.getElementById('disposition') as HTMLElement;
    expect(within(section).getByText(/No disposition is shown here because no portfolio and security context was supplied/)).toBeInTheDocument();
    // No verb is invented for a context-free company page.
    expect(section.textContent).not.toMatch(/\bACCUMULATE\b|\bAVOID_CANDIDATE\b/);
  });
});

describe('L-034/L-036 — the assessment surface shows what the valuation rests on', () => {
  it('renders the enterprise-to-equity treatment, its policy version and the substituted input', async () => {
    stub(() => jsonOk(ASSESSMENT_ENVELOPE));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const section = document.getElementById('valuation') as HTMLElement;
    expect(within(section).getByRole('heading', { name: /Enterprise-to-equity bridge/ })).toBeInTheDocument();
    expect(within(section).getByText('POLICY_ZERO_UNAVAILABLE')).toBeInTheDocument();
    expect(within(section).getByText('associates-treatment/1.0.0')).toBeInTheDocument();
    expect(within(section).getByText(/associatesAndJV \(POLICY_ZERO; NOT_COMPUTABLE: NOT_REPORTED\)/)).toBeInTheDocument();
    // The sentence that stops a reader mistaking the zero for an issuer nil is on the page, not just in the payload.
    expect(
      within(section).getByText(/This is a policy substitution, not an issuer-reported nil: equity value is understated/),
    ).toBeInTheDocument();
  });

  it('lists the policy-default caps as declared and NOT applied, separately from the caps applied', async () => {
    stub(() => jsonOk(ASSESSMENT_ENVELOPE));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const section = document.getElementById('confidence') as HTMLElement;
    const declared = within(section).getByRole('heading', { name: /Caps declared but not applied/ });
    expect(declared).toBeInTheDocument();
    expect(within(section).getByText('POLICY_DEFAULT_WACC')).toBeInTheDocument();
    expect(within(section).getByText('POLICY_DEFAULT_MULTIPLE')).toBeInTheDocument();
    expect(within(section).getAllByText(/factor not set in policy/).length).toBe(2);
    expect(within(section).getAllByText(/DCF_FCFF\/discountRate/).length).toBe(1);

    // The applied list still says exactly what was applied, and nothing else.
    const capsApplied = within(section).getByRole('heading', { name: /Caps applied/ });
    const appliedList = capsApplied.nextElementSibling as HTMLElement;
    expect(appliedList.textContent).toContain('STALE_DATA');
    expect(appliedList.textContent).not.toContain('POLICY_DEFAULT_WACC');
  });

  it('does not turn a missing disclosure into a zero or a blank (AC-6.3)', async () => {
    const withoutDisclosure = JSON.parse(JSON.stringify(ASSESSMENT_ENVELOPE)) as typeof ASSESSMENT_ENVELOPE;
    const payload = withoutDisclosure.assessment as {
      fundamentals?: { capitalStructure?: Record<string, unknown> };
      confidence: Record<string, unknown>;
    };
    delete payload.fundamentals?.capitalStructure?.equityBridge;
    delete payload.confidence.assumptionCaps;
    stub(() => jsonOk(withoutDisclosure));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const valuation = document.getElementById('valuation') as HTMLElement;
    expect(within(valuation).getByText(/no enterprise-to-equity disclosure/)).toBeInTheDocument();
    const confidence = document.getElementById('confidence') as HTMLElement;
    expect(within(confidence).getByText(/No unapplied cap is declared on this version/)).toBeInTheDocument();
  });
});

describe('valuation wire contract', () => {
  it('renders stored low, mid and high observations and numeric sensitivity cells', async () => {
    stub(() => jsonOk(ASSESSMENT_ENVELOPE));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);
    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const valuation = document.getElementById('valuation') as HTMLElement;
    expect(within(valuation).getByText(/per share low 2,380 · mid 2,640 · high 2,900/)).toBeInTheDocument();
    expect(within(valuation).getByText('2,790')).toBeInTheDocument();
  });

  it('does not present withheld conversion results or diagnostic enterprise values as per-share values', async () => {
    const envelope = structuredClone(ASSESSMENT_ENVELOPE) as unknown as any;
    envelope.assessment.valuation.methods[0].output.perShareMid = { value: null, presence: 'NOT_COMPUTABLE', reason: 'NOT_REPORTED' };
    envelope.assessment.valuation.sensitivity = [{
      methodId: 'DCF_FCFF', baseWaccBps: 1068, baseGrowthBps: 400,
      withheld: { presence: 'NOT_COMPUTABLE', reason: 'NOT_REPORTED', note: 'bridge unavailable' },
      points: [{ waccBps: 1000, growthBps: 400, value: 1234567, enterpriseValue: 987654321 }],
    }];
    stub(() => jsonOk(envelope));
    renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);
    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const valuation = document.getElementById('valuation') as HTMLElement;
    expect(within(valuation).getByText(/mid not available — NOT_REPORTED/)).toBeInTheDocument();
    expect(within(valuation).getByText(/withheld: NOT_REPORTED — bridge unavailable/)).toBeInTheDocument();
    expect(within(valuation).getByText('not available — withheld — NOT_REPORTED')).toBeInTheDocument();
    expect(valuation.textContent).not.toContain('987654321');
    expect(valuation.textContent).not.toContain('12,34,567');
  });
});
