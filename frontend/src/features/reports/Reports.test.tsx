/**
 * NP-06 Reports — component and routing tests (CV-51).
 *
 * Covers loading/empty/populated list states, cursor pagination (including failure
 * preservation), the four ordered D8 disclosure levels, verbatim payload rendering
 * (`null` → `unavailable`, never `0`), supersession navigation with stale-response
 * protection, partition-literal non-disclosure, sanitized failure states with Retry
 * recovery, and keyboard operability. The transport is mocked at the fetch boundary;
 * all fixtures are isolated test data in the real persisted wire shape.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { ReportsWorkspace } from './ReportsWorkspace';
import { ReportDetail } from './ReportDetail';

const V2_ID = '33333333-3333-4333-8333-333333333333';
const V1_ID = '22222222-2222-4222-8222-222222222222';

function wireArtifact(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    reportKey: 'c'.repeat(64),
    reportId: V2_ID,
    reportType: 'Portfolio Summary',
    portfolioId: 'P-100',
    scenario: 'Balanced',
    parameters: { horizon: '12m' },
    schemaVersion: 1,
    artifactVersion: 2,
    supersedesReportId: V1_ID,
    generatedAt: '2026-10-25T01:00:00.000Z',
    canonicalPayload: JSON.stringify({
      scenario: 'Balanced',
      concentration: 42.5,
      diversificationScore: null,
      sectorExposure: { Banking: 60, Energy: 40 },
    }),
    ownership: { tenantId: 'irr-reports-personal', userId: 'owner-irr-reports-personal' },
    provenance: { engineOutputId: 'report-portfolio-summary-P-100', source: 'CSIP stage-10' },
    ...overrides,
  };
}

const V2 = wireArtifact();
const V1 = wireArtifact({
  reportId: V1_ID,
  reportKey: 'd'.repeat(64),
  artifactVersion: 1,
  supersedesReportId: null,
  generatedAt: '2026-10-25T00:00:00.000Z',
  canonicalPayload: JSON.stringify({ scenario: 'Balanced', concentration: 40, diversificationScore: 55 }),
});

const CONTEXT_BODY = {
  data: {
    surfaceName: 'NP-06',
    disposition: 'ESTABLISHED',
    tenantId: 'irr-reports-personal',
    ownerUserId: 'owner-irr-reports-personal',
  },
};

type Handler = (url: string) => { ok: boolean; status: number; body: unknown } | Promise<{ ok: boolean; status: number; body: unknown }>;

let handler: Handler;

function defaultHandler(url: string) {
  if (url.startsWith('/api/reports/context')) return { ok: true, status: 200, body: CONTEXT_BODY };
  if (url.includes('/supersession')) {
    if (url.includes(V2_ID) || url.includes(V1_ID)) {
      return { ok: true, status: 200, body: { data: { current: V2, history: [V1] } } };
    }
    return { ok: false, status: 404, body: { error: 'report-not-found' } };
  }
  if (url === `/api/reports/artifacts/${V2_ID}`) return { ok: true, status: 200, body: { data: V2 } };
  if (url === `/api/reports/artifacts/${V1_ID}`) return { ok: true, status: 200, body: { data: V1 } };
  if (url.startsWith('/api/reports/artifacts/')) return { ok: false, status: 404, body: { error: 'report-not-found' } };
  if (url.startsWith('/api/reports/artifacts')) return { ok: true, status: 200, body: { data: [V2], nextCursor: null } };
  return { ok: false, status: 404, body: { error: 'report-not-found' } };
}

beforeEach(() => {
  handler = defaultHandler;
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    void init;
    const result = await handler(String(input));
    return { ok: result.ok, status: result.status, json: async () => result.body } as Response;
  }) as typeof fetch;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function renderReports(initialPath = '/reports') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/reports" element={<ReportsWorkspace />} />
        <Route path="/reports/:reportId" element={<ReportDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

function expectNoPartitionLiterals() {
  expect(document.body.textContent).not.toContain('irr-reports-personal');
  expect(document.body.textContent).not.toContain('owner-irr-reports-personal');
}

describe('ReportsWorkspace (/reports)', () => {
  it('renders loading, then the empty state for an empty governed store', async () => {
    handler = (url) =>
      url.startsWith('/api/reports/context')
        ? { ok: true, status: 200, body: CONTEXT_BODY }
        : { ok: true, status: 200, body: { data: [], nextCursor: null } };
    renderReports();
    expect(screen.getByTestId('state-loading')).toBeInTheDocument();
    expect(await screen.findByTestId('reports-empty')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    expectNoPartitionLiterals();
  });

  it('renders the populated current-head list with governed posture and no write controls', async () => {
    renderReports();
    expect(await screen.findByTestId('reports-head-table')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Portfolio Summary' })).toHaveAttribute('href', `/reports/${V2_ID}`);
    expect(screen.getByText('CURRENT HEAD')).toBeInTheDocument();
    expect(document.body.textContent).toContain('Single-owner governed partition (NP-06 · server-owned carrier)');
    // Read-only surface: no creation, generation, export, or supersession-write controls.
    expect(screen.queryByRole('button', { name: /create|generate|export|supersede|append|upload/i })).not.toBeInTheDocument();
    expectNoPartitionLiterals();
  });

  it('appends the next cursor page without duplicating report identifiers', async () => {
    handler = (url) => {
      if (url.startsWith('/api/reports/context')) return { ok: true, status: 200, body: CONTEXT_BODY };
      if (url.includes('cursor=page-2')) return { ok: true, status: 200, body: { data: [V1], nextCursor: null } };
      return { ok: true, status: 200, body: { data: [V2], nextCursor: 'page-2' } };
    };
    const user = userEvent.setup();
    renderReports();
    expect(await screen.findByTestId('reports-head-table')).toBeInTheDocument();
    await user.click(screen.getByTestId('reports-load-more'));
    await waitFor(() => expect(screen.getAllByTestId(/report-link-/)).toHaveLength(2));
    expect(screen.queryByTestId('reports-load-more')).not.toBeInTheDocument();
  });

  it('preserves loaded rows when a pagination fetch fails and offers retry', async () => {
    let pageTwoAttempts = 0;
    handler = (url) => {
      if (url.startsWith('/api/reports/context')) return { ok: true, status: 200, body: CONTEXT_BODY };
      if (url.includes('cursor=page-2')) {
        pageTwoAttempts += 1;
        if (pageTwoAttempts === 1) return { ok: false, status: 500, body: { error: 'reports-transport-error', detail: '/secret/x' } };
        return { ok: true, status: 200, body: { data: [V1], nextCursor: null } };
      }
      return { ok: true, status: 200, body: { data: [V2], nextCursor: 'page-2' } };
    };
    const user = userEvent.setup();
    renderReports();
    expect(await screen.findByTestId('reports-head-table')).toBeInTheDocument();
    await user.click(screen.getByTestId('reports-load-more'));
    expect(await screen.findByTestId('reports-pagination-error')).toBeInTheDocument();
    expect(screen.getByTestId('reports-head-table')).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('/secret/');
    await user.click(screen.getByTestId('reports-load-more'));
    await waitFor(() => expect(screen.getAllByTestId(/report-link-/)).toHaveLength(2));
  });

  it('shows the sanitized owner-context 503 state and recovers after Retry', async () => {
    let artifactsAttempts = 0;
    handler = (url) => {
      if (url.startsWith('/api/reports/context')) {
        return { ok: false, status: 503, body: { error: 'owner-context-unavailable', detail: { reason: '/secret/carrier' } } };
      }
      artifactsAttempts += 1;
      if (artifactsAttempts === 1) {
        return { ok: false, status: 503, body: { error: 'owner-context-unavailable', detail: { reason: '/secret/carrier' } } };
      }
      return { ok: true, status: 200, body: { data: [V2], nextCursor: null } };
    };
    const user = userEvent.setup();
    renderReports();
    expect(await screen.findByTestId('reports-unavailable-owner')).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('/secret/');
    await user.click(screen.getByTestId('reports-retry'));
    expect(await screen.findByTestId('reports-head-table')).toBeInTheDocument();
  });

  it('shows persistence-unavailable from /artifacts even when /context succeeds', async () => {
    handler = (url) =>
      url.startsWith('/api/reports/context')
        ? { ok: true, status: 200, body: CONTEXT_BODY }
        : { ok: false, status: 503, body: { error: 'persistence-unavailable', reason: 'SQLITE_CANTOPEN /secret/db' } };
    renderReports();
    expect(await screen.findByTestId('reports-unavailable-persistence')).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('SQLITE');
    expect(document.body.textContent).not.toContain('/secret/');
    expect(screen.getByTestId('reports-retry')).toBeInTheDocument();
  });
});

describe('ReportDetail (/reports/:reportId)', () => {
  it('renders all four disclosure levels in exact D8 order with verbatim values', async () => {
    renderReports(`/reports/${V2_ID}`);
    const summary = await screen.findByTestId('report-section-summary');
    const detail = screen.getByTestId('report-section-detail');
    const provenance = screen.getByTestId('report-section-provenance');
    const reference = screen.getByTestId('report-section-reference');
    expect(summary.compareDocumentPosition(detail) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(detail.compareDocumentPosition(provenance) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(provenance.compareDocumentPosition(reference) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(screen.getByRole('heading', { name: 'Report — Portfolio Summary' })).toBeInTheDocument();
    expect(summary.textContent).toContain('CURRENT HEAD');
    expect(summary.textContent).toContain('Single-owner governed partition');
    expect(detail.textContent).toContain('42.5');
    // null recorded metric renders `unavailable`, never a fabricated `0`.
    expect(detail.textContent).toContain('unavailable');
    expect(detail.textContent).not.toMatch(/diversificationScore\s*0(?!\.)/);
    expect(provenance.textContent).toContain('report-portfolio-summary-P-100');
    expect(provenance.textContent).toContain('c'.repeat(64));
    expect(reference.textContent).toContain(V2_ID);
    expect(reference.textContent).toContain('does not re-execute');
    expectNoPartitionLiterals();
  });

  it('navigates list → current head → superseded version and back to the head', async () => {
    const user = userEvent.setup();
    renderReports('/reports');
    await user.click(await screen.findByRole('link', { name: 'Portfolio Summary' }));
    expect(await screen.findByTestId('report-section-summary')).toBeInTheDocument();
    expect(screen.getByTestId('report-section-summary').textContent).toContain('CURRENT HEAD');

    const v1Links = screen.getAllByRole('link', { name: /View v1/ });
    await user.click(v1Links[0] as HTMLElement);
    expect(await screen.findByTestId('report-superseded-banner')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View current head \(v2\)/ })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /View current head \(v2\)/ }));
    await waitFor(() => expect(screen.queryByTestId('report-superseded-banner')).not.toBeInTheDocument());
    expect(screen.getByTestId('report-section-summary').textContent).toContain('v2');
    expectNoPartitionLiterals();
  });

  it('discards a stale in-flight version response after rapid version switching', async () => {
    let releaseV1Artifact: (() => void) | undefined;
    handler = (url) => {
      if (url.startsWith('/api/reports/context')) return { ok: true, status: 200, body: CONTEXT_BODY };
      if (url.includes('/supersession')) return { ok: true, status: 200, body: { data: { current: V2, history: [V1] } } };
      if (url === `/api/reports/artifacts/${V1_ID}`) {
        return new Promise((resolve) => {
          releaseV1Artifact = () => resolve({ ok: true, status: 200, body: { data: V1 } });
        });
      }
      if (url === `/api/reports/artifacts/${V2_ID}`) return { ok: true, status: 200, body: { data: V2 } };
      if (url.startsWith('/api/reports/artifacts')) return { ok: true, status: 200, body: { data: [V2], nextCursor: null } };
      return { ok: false, status: 404, body: { error: 'report-not-found' } };
    };
    const user = userEvent.setup();
    function Harness() {
      const navigate = useNavigate();
      return (
        <>
          <button type="button" onClick={() => navigate(`/reports/${V1_ID}`)}>
            go-v1
          </button>
          <button type="button" onClick={() => navigate(`/reports/${V2_ID}`)}>
            go-v2
          </button>
          <Routes>
            <Route path="/reports" element={<ReportsWorkspace />} />
            <Route path="/reports/:reportId" element={<ReportDetail />} />
          </Routes>
        </>
      );
    }
    render(
      <MemoryRouter initialEntries={[`/reports/${V2_ID}`]}>
        <Harness />
      </MemoryRouter>,
    );
    expect(await screen.findByTestId('report-section-summary')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'go-v1' }));
    await user.click(screen.getByRole('button', { name: 'go-v2' }));
    await waitFor(() => expect(screen.getByTestId('report-section-summary').textContent).toContain('v2'));
    releaseV1Artifact?.();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByTestId('report-section-summary').textContent).toContain('v2');
    expect(screen.queryByTestId('report-superseded-banner')).not.toBeInTheDocument();
  });

  it('shows the indistinguishable 404 state for an unknown report identifier', async () => {
    renderReports('/reports/99999999-9999-4999-8999-999999999999');
    expect(await screen.findByTestId('reports-not-found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Reports' })).toHaveAttribute('href', '/reports');
  });

  it('supports keyboard traversal: focus the version link and activate with Enter', async () => {
    const user = userEvent.setup();
    renderReports(`/reports/${V2_ID}`);
    expect(await screen.findByTestId('report-section-summary')).toBeInTheDocument();
    const v1Link = screen.getAllByRole('link', { name: /View v1/ })[0] as HTMLElement;
    v1Link.focus();
    expect(document.activeElement).toBe(v1Link);
    await user.keyboard('{Enter}');
    expect(await screen.findByTestId('report-superseded-banner')).toBeInTheDocument();
  });

  it('shows sanitized transport failure with Retry and recovers', async () => {
    let detailAttempts = 0;
    handler = (url) => {
      if (url.startsWith('/api/reports/context')) return { ok: true, status: 200, body: CONTEXT_BODY };
      if (url.includes('/supersession')) return { ok: true, status: 200, body: { data: { current: V2, history: [V1] } } };
      if (url === `/api/reports/artifacts/${V2_ID}`) {
        detailAttempts += 1;
        if (detailAttempts === 1) {
          return { ok: false, status: 500, body: { error: 'reports transport error', detail: 'stack /secret/path' } };
        }
        return { ok: true, status: 200, body: { data: V2 } };
      }
      return { ok: true, status: 200, body: { data: [V2], nextCursor: null } };
    };
    const user = userEvent.setup();
    renderReports(`/reports/${V2_ID}`);
    expect(await screen.findByTestId('reports-error')).toBeInTheDocument();
    expect(document.body.textContent).not.toContain('/secret/');
    await user.click(screen.getByTestId('reports-retry'));
    expect(await screen.findByTestId('report-section-summary')).toBeInTheDocument();
    expectNoPartitionLiterals();
  });
});
