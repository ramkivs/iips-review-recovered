/**
 * NP-06 Reports — live UI verification against the ACTUAL persisted artifacts.
 *
 * AUTHORITY
 *   PA IMPLEMENTATION AUTHORIZATION — NP-06 REAL REPORT PERSISTENCE (2026-11-05).
 *
 * WHAT THIS PROVES
 *   The read-only Reports UI renders the artifacts that the running Reports API actually
 *   returns from the NP-04 governed store. The test fetches the live context and artifact page
 *   from `IIPS_REPORTS_API_URL`, then mounts the real `ReportsWorkspace` with that exact
 *   response. It is not a fixture test: the report IDs, types, portfolio IDs and keys are the
 *   persisted values.
 *
 * HOW TO RUN
 *   Start the transport with the same carrier and NP-04 database used by the persistence
 *   invocation, then:
 *     IIPS_REPORTS_API_URL=http://127.0.0.1:8787 npx vitest run \
 *       src/features/reports/ReportsRealData.test.tsx
 *
 * The test is skipped when `IIPS_REPORTS_API_URL` is unset, so it does not affect the default
 * suite. It issues GET requests only; the UI remains read-only.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ReportsWorkspace } from './ReportsWorkspace';

const API_BASE = process.env.IIPS_REPORTS_API_URL;

interface LiveArtifact {
  readonly reportId: string;
  readonly reportType: string;
  readonly portfolioId: string;
}

interface LiveContext {
  readonly data: {
    readonly surfaceName: string;
    readonly disposition: string;
    readonly tenantId: string;
    readonly ownerUserId: string;
  };
}

interface LivePage {
  readonly data: readonly LiveArtifact[];
  readonly nextCursor: string | null;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe.skipIf(API_BASE === undefined)('NP-06 Reports — live persisted data', () => {
  it('renders the actual persisted report artifacts returned by the Reports API', async () => {
    const contextResponse = await fetch(`${API_BASE}/api/reports/context`);
    expect(contextResponse.status).toBe(200);
    const context = (await contextResponse.json()) as LiveContext;

    const pageResponse = await fetch(`${API_BASE}/api/reports/artifacts?limit=25`);
    expect(pageResponse.status).toBe(200);
    const page = (await pageResponse.json()) as LivePage;
    expect(page.data.length).toBeGreaterThan(0);

    // Serve the UI exactly the live API response. No fixture is substituted.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.startsWith('/api/reports/context')) {
          return { ok: true, status: 200, json: async () => context } as Response;
        }
        if (url.startsWith('/api/reports/artifacts?')) {
          return { ok: true, status: 200, json: async () => page } as Response;
        }
        return { ok: false, status: 404, json: async () => ({ error: 'not-found' }) } as Response;
      }),
    );

    render(
      <MemoryRouter initialEntries={['/reports']}>
        <Routes>
          <Route path="/reports" element={<ReportsWorkspace />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('reports-head-table')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('reports-empty')).not.toBeInTheDocument();

    for (const artifact of page.data) {
      const link = await screen.findByTestId(`report-link-${artifact.reportId}`);
      expect(link).toHaveTextContent(artifact.reportType);
    }

    // The persisted rows are the real certified reference portfolio reports.
    expect(page.data.every((artifact) => artifact.portfolioId === 'PF-REAL')).toBe(true);
    // Partition literals remain stripped from the DOM.
    expect(document.body.textContent).not.toContain('irr-reports-personal');
    expect(document.body.textContent).not.toContain('owner-irr-reports-personal');
  });
});
