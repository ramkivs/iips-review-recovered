/**
 * IID-6 — the routes the product surface adds, and the read-only invariant across all of them (AC-6.1 / AC-U1).
 *
 * This is a MOUNT test, not a rendering test: the surfaces are tested in their own files. What it proves is that the
 * routes exist at the paths the roadmap names, that mounting them issues GET requests only, and that a degraded
 * backend produces a sanitized notice rather than an empty page or a stack trace in the DOM.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { App } from './App';
import { ROUTES } from './routes';
import { ISSUER, SECURITY } from '../features/investment/iid6Fixtures';

type Call = { url: string; method: string };

function stubAllDegraded(status = 404, body: unknown = { error: 'investment-assessment-missing' }) {
  const calls: Call[] = [];
  const mock = vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, method: init?.method ?? 'GET' });
    return new Response(JSON.stringify(body), { status });
  });
  vi.stubGlobal('fetch', mock);
  return calls;
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the IID-6 routes exist at the documented paths', () => {
  it('declares the coverage and candidate routes beside the company assessment route', () => {
    expect(ROUTES.companyAssessment).toBe('/investment/company/:issuerId');
    expect(ROUTES.investmentCoverage).toBe('/investment/coverage');
    expect(ROUTES.candidateAssessment).toBe('/investment/candidate/:securityId');
    // The IID-1 path is retained as an alias rather than moved.
    expect(ROUTES.identityCoverage).toBe('/identity-coverage');
  });

  it.each([
    ['/investment/company/IN%3AEQISIN%3AIN0000000201', /company assessment/i],
    ['/investment/coverage', /coverage/i],
    ['/investment/candidate/IN%3AISIN%3AIN0000000201', /candidate assessment/i],
  ])('mounts %s without throwing', async (path, heading) => {
    stubAllDegraded();
    renderAt(path);
    // The page renders its own heading even when the read fails.
    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  });
});

describe('no investment route writes', () => {
  it.each([
    `/investment/company/${encodeURIComponent(ISSUER)}`,
    '/investment/coverage',
    `/investment/candidate/${encodeURIComponent(SECURITY)}`,
  ])('issues GET-only requests from %s', async (path) => {
    const calls = stubAllDegraded(503, { error: 'investment-persistence-unavailable' });
    renderAt(path);
    // Each surface renders a sanitized notice in its own region; wait for the read to have been attempted.
    await waitFor(() => expect(calls.length).toBeGreaterThan(0));
    await screen.findByText(/unavailable|could not be loaded/i);

    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      expect(call.method).toBe('GET');
      expect(call.url).not.toMatch(/\/(record|generate|append|publish)/);
    }
  });

  it('renders no write affordance on a degraded investment page', async () => {
    stubAllDegraded(503, { error: 'investment-persistence-unavailable' });
    const { container } = renderAt(`/investment/company/${encodeURIComponent(ISSUER)}`);
    await screen.findByRole('alert');

    expect(container.querySelectorAll('input, select, textarea, form')).toHaveLength(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(container.textContent).not.toContain('investment.db');
  });

  it('keeps the coverage alias rendering the same read model', async () => {
    const calls = stubAllDegraded();
    renderAt('/identity-coverage');
    await screen.findByRole('heading', { name: /coverage/i });
    expect(calls.some((call) => call.url.startsWith('/api/investment/coverage'))).toBe(true);
  });
});
