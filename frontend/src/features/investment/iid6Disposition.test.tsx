/**
 * IID-6 — the disposition panel (AC-6.7, and the held/candidate asymmetry that makes it honest).
 *
 * The three claims under test:
 *
 *   1 a held disposition shows the verb, its definition, confidence, the rationale for and against, the falsifiers,
 *     the limits in force and the portfolio implication measured against a real position;
 *   2 a candidate shows NO quantity, NO current weight and NO projected weight — the payload says
 *     `NOT_APPLICABLE` and the panel repeats that reason instead of printing a zero;
 *   3 a withheld verb is rendered as withheld with its reasons and unmet inputs, and a missing record is rendered as
 *     missing, with no verb inferred in either case.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import DispositionPanel from './DispositionPanel';
import CandidateAssessmentPage from './CandidateAssessmentPage';
import CompanyAssessmentPage from './CompanyAssessmentPage';
import {
  ASSESSMENT_ENVELOPE,
  CANDIDATE_DISPOSITION_ENVELOPE,
  DISPOSITION_ENVELOPE,
  ISSUER,
  PORTFOLIO,
  SECURITY,
  WITHHELD_DISPOSITION_ENVELOPE,
} from './iid6Fixtures';

function stub(handler: (url: string) => Response) {
  const mock = vi.fn(async (url: string) => handler(String(url)));
  vi.stubGlobal('fetch', mock);
  return mock;
}

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

function renderPanel(ui: JSX.Element) {
  return render(
    <MemoryRouter>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('a held disposition is rendered with everything that qualifies it', () => {
  it('shows the verb, definition, confidence and horizon from the stored payload', async () => {
    stub(() => jsonOk(DISPOSITION_ENVELOPE));
    renderPanel(<DispositionPanel kind="held" portfolioId={PORTFOLIO} securityId={SECURITY} />);

    const section = await screen.findByRole('region', { name: /Disposition/i });
    expect(within(section).getByText('HELD POSITION')).toBeInTheDocument();
    expect(within(section).getByText('AVOID')).toBeInTheDocument();
    expect(within(section).getByText(/confidence 0\.6740/)).toBeInTheDocument();
    expect(within(section).getByText(/horizon SHORT_TERM/)).toBeInTheDocument();
    expect(within(section).getByText(/not an instruction to sell/)).toBeInTheDocument();
    // The assessment the verb cites is named, with both of its clocks.
    expect(within(section).getByText(/dataAsOf 2026-06-30/)).toBeInTheDocument();
    expect(within(section).getByText(/knownAsOf 2026-07-23T17:44:46Z/)).toBeInTheDocument();
  });

  it('shows the rationale for and against, with directions in words', async () => {
    stub(() => jsonOk(DISPOSITION_ENVELOPE));
    renderPanel(<DispositionPanel kind="held" portfolioId={PORTFOLIO} securityId={SECURITY} />);

    await screen.findByRole('region', { name: /Disposition/i });
    expect(screen.getByText(/Quality verdict is MATERIAL_CONCERNS/)).toBeInTheDocument();
    expect(screen.getByText('COUNTERS')).toBeInTheDocument();
    expect(screen.getByText('SUPPORTS')).toBeInTheDocument();
    expect(screen.getByText(/Moat classification is WIDE/)).toBeInTheDocument();
  });

  it('shows the falsifiers, gates and the limits in force including a breached limit', async () => {
    stub(() => jsonOk(DISPOSITION_ENVELOPE));
    renderPanel(<DispositionPanel kind="held" portfolioId={PORTFOLIO} securityId={SECURITY} />);

    await screen.findByRole('region', { name: /Disposition/i });
    expect(screen.getByText(/margin-of-safety move across the policy threshold/)).toBeInTheDocument();
    expect(screen.getByText('G-1_IDENTITY')).toBeInTheDocument();
    expect(screen.getAllByText(/SYSTEM_DEFAULT/).length).toBeGreaterThan(0);
    expect(screen.getByText(/single-name cap 10%/)).toBeInTheDocument();
    expect(screen.getByText('SINGLE_NAME_MAX')).toBeInTheDocument();
    // measured 40% against a 10% cap, projected not asserted
    expect(screen.getByText(/no projected weight is asserted/)).toBeInTheDocument();
  });

  it('shows the portfolio context and the implication band basis without inventing a band', async () => {
    stub(() => jsonOk(DISPOSITION_ENVELOPE));
    renderPanel(<DispositionPanel kind="held" portfolioId={PORTFOLIO} securityId={SECURITY} />);

    await screen.findByRole('region', { name: /Disposition/i });
    expect(screen.getByText(/revision 7/)).toBeInTheDocument();
    expect(screen.getByText('Position weight')).toBeInTheDocument();
    expect(screen.getAllByText('40%').length).toBeGreaterThan(0);
    expect(screen.getByText(/no target band is asserted for this verb/)).toBeInTheDocument();
  });
});

describe('a withheld disposition is a stated outcome, not an empty verb', () => {
  it('renders the reasons and unmet inputs, and no verb badge', async () => {
    stub(() => jsonOk(WITHHELD_DISPOSITION_ENVELOPE));
    const { container } = renderPanel(<DispositionPanel kind="held" portfolioId={PORTFOLIO} securityId={SECURITY} />);

    await screen.findByRole('region', { name: /Disposition/i });
    expect(screen.getByText(/Withheld — no verb was produced/)).toBeInTheDocument();
    expect(screen.getByText(/reasons: INSUFFICIENT_EVIDENCE/)).toBeInTheDocument();
    expect(screen.getByText(/unmet inputs: CASH_FROM_OPERATIONS, NET_DEBT_TO_EBITDA/)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\bACCUMULATE\b|\bREDUCE\b|\bAVOID\b/);
  });
});

describe('a missing disposition is reported as missing', () => {
  it('shows the not-recorded copy and the operator origin of every disposition', async () => {
    stub(() => new Response(JSON.stringify({ error: 'disposition-not-found' }), { status: 404 }));
    const { container } = renderPanel(<DispositionPanel kind="held" portfolioId={PORTFOLIO} securityId={SECURITY} />);

    expect(await screen.findByText(/No stored disposition exists for this holding or candidate/)).toBeInTheDocument();
    expect(screen.getByText(/produced by the operator CLI against a stored assessment/)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/\bACCUMULATE\b|\bAVOID\b|\bWATCH\b/);
  });

  it('shows fixed copy for an integrity failure and none of the server body', async () => {
    stub(
      () =>
        new Response(JSON.stringify({ error: 'disposition-integrity-failure', detail: '/srv/investment.db' }), {
          status: 503,
        }),
    );
    const { container } = renderPanel(<DispositionPanel kind="held" portfolioId={PORTFOLIO} securityId={SECURITY} />);

    expect(await screen.findByText(/failed validation and were withheld/)).toBeInTheDocument();
    expect(container.textContent).not.toContain('/srv');
  });
});

describe('a candidate is a different subject, not a held position with a different label', () => {
  it('never renders a quantity, a current weight or a projected weight for a candidate', async () => {
    stub(() => jsonOk(CANDIDATE_DISPOSITION_ENVELOPE));
    const { container } = renderPanel(<DispositionPanel kind="candidate" securityId={SECURITY} />);

    const section = await screen.findByRole('region', { name: /Candidate assessment/i });
    expect(within(section).getByText('CANDIDATE — no position')).toBeInTheDocument();
    expect(within(section).getByText('AVOID_CANDIDATE')).toBeInTheDocument();

    const text = container.textContent ?? '';
    // The payload's own reason for the absent weight is what the reader sees.
    expect(text).toContain('not available — NOT_APPLICABLE');
    expect(text).toContain('not available — POLICY_INPUTS_UNAVAILABLE');
    // No quantity row exists at all, and no "0%" is invented for a position that does not exist.
    expect(text).not.toContain('Average cost');
    expect(text).not.toContain('marketValue');
    expect(text).not.toMatch(/current weight \(candidate\)[^%]*0%/i);
    expect(text.toLowerCase()).toContain(
      'a candidate has no position, so no quantity, no portfolio weight and no projected weight exists',
    );
  });

  it('is reachable without a portfolio and issues a GET with no portfolio context', async () => {
    const fetchMock = stub(() => jsonOk(CANDIDATE_DISPOSITION_ENVELOPE));
    render(
      <MemoryRouter initialEntries={[`/investment/candidate/${encodeURIComponent(SECURITY)}`]}>
        <Routes>
          <Route path="/investment/candidate/:securityId" element={<CandidateAssessmentPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: /Candidate assessment/i });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(`/api/investment/candidate/${encodeURIComponent(SECURITY)}`);
    expect(init.method).toBe('GET');
    expect(url).not.toContain('portfolio=');
    expect(screen.getByText(/Reachable without a portfolio|A candidate is a security that is not held/)).toBeInTheDocument();
    expect(document.querySelectorAll('input, select, textarea, form')).toHaveLength(0);
  });

  it('states what the page cannot do, so absence of evidence is never read as a verdict', async () => {
    stub(() => jsonOk(CANDIDATE_DISPOSITION_ENVELOPE));
    render(
      <MemoryRouter initialEntries={[`/investment/candidate/${encodeURIComponent(SECURITY)}?portfolio=${PORTFOLIO}`]}>
        <Routes>
          <Route path="/investment/candidate/:securityId" element={<CandidateAssessmentPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: /Candidate assessment/i });
    const notes = document.getElementById('candidate-notes') as HTMLElement;
    expect(within(notes).getByText(/It does not create a candidate/)).toBeInTheDocument();
    expect(within(notes).getByText(/never AVOID_CANDIDATE by default/)).toBeInTheDocument();
  });
});

describe('the company page carries the holding disposition when the URL supplies context', () => {
  it('reads the held disposition for exactly that portfolio and security', async () => {
    const fetchMock = stub((url) =>
      url.includes('/holding/') ? jsonOk(DISPOSITION_ENVELOPE) : url.includes('/changes') || url.includes('/boundaries') ? new Response('', { status: 404 }) : jsonOk(ASSESSMENT_ENVELOPE),
    );
    render(
      <MemoryRouter
        initialEntries={[
          `/investment/company/${encodeURIComponent(ISSUER)}?portfolioId=${PORTFOLIO}&securityId=${encodeURIComponent(SECURITY)}`,
        ]}
      >
        <Routes>
          <Route path="/investment/company/:issuerId" element={<CompanyAssessmentPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    expect(await screen.findByText('HELD POSITION')).toBeInTheDocument();
    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls).toContain(
      `/api/investment/portfolio/${encodeURIComponent(PORTFOLIO)}/holding/${encodeURIComponent(SECURITY)}`,
    );
  });
});
