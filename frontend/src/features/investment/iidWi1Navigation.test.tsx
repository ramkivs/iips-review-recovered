/**
 * IID WI-1 — P1 discoverability, P4 context preservation, P5 anchor navigation.
 *
 * These are COMPONENT tests over the real router and the real surfaces, with the read APIs stubbed. They prove the
 * navigation contract: that the three capabilities are named and reachable, that a link inside the workflow does
 * not discard the company/version/holding it was opened with, and that a fragment scrolls to a section which did
 * not exist when navigation started.
 *
 * They are NOT real-issuer end-to-end evidence. Every payload here is the existing synthetic IID-6 fixture, so
 * nothing in this file may be read as target-runtime acceptance.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { App } from '../../app/App';
import { ROUTES } from '../../app/routes';
import { NAV, visibleChildren, visibleNav } from '../../app/navigation';
import CompanyAssessmentPage from './CompanyAssessmentPage';
import CandidateAssessmentPage from './CandidateAssessmentPage';
import InvestmentLandingPage from './InvestmentLandingPage';
import ChangeTimeline from './ChangeTimeline';
import type { AssessmentVersionView } from '../../api/investment';
import {
  ASSESSMENT_ENVELOPE,
  CANDIDATE_DISPOSITION_ENVELOPE,
  CHANGES_ENVELOPE,
  BOUNDARIES_ENVELOPE,
  DISPOSITION_ENVELOPE,
  ISSUER,
  PORTFOLIO,
  SECURITY,
  version,
} from './iid6Fixtures';

function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

/** Serve the assessment chain, its changes and a held/candidate disposition; everything else 404s. */
function stubReads(overrides: (url: string) => Response | null = () => null) {
  const mock = vi.fn(async (input: string) => {
    const url = String(input);
    const override = overrides(url);
    if (override !== null) return override;
    if (url.includes('/changes/boundaries')) return jsonOk(BOUNDARIES_ENVELOPE);
    if (url.includes('/changes')) return jsonOk(CHANGES_ENVELOPE);
    if (url.includes('/holding/')) return jsonOk(DISPOSITION_ENVELOPE);
    if (url.includes('/api/investment/candidate/')) return jsonOk(CANDIDATE_DISPOSITION_ENVELOPE);
    if (url.includes('/api/investment/company/')) return jsonOk(ASSESSMENT_ENVELOPE);
    return new Response(JSON.stringify({ error: 'not-found' }), { status: 404 });
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

function renderAppAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

/** The investment routes plus a observable portfolio destination, so a return link can be clicked for real. */
function renderWorkflowAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={ROUTES.investmentIntelligence} element={<InvestmentLandingPage />} />
        <Route path={ROUTES.companyAssessment} element={<CompanyAssessmentPage />} />
        <Route path={ROUTES.candidateAssessment} element={<CandidateAssessmentPage />} />
        <Route path="/user-portfolios/:portfolioId" element={<PortfolioDestination />} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

function PortfolioDestination(): JSX.Element {
  const { pathname } = useLocation();
  return <p>portfolio destination {pathname}</p>;
}

function LocationProbe(): JSX.Element {
  const { pathname, search, hash } = useLocation();
  return <output data-testid="location">{`${pathname}${search}${hash}`}</output>;
}

const COMPANY = `/investment/company/${encodeURIComponent(ISSUER)}`;
const WITH_HOLDING = `${COMPANY}?portfolioId=${PORTFOLIO}&securityId=${encodeURIComponent(SECURITY)}`;

const ORIGINAL_SCROLL = Element.prototype.scrollIntoView;
let scrollSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  // jsdom does not implement scrolling; observe the call instead of pretending a viewport exists.
  scrollSpy = vi.fn();
  Element.prototype.scrollIntoView = scrollSpy as unknown as typeof Element.prototype.scrollIntoView;
});

afterEach(() => {
  Element.prototype.scrollIntoView = ORIGINAL_SCROLL;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/* ------------------------------------------------------------------ P1 — discoverability */

describe('P1 — the three IID capabilities are discoverable from global navigation', () => {
  it('exposes an Investment Intelligence group naming IID-01, IID-02 and IID-03', () => {
    const group = visibleNav().find((item) => item.label === 'Investment Intelligence');
    expect(group).toBeDefined();
    expect(group?.path).toBe('/investment');

    const labels = visibleChildren(group as NonNullable<typeof group>).map((child) => child.label);
    expect(labels).toEqual([
      'IID-01 — Stock Intelligence',
      'IID-02 — Investment & Holding Decisions',
      'IID-03 — Historical Change Intelligence',
    ]);
  });

  it('uses only concrete, parameter-free destinations for the group and its children', () => {
    const group = visibleNav().find((item) => item.label === 'Investment Intelligence');
    for (const path of [group?.path ?? '', ...visibleChildren(group as NonNullable<typeof group>).map((c) => c.path)]) {
      expect(path.startsWith('/investment')).toBe(true);
      expect(path).not.toContain(':');
    }
  });

  it('renders the group and all three capability links in the sidebar', () => {
    stubReads();
    renderAppAt('/executive');
    expect(screen.getByRole('link', { name: 'Investment Intelligence' })).toHaveAttribute('href', '/investment');
    for (const name of [
      'IID-01 — Stock Intelligence',
      'IID-02 — Investment & Holding Decisions',
      'IID-03 — Historical Change Intelligence',
    ]) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
  });

  it('mounts /investment as a real landing surface, not the unknown-route placeholder', async () => {
    stubReads();
    renderAppAt('/investment');
    expect(await screen.findByRole('heading', { name: 'Investment Intelligence' })).toBeInTheDocument();
    expect(screen.queryByTestId('shell-feature-unavailable')).not.toBeInTheDocument();
    for (const id of ['iid-01', 'iid-02', 'iid-03']) {
      expect(document.getElementById(id)).not.toBeNull();
    }
  });

  it('discovers all three capabilities even when coverage and every other read is unavailable', async () => {
    // Every API fails, exactly as an unconfigured runtime behaves. The landing page must still name the three.
    stubReads(() => new Response(JSON.stringify({ error: 'identity-sources-unavailable' }), { status: 503 }));
    renderAppAt('/investment');

    expect(await screen.findByRole('heading', { name: 'IID-01 — Stock Intelligence' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IID-02 — Investment & Holding Decisions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IID-03 — Historical Change Intelligence' })).toBeInTheDocument();
    // It reads nothing at all, so coverage availability cannot affect discovery.
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not present Investment Coverage as one of the three capabilities', async () => {
    stubReads();
    renderAppAt('/investment');
    await screen.findByRole('heading', { name: 'Investment Intelligence' });

    const aids = document.getElementById('finding-identifiers') as HTMLElement;
    expect(within(aids).getByRole('link', { name: /Investment coverage/ })).toBeInTheDocument();
    expect(aids.textContent).toContain('it is not a company assessment, not a decision and not a change history');
    // Coverage remains its own separate global entry, not a capability child.
    const group = NAV.find((item) => item.label === 'Investment Intelligence');
    expect(visibleChildren(group as NonNullable<typeof group>).some((c) => c.path.includes('coverage'))).toBe(false);
  });

  it('routes IID-01 entry into the existing company assessment surface', async () => {
    stubReads();
    const user = userEvent.setup();
    renderWorkflowAt('/investment');

    await user.type(screen.getByLabelText('Issuer id'), ISSUER);
    await user.click(screen.getByRole('button', { name: 'Open company assessment' }));

    expect(await screen.findByTestId('location')).toHaveTextContent(COMPANY);
    expect(await screen.findByRole('heading', { name: /Aarav Systems Limited/ })).toBeInTheDocument();
  });

  it('routes IID-03 entry to the change history of the same company', async () => {
    stubReads();
    const user = userEvent.setup();
    renderWorkflowAt('/investment');

    await user.type(screen.getByLabelText('Issuer id'), ISSUER);
    await user.click(screen.getByRole('button', { name: 'Open historical changes' }));

    expect(await screen.findByTestId('location')).toHaveTextContent(`${COMPANY}#change-timeline`);
  });

  it('offers no entry control that could act on an empty identifier', async () => {
    stubReads();
    renderWorkflowAt('/investment');
    await screen.findByRole('heading', { name: 'Investment Intelligence' });

    expect(screen.getByRole('button', { name: 'Open company assessment' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Open candidate decision' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Open historical changes' })).toBeDisabled();
  });
});

/* ------------------------------------------------------------------ P4 — context preservation */

describe('P4 — the selected assessment version is URL-addressable', () => {
  it('writes reportId into the URL when a stored version is selected', async () => {
    stubReads();
    const user = userEvent.setup();
    renderWorkflowAt(COMPANY);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    await user.click(screen.getByRole('button', { name: 'v1' }));

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('reportId=r-1');
    });
  });

  it('restores the version named by reportId on a fresh load, without a click', async () => {
    const v1 = JSON.parse(JSON.stringify(ASSESSMENT_ENVELOPE)) as typeof ASSESSMENT_ENVELOPE;
    v1.version = { ...v1.version, reportId: 'r-1', artifactVersion: 1 };
    const mock = stubReads((url) => (url.includes('/versions/r-1') ? jsonOk(v1) : null));

    renderWorkflowAt(`${COMPANY}?reportId=r-1`);

    expect(await screen.findByRole('heading', { name: /Aarav Systems Limited/ })).toBeInTheDocument();
    expect(mock.mock.calls.some(([url]) => String(url).includes('/versions/r-1'))).toBe(true);
    expect(await screen.findByRole('button', { name: 'v1' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Viewing v1/)).toBeInTheDocument();
  });

  it('keeps the holding context when the version changes', async () => {
    stubReads();
    const user = userEvent.setup();
    renderWorkflowAt(WITH_HOLDING);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    await user.click(screen.getByRole('button', { name: 'v1' }));

    await waitFor(() => {
      const location = screen.getByTestId('location').textContent ?? '';
      expect(location).toContain('reportId=r-1');
      expect(location).toContain(`portfolioId=${PORTFOLIO}`);
      expect(location).toContain(`securityId=${encodeURIComponent(SECURITY)}`);
    });
  });

  it('walks back and forward through visited versions coherently', async () => {
    const v1 = JSON.parse(JSON.stringify(ASSESSMENT_ENVELOPE)) as typeof ASSESSMENT_ENVELOPE;
    v1.version = { ...v1.version, reportId: 'r-1', artifactVersion: 1 };
    stubReads((url) => (url.includes('/versions/r-1') ? jsonOk(v1) : null));
    const user = userEvent.setup();

    // A history-enabled router: clicking a version pushes, so back must return to the head.
    render(
      <MemoryRouter initialEntries={[COMPANY]}>
        <Routes>
          <Route path={ROUTES.companyAssessment} element={<CompanyAssessmentPage />} />
        </Routes>
        <LocationProbe />
        <HistoryControls />
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    await user.click(screen.getByRole('button', { name: 'v1' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('reportId=r-1'));

    await user.click(screen.getByRole('button', { name: 'history back' }));
    await waitFor(() => expect(screen.getByTestId('location')).not.toHaveTextContent('reportId=r-1'));

    await user.click(screen.getByRole('button', { name: 'history forward' }));
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('reportId=r-1'));
  });
});

/** `navigate(-1)` / `navigate(1)` drive the router's own POP, so back/forward is exercised, not simulated. */
function HistoryControls(): JSX.Element {
  const navigate = useNavigate();
  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        history back
      </button>
      <button type="button" onClick={() => navigate(1)}>
        history forward
      </button>
    </>
  );
}

describe('P4 — holding context survives the workflow', () => {
  it('renders a return link to the exact originating portfolio, and it navigates there', async () => {
    stubReads();
    const user = userEvent.setup();
    renderWorkflowAt(WITH_HOLDING);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const nav = screen.getByRole('navigation', { name: 'Investment workflow' });
    const back = within(nav).getByRole('link', { name: /Back to portfolio/ });
    expect(back).toHaveAttribute('href', `/user-portfolios/${PORTFOLIO}`);

    await user.click(back);
    expect(await screen.findByText(`portfolio destination /user-portfolios/${PORTFOLIO}`)).toBeInTheDocument();
  });

  it('renders no portfolio return link when no portfolio context was supplied', async () => {
    stubReads();
    renderWorkflowAt(COMPANY);
    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const nav = screen.getByRole('navigation', { name: 'Investment workflow' });
    expect(within(nav).queryByRole('link', { name: /Back to portfolio/ })).toBeNull();
  });

  it('keeps the displayed version and holding on every workflow stage link', async () => {
    stubReads();
    renderWorkflowAt(`${WITH_HOLDING}&reportId=r-2`);
    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });

    const nav = screen.getByRole('navigation', { name: 'Investment workflow' });
    for (const name of ['Fundamentals', 'Valuation', 'Risk', 'Disposition', 'Portfolio impact', 'Historical changes']) {
      const href = within(nav).getByRole('link', { name }).getAttribute('href') ?? '';
      expect(href).toContain(`portfolioId=${PORTFOLIO}`);
      expect(href).toContain(`securityId=${encodeURIComponent(SECURITY)}`);
      expect(href).toContain('reportId=');
      expect(href).toContain('#');
    }
  });

  it('addresses the portfolio-impact stage, and offers no dead anchor when there is no holding', async () => {
    stubReads();
    const user = userEvent.setup();
    // The real App, because the scroll hook is mounted by AppShell — a bare Routes harness would not exercise it.
    const { unmount } = renderAppAt(WITH_HOLDING);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const nav = screen.getByRole('navigation', { name: 'Investment workflow' });
    await user.click(within(nav).getByRole('link', { name: 'Portfolio impact' }));

    // The held disposition loads asynchronously, so the anchor appears after the stage link is followed.
    await waitFor(() => {
      const target = document.getElementById('portfolio-impact');
      expect(target).not.toBeNull();
      expect(scrollSpy.mock.contexts[scrollSpy.mock.contexts.length - 1]).toBe(target);
    });
    unmount();

    scrollSpy.mockClear();
    renderAppAt(COMPANY);
    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const withoutHolding = screen.getByRole('navigation', { name: 'Investment workflow' });
    expect(within(withoutHolding).queryByRole('link', { name: 'Portfolio impact' })).toBeNull();
    expect(document.getElementById('portfolio-impact')).toBeNull();
  });

  it('carries the originating portfolio and security on the candidate-to-company back-link', async () => {
    stubReads();
    renderWorkflowAt(`/investment/candidate/${encodeURIComponent(SECURITY)}?portfolio=${PORTFOLIO}`);

    const link = await screen.findByRole('link', { name: /Open the current company assessment/ });
    const href = link.getAttribute('href') ?? '';
    expect(href).toContain(COMPANY);
    expect(href).toContain(`portfolioId=${PORTFOLIO}`);
    expect(href).toContain(`securityId=${encodeURIComponent(SECURITY)}`);
  });

  it('adds no portfolio to the candidate back-link when none was supplied', async () => {
    stubReads();
    renderWorkflowAt(`/investment/candidate/${encodeURIComponent(SECURITY)}`);

    const link = await screen.findByRole('link', { name: /Open the current company assessment/ });
    const href = link.getAttribute('href') ?? '';
    expect(href).toContain(COMPANY);
    expect(href).not.toContain('portfolioId=');
  });
});

describe('P4 — historical comparisons open the stored version they compare', () => {
  const VERSIONS = [version('r-1', 1), version('r-2', 2)] as unknown as readonly AssessmentVersionView[];

  it('links each side of a pair to that exact reportId, keeping the holding context', async () => {
    stubReads();
    render(
      <MemoryRouter initialEntries={[WITH_HOLDING]}>
        <ChangeTimeline
          issuerId={ISSUER}
          versions={VERSIONS}
          context={{ portfolioId: PORTFOLIO, securityId: SECURITY }}
        />
      </MemoryRouter>,
    );

    const from = await screen.findByRole('link', { name: 'Open v1' });
    const to = screen.getByRole('link', { name: 'Open v2' });
    for (const [link, reportId] of [[from, 'r-1'], [to, 'r-2']] as const) {
      const href = link.getAttribute('href') ?? '';
      expect(href).toContain(COMPANY);
      expect(href).toContain(`reportId=${reportId}`);
      expect(href).toContain(`portfolioId=${PORTFOLIO}`);
      expect(href).toContain(`securityId=${encodeURIComponent(SECURITY)}`);
    }
  });

  it('opens the intended assessment version when a comparison link is followed', async () => {
    const v1 = JSON.parse(JSON.stringify(ASSESSMENT_ENVELOPE)) as typeof ASSESSMENT_ENVELOPE;
    v1.version = { ...v1.version, reportId: 'r-1', artifactVersion: 1 };
    const mock = stubReads((url) => (url.includes('/versions/r-1') ? jsonOk(v1) : null));
    const user = userEvent.setup();
    renderWorkflowAt(WITH_HOLDING);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    await user.click(await screen.findByRole('link', { name: 'Open v1' }));

    await waitFor(() => {
      expect(mock.mock.calls.some(([url]) => String(url).includes('/versions/r-1'))).toBe(true);
    });
    expect(await screen.findByText(/Viewing v1/)).toBeInTheDocument();
    const location = screen.getByTestId('location').textContent ?? '';
    expect(location).toContain(`portfolioId=${PORTFOLIO}`);
    expect(location).toContain(`securityId=${encodeURIComponent(SECURITY)}`);
  });

  it('adds no write affordance: the new comparison entries are links, not buttons', async () => {
    stubReads();
    const { container } = render(
      <MemoryRouter>
        <ChangeTimeline issuerId={ISSUER} versions={VERSIONS} />
      </MemoryRouter>,
    );
    await screen.findByRole('link', { name: 'Open v1' });
    for (const button of screen.getAllByRole('button')) {
      expect(button.textContent).toMatch(/^(Compare|Showing) v\d+ → v\d+$/);
    }
    expect(container.querySelectorAll('input, select, textarea, form')).toHaveLength(0);
  });
});

/* ------------------------------------------------------------------ P5 — anchor navigation */

describe('P5 — in-app navigation to #change-timeline scrolls to the real timeline', () => {
  it('scrolls after the asynchronously loaded assessment renders the section', async () => {
    stubReads();
    renderAppAt(`${COMPANY}#change-timeline`);

    // The target does not exist on the first paint; the hook must wait for the read to resolve.
    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalled();
    });
    const target = document.getElementById('change-timeline') as HTMLElement;
    expect(target).not.toBeNull();
    expect(scrollSpy.mock.instances.length).toBeGreaterThan(0);
    expect(
      scrollSpy.mock.contexts.some(
        (context) => context === target,
      ),
    ).toBe(true);
  });

  it('scrolls on a subsequent in-app navigation to the anchor, not only on first load', async () => {
    stubReads();
    const user = userEvent.setup();
    renderAppAt(WITH_HOLDING);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    scrollSpy.mockClear();

    const nav = screen.getByRole('navigation', { name: 'Investment workflow' });
    await user.click(within(nav).getByRole('link', { name: 'Historical changes' }));

    await waitFor(() => {
      const target = document.getElementById('change-timeline');
      expect(target).not.toBeNull();
      const contexts = scrollSpy.mock.contexts;
      expect(contexts[contexts.length - 1]).toBe(target);
    });
  });

  it('preserves the company and holding context when it scrolls', async () => {
    stubReads();
    const user = userEvent.setup();
    renderWorkflowAt(WITH_HOLDING);

    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    const nav = screen.getByRole('navigation', { name: 'Investment workflow' });
    await user.click(within(nav).getByRole('link', { name: 'Historical changes' }));

    await waitFor(() => {
      const location = screen.getByTestId('location').textContent ?? '';
      expect(location).toContain(COMPANY);
      expect(location).toContain(`portfolioId=${PORTFOLIO}`);
      expect(location).toContain(`securityId=${encodeURIComponent(SECURITY)}`);
      expect(location).toContain('#change-timeline');
    });
  });

  it('does not scroll when the URL carries no fragment', async () => {
    stubReads();
    renderAppAt(COMPANY);
    await screen.findByRole('heading', { name: /Aarav Systems Limited/ });
    await waitFor(() => expect(screen.getByRole('navigation', { name: 'Investment workflow' })).toBeInTheDocument());
    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it('leaves a degraded assessment honest: no scroll target is invented when the read fails', async () => {
    stubReads(() => new Response(JSON.stringify({ error: 'investment-persistence-unavailable' }), { status: 503 }));
    renderAppAt(`${COMPANY}#change-timeline`);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(document.getElementById('change-timeline')).toBeNull();
    expect(scrollSpy).not.toHaveBeenCalled();
  });
});
